import { supabase } from '../lib/supabaseClient';
import { BookingComment } from '../types';
import { Database } from '../lib/supabaseClient';

type DbComment = Database['public']['Tables']['booking_comments']['Row'];

const toBookingComment = (dbComment: DbComment): BookingComment => ({
    id: dbComment.id,
    createdAt: dbComment.created_at,
    bookingId: dbComment.booking_id,
    authorId: dbComment.author_id,
    authorName: dbComment.author_name,
    content: dbComment.content,
});

export const getCommentsForBooking = async (bookingId: string): Promise<BookingComment[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('booking_comments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data.map(toBookingComment);
};

export const addComment = async (bookingId: string, authorId: string, authorName: string, content: string): Promise<BookingComment> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");

    const newCommentPayload: Database['public']['Tables']['booking_comments']['Insert'] = {
        booking_id: bookingId,
        author_id: authorId,
        author_name: authorName,
        content: content,
    };

    const { data, error } = await supabase
        .from('booking_comments')
        .insert([newCommentPayload])
        .select()
        .single();
    
    if (error) throw error;
    return toBookingComment(data);
};

export const deleteComment = async (commentId: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    const { error } = await supabase.from('booking_comments').delete().eq('id', commentId);
    if (error) throw error;
};