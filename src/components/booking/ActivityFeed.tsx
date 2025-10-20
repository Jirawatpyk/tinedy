import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Booking, User, StaffMember, ToastType, BookingComment, AuditLog, AuditAction } from '../../types';
import { getCommentsForBooking, addComment, deleteComment } from '../../dal/comments';
import { getAuditLogsForBooking } from '../../dal/audit';
import { supabase, Database } from '../../lib/supabaseClient';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useAuditStore } from '../../store/auditStore';
import { useNotificationStore } from '../../store/notificationStore';
import { ChatBubbleLeftEllipsisIcon, PaperAirplaneIcon } from '../ui/icons';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import ConfirmationModal from '../ui/ConfirmationModal';
import ActivityItem from './ActivityItem';
import MentionTextarea from '../ui/MentionTextarea';

interface ActivityFeedProps {
    booking: Booking;
    currentUser: User;
    staff: StaffMember[];
    addToast: (message: string, type: ToastType, title: string) => void;
}

type FeedItem = (BookingComment & { itemType: 'comment' }) | (AuditLog & { itemType: 'log' });

const toBookingComment = (dbComment: Database['public']['Tables']['booking_comments']['Row']): BookingComment => ({
    id: dbComment.id,
    createdAt: dbComment.created_at,
    bookingId: dbComment.booking_id,
    authorId: dbComment.author_id,
    authorName: dbComment.author_name,
    content: dbComment.content,
});

const toAuditLog = (dbLog: Database['public']['Tables']['audit_logs']['Row']): AuditLog => ({
    id: dbLog.id,
    createdAt: dbLog.created_at,
    userEmail: dbLog.user_email,
    action: dbLog.action as AuditAction,
    details: dbLog.details || '',
    bookingId: dbLog.booking_id || undefined,
});


