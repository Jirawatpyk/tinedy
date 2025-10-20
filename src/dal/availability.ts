import { supabase } from '../lib/supabaseClient';
import { StaffUnavailability, UnavailabilityReason } from '../types';
import { Database } from '../lib/supabaseClient';

type DbUnavailability = Database['public']['Tables']['staff_unavailability']['Row'];

const toStaffUnavailability = (dbItem: DbUnavailability): StaffUnavailability => ({
    id: dbItem.id,
    createdAt: dbItem.created_at,
    staffId: dbItem.staff_id,
    startTime: dbItem.start_time,
    endTime: dbItem.end_time,
    allDay: dbItem.all_day,
    reason: dbItem.reason as UnavailabilityReason,
    notes: dbItem.notes,
    recurrenceRule: dbItem.recurrence_rule,
});

export const getUnavailabilityForStaff = async (staffId: string): Promise<StaffUnavailability[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('staff_unavailability')
        .select('*')
        .eq('staff_id', staffId)
        .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data.map(toStaffUnavailability);
};

type CreateUnavailabilityData = Omit<StaffUnavailability, 'id' | 'createdAt'>;
export const createUnavailability = async (unavailabilityData: CreateUnavailabilityData): Promise<StaffUnavailability> => {
    if (!supabase) throw new Error("Supabase client not initialized.");

    const payload: Database['public']['Tables']['staff_unavailability']['Insert'] = {
        staff_id: unavailabilityData.staffId,
        start_time: unavailabilityData.startTime,
        end_time: unavailabilityData.endTime,
        all_day: unavailabilityData.allDay,
        reason: unavailabilityData.reason,
        notes: unavailabilityData.notes,
        recurrence_rule: unavailabilityData.recurrenceRule,
    };

    const { data, error } = await supabase
        .from('staff_unavailability')
        .insert([payload])
        .select()
        .single();
    
    if (error) throw error;
    return toStaffUnavailability(data);
};

type UpdateUnavailabilityData = Partial<Omit<StaffUnavailability, 'id' | 'createdAt' | 'staffId'>>;
export const updateUnavailability = async (id: string, updateData: UpdateUnavailabilityData): Promise<StaffUnavailability> => {
    if (!supabase) throw new Error("Supabase client not initialized.");

    const payload: Database['public']['Tables']['staff_unavailability']['Update'] = {
        start_time: updateData.startTime,
        end_time: updateData.endTime,
        all_day: updateData.allDay,
        reason: updateData.reason,
        notes: updateData.notes,
        recurrence_rule: updateData.recurrenceRule,
    };

    const { data, error } = await supabase
        .from('staff_unavailability')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return toStaffUnavailability(data);
};

export const deleteUnavailability = async (id: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { error } = await supabase.from('staff_unavailability').delete().eq('id', id);
    if (error) throw error;
};