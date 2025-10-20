import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { getAdminConversations, sendMessage, markConversationAsRead } from '../dal/messages';
import { useAuthStore } from '../store/authStore';
import { useStaffStore } from '../store/staffStore';
import { supabase } from '../lib/supabaseClient';
import { StaffMessage, ConversationSummary, StaffMember } from '../types';

export const useAdminChat = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const allStaff = useStaffStore((state) => state.staff);
    const adminId = user?.id;

    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

    const queryKey = useMemo(() => ['adminChat', adminId], [adminId]);

    const { data: messages = [], isLoading, error } = useQuery({
        queryKey: queryKey,
        queryFn: () => {
            if (!adminId) return Promise.resolve([]);
            return getAdminConversations(adminId);
        },
        enabled: !!adminId,
    });

    const conversations = useMemo((): ConversationSummary[] => {
        if (!messages.length || !allStaff.length) return [];

        const conversationsMap = new Map<string, { lastMessage: StaffMessage, unreadCount: number }>();
        const staffMap = new Map<string, StaffMember>(allStaff.map(s => [s.id, s]));

        messages.forEach(msg => {
            const staffMemberId = msg.senderId === adminId ? msg.recipientId : msg.senderId;
            if (staffMemberId === adminId) return; // Skip messages sent to self

            const existing = conversationsMap.get(staffMemberId);
            const isUnread = msg.recipientId === adminId && !msg.isRead;

            if (!existing || new Date(msg.createdAt) > new Date(existing.lastMessage.createdAt)) {
                conversationsMap.set(staffMemberId, {
                    lastMessage: msg,
                    unreadCount: (existing?.unreadCount || 0) + (isUnread ? 1 : 0),
                });
            } else {
                 if (isUnread) {
                    existing.unreadCount += 1;
                }
            }
        });

        const summaries: ConversationSummary[] = [];
        conversationsMap.forEach((value, staffId) => {
            const staffMember = staffMap.get(staffId);
            if (staffMember) {
                summaries.push({ staffMember, ...value });
            }
        });

        return summaries.sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());

    }, [messages, allStaff, adminId]);
    
    const selectedConversationMessages = useMemo(() => {
        if (!selectedStaffId) return [];
        return messages.filter(m => (m.senderId === selectedStaffId && m.recipientId === adminId) || (m.senderId === adminId && m.recipientId === selectedStaffId));
    }, [messages, selectedStaffId, adminId]);


    const { mutate: postMessage, isPending: isSending } = useMutation({
        mutationFn: (content: string) => {
            if (!adminId || !selectedStaffId) throw new Error("Cannot send message: user or recipient not found.");
            return sendMessage(adminId, selectedStaffId, content);
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey });
        },
    });
    
    const selectConversation = useCallback((staffId: string) => {
        setSelectedStaffId(staffId);
        const conversation = conversations.find(c => c.staffMember.id === staffId);
        if (conversation && conversation.unreadCount > 0 && adminId) {
            markConversationAsRead(adminId, staffId).then(() => {
                queryClient.invalidateQueries({ queryKey });
            });
        }
    }, [conversations, adminId, queryClient, queryKey]);


    useEffect(() => {
        if (!adminId || !supabase) return;

        const channel = supabase.channel(`admin-chat-${adminId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'staff_messages',
                    filter: `recipient_id.eq.${adminId}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [adminId, queryClient, queryKey, supabase]);


    return {
        conversations,
        selectedStaffId,
        selectConversation,
        selectedConversationMessages,
        isLoading,
        error,
        postMessage,
        isSending,
        currentUser: user,
    };
};