const ActivityFeed: React.FC<ActivityFeedProps> = ({ booking, currentUser, staff, addToast }) => {
    const [comments, setComments] = useState<BookingComment[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<BookingComment | null>(null);
    const feedContainerRef = useRef<HTMLDivElement>(null);

    const addLog = useAuditStore((state) => state.addLog);
    const addNotification = useNotificationStore(state => state.addNotification);

    useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
            try {
                const [fetchedComments, fetchedLogs] = await Promise.all([
                    getCommentsForBooking(booking.id),
                    getAuditLogsForBooking(booking.id)
                ]);
                setComments(fetchedComments);
                setAuditLogs(fetchedLogs);
            } catch (error: any) {
                addToast(error.message || "Failed to load activity feed.", 'error', 'Error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [booking.id, addToast]);
    
    useEffect(() => {
        if (!supabase) return;
        const channel = supabase.channel(`booking-activity-${booking.id}`)
            .on(
                'postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'booking_comments', filter: `booking_id=eq.${booking.id}` }, 
                (payload: RealtimePostgresChangesPayload<Database['public']['Tables']['booking_comments']['Row']>) => {
                    if (payload.new && 'id' in payload.new) {
                        const newCommentData = toBookingComment(payload.new);
                        
                        // Update local comments list, preventing duplicates from optimistic update
                        setComments(prev => {
                            if (prev.some(c => c.id === newCommentData.id)) {
                                return prev;
                            }
                            return [...prev, newCommentData];
                        });
                        
                        // --- Handle Mention Notifications ---
                        if (newCommentData.authorId === currentUser.id) {
                            return; // Don't notify self
                        }
    
                        const content = newCommentData.content;
                        const authorName = newCommentData.authorName;
                        const mentionRegex = /@([\w\s]+)/g;
                        let match;
                        
                        while ((match = mentionRegex.exec(content)) !== null) {
                            const mentionedName = match[1].trim();
                            
                            // Check if the current user is the one being mentioned
                            const currentStaffMember = staff.find(s => s.id === currentUser.id);
                            if (currentStaffMember && currentStaffMember.name === mentionedName) {
                                const mentionPref = currentUser.notificationPreferences.MENTION;
                                const shouldNotify = typeof mentionPref === 'boolean' ? mentionPref : mentionPref.enabled;
    
                                if (shouldNotify) {
                                    addNotification(
                                        `${authorName} mentioned you in a comment on booking for ${booking.customer.name}.`,
                                        'MENTION',
                                        { targetPage: 'bookings', targetId: booking.id }
                                    );
                                }
                                break; // Found mention for current user, no need to check further
                            }
                        }
                    }
                }
            )
            .on(
                'postgres_changes', 
                { event: 'DELETE', schema: 'public', table: 'booking_comments', filter: `booking_id=eq.${booking.id}` }, 
                (payload) => {
                    const deletedId = (payload.old as { id?: string })?.id;
                    if (deletedId) setComments(prev => prev.filter(c => c.id !== deletedId));
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'audit_logs', filter: `booking_id=eq.${booking.id}` },
                (payload: RealtimePostgresChangesPayload<Database['public']['Tables']['audit_logs']['Row']>) => {
                    if (payload.new && 'id' in payload.new) {
                        const newLogData = toAuditLog(payload.new);
                        setAuditLogs(prev => [...prev, newLogData]);
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [booking.id, booking.customer.name, currentUser, staff, addNotification]);

    const feedItems = useMemo((): FeedItem[] => {
        const combined = [
            ...comments.map(c => ({ ...c, itemType: 'comment' as const })),
            ...auditLogs.map(l => ({ ...l, itemType: 'log' as const }))
        ];
        return combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [comments, auditLogs]);

    // Auto-scroll to bottom when new items are added
    useEffect(() => {
        if (feedContainerRef.current) {
            feedContainerRef.current.scrollTop = feedContainerRef.current.scrollHeight;
        }
    }, [feedItems]);

    const handleSubmit = async () => {
        const content = newComment.trim();
        if (!content) return;
        setIsPosting(true);

        const currentStaffMember = staff.find(s => s.id === currentUser.id);
        const authorName = currentStaffMember?.name || currentUser.email;

        try {
            // Await the new comment data from the DAL
            const newCommentData = await addComment(booking.id, currentUser.id, authorName, content);
            
            // Manually update state for instant feedback, preventing reliance on just real-time
            setComments(prev => [...prev, newCommentData]);

            addLog(currentUser.email, 'POST_COMMENT', `Posted a comment on booking #${booking.bookingNumber} for ${booking.customer.name}.`, booking.id);
            setNewComment('');

            // The mention notification logic is now handled in the realtime subscription effect

        } catch (error: any) {
            addToast(error.message || "Could not post comment.", 'error', 'Error');
        } finally {
            setIsPosting(false);
        }
    };
    
    const handleDelete = async () => {
        if (!commentToDelete) return;
        try {
            await deleteComment(commentToDelete.id);
            addLog(currentUser.email, 'DELETE_COMMENT', `Deleted a comment by ${commentToDelete.authorName} on booking #${booking.bookingNumber} for ${booking.customer.name}.`, booking.id);
            addToast("Comment deleted.", 'success', 'Success');
        } catch (error: any) {
            addToast(error.message || "Could not delete comment.", 'error', 'Error');
        } finally {
            setCommentToDelete(null);
        }
    };

    return (
        <div className="absolute inset-0 p-4 flex flex-col h-full">
            <div className="flex items-center gap-3 p-2 mb-2 flex-shrink-0">
                <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-slate-500 dark:text-slate-400"/>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Activity Feed</h3>
            </div>
            <div ref={feedContainerRef} className="flex-grow overflow-y-auto space-y-4 p-2 -mr-1 pr-1">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full"><Loader /></div>
                ) : feedItems.length > 0 ? (
                    feedItems.map(item => (
                        <ActivityItem 
                            key={`${item.itemType}-${item.id}`}
                            item={item}
                            currentUser={currentUser}
                            onDelete={(comment) => setCommentToDelete(comment)}
                        />
                    ))
                ) : (
                    <div className="flex flex-col justify-center items-center text-center h-full p-4">
                        <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-full">
                            <ChatBubbleLeftEllipsisIcon className="w-10 h-10 text-slate-400 dark:text-slate-500"/>
                        </div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-4">No Activity Recorded</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Comments and status changes will appear here.</p>
                    </div>
                )}
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 mt-2 flex-shrink-0">
                 <MentionTextarea
                    value={newComment}
                    onChange={setNewComment}
                    onPost={handleSubmit}
                    staffList={staff}
                    isPosting={isPosting}
                    currentUser={currentUser}
                 />
            </div>

            {commentToDelete && (
                <ConfirmationModal
                    isOpen={!!commentToDelete}
                    onClose={() => setCommentToDelete(null)}
                    onConfirm={handleDelete}
                    title="Delete Comment"
                    message="Are you sure you want to permanently delete this comment?"
                    confirmButtonText="Delete"
                    confirmButtonVariant="danger"
                />
            )}
        </div>
    );
};

export default ActivityFeed;