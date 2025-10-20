import { supabase } from '../lib/supabaseClient';
import { LeaveRequest, LeaveType, LeaveStatus } from '../types';
import { Database } from '../lib/supabaseClient';

type DbLeaveRequest = Database['public']['Tables']['leave_requests']['Row'];

const toLeaveRequest = (dbItem: DbLeaveRequest): LeaveRequest => ({
    id: dbItem.id,
    createdAt: dbItem.created_at,
    staffId: dbItem.staff_id,
    startDate: dbItem.start_date,
    endDate: dbItem.end_date,
    leaveType: dbItem.leave_type as LeaveType,
    reason: dbItem.reason,
    status: dbItem.status as LeaveStatus,
    attachmentUrl: dbItem.attachment_url,
});

export const getLeaveRequestsForStaff = async (staffId: string): Promise<LeaveRequest[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('staff_id', staffId)
        .order('start_date', { ascending: false });
    
    if (error) throw error;
    return data.map(toLeaveRequest);
};

export type CreateLeaveRequestData = Omit<LeaveRequest, 'id' | 'createdAt' | 'status'>;

export const createLeaveRequest = async (leaveData: CreateLeaveRequestData): Promise<LeaveRequest> => {
    if (!supabase) throw new Error("Supabase client not initialized.");

    const payload: Database['public']['Tables']['leave_requests']['Insert'] = {
        staff_id: leaveData.staffId,
        start_date: leaveData.startDate,
        end_date: leaveData.endDate,
        leave_type: leaveData.leaveType,
        reason: leaveData.reason,
        status: LeaveStatus.Pending,
        attachment_url: leaveData.attachmentUrl,
    };

    const { data, error } = await supabase
        .from('leave_requests')
        .insert([payload])
        .select()
        .single();
    
    if (error) throw error;
    return toLeaveRequest(data);
};

export const cancelLeaveRequest = async (id: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    
    // We'll delete it, but business logic could also be to change status to 'Cancelled'
    const { error } = await supabase
        .from('leave_requests')
        .delete()
        .eq('id', id)
        .eq('status', LeaveStatus.Pending); // Can only cancel pending requests
        
    if (error) throw error;
};