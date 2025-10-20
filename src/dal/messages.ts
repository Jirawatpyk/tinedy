import { supabase } from '../lib/supabaseClient';
import { StaffMessage } from '../types';
import { Database } from '../lib/supabaseClient';

type DbStaffMessage = Database['public']['Tables']['staff_messages']['Row'];

const toStaffMessage = (dbItem: DbStaffMessage): StaffMessage => ({
    id: dbItem.id,
    createdAt: dbItem.created_at,
    senderId: dbItem.sender_id,
    recipientId: dbItem.recipient_id,
    content: dbItem.content,
    isRead: dbItem.is_read,
});

export const getMessagesForConversation = async (staffId: string, adminId: string): Promise<StaffMessage[]> => {
    if (!supabase) return [];
    
    // FIX: Corrected the Supabase .or() filter syntax to handle complex AND/OR logic.
    // The previous syntax `(A,B),(C,D)` was incorrect and caused a "failed to parse logic tree" error.
    // The correct syntax is `or(and(A,B),and(C,D))` to combine multiple AND conditions within an OR.
    const { data, error } = await supabase
        .from('staff_messages')
        .select('*')
        .or(`and(sender_id.eq.${staffId},recipient_id.eq.${adminId}),and(sender_id.eq.${adminId},recipient_id.eq.${staffId})`)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data.map(toStaffMessage);
};

export const getAdminConversations = async (adminId: string): Promise<StaffMessage[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('staff_messages')
        .select('*')
        .or(`sender_id.eq.${adminId},recipient_id.eq.${adminId}`)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data.map(toStaffMessage);
}


export const sendMessage = async (senderId: string, recipientId: string, content: string): Promise<StaffMessage> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");

    const payload: Database['public']['Tables']['staff_messages']['Insert'] = {
        sender_id: senderId,
        recipient_id: recipientId,
        content: content,
    };

    const { data, error } = await supabase
        .from('staff_messages')
        .insert([payload])
        .select()
        .single();
    
    if (error) throw error;
    return toStaffMessage(data);
};

export const getUnreadMessagesForStaff = async (staffId: string): Promise<StaffMessage[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('staff_messages')
        .select('*', { count: 'exact' })
        .eq('recipient_id', staffId)
        .eq('is_read', false);

    if (error) throw error;
    return data.map(toStaffMessage);
};

export const markConversationAsRead = async (readerId: string, senderId: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    
    const { error } = await supabase
        .from('staff_messages')
        .update({ is_read: true })
        .eq('recipient_id', readerId)
        .eq('sender_id', senderId)
        .eq('is_read', false);
        
    if (error) throw error;
};