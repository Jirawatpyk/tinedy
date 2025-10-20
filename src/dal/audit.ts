import { supabase } from '../lib/supabaseClient';
import { AuditLog, AuditAction } from '../types';
import { Database } from '../lib/supabaseClient';

type DbAuditLog = Database['public']['Tables']['audit_logs']['Row'];

const toAuditLog = (dbLog: DbAuditLog): AuditLog => ({
    id: dbLog.id,
    createdAt: dbLog.created_at,
    userEmail: dbLog.user_email,
    action: dbLog.action as AuditAction,
    details: dbLog.details || '',
    // FIX: Correctly access booking_id from the DbAuditLog type.
    bookingId: dbLog.booking_id || undefined,
});

export const getAuditLogs = async (): Promise<AuditLog[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000); // Add a reasonable limit to prevent performance issues
    
    if (error) throw error;
    return data.map(toAuditLog);
};

export const getAuditLogsForBooking = async (bookingId: string): Promise<AuditLog[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data.map(toAuditLog);
};

export const addAuditLog = async (logData: { userEmail: string, action: AuditAction, details: string, bookingId?: string }): Promise<AuditLog> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");

    const newLogPayload: Database['public']['Tables']['audit_logs']['Insert'] = {
        user_email: logData.userEmail,
        action: logData.action,
        details: logData.details,
        // FIX: Correctly map bookingId to booking_id.
        booking_id: logData.bookingId,
    };

    const { data, error } = await supabase
        .from('audit_logs')
        .insert([newLogPayload])
        .select()
        .single();
    
    if (error) throw error;
    return toAuditLog(data);
};