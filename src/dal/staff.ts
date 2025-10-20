import { supabase } from '../lib/supabaseClient';
import { StaffMember, AppNotificationType, BookingStatus } from '../types';
import { Database } from '../lib/supabaseClient';
import { defaultNotificationPreferences } from '../constants';

// Type alias for a database staff row for clarity and type safety.
type DbStaff = Database['public']['Tables']['staff']['Row'];

// Mapper from database (snake_case) to application (camelCase)
const toStaffMember = (dbStaff: DbStaff): StaffMember => ({
    id: dbStaff.id,
    name: dbStaff.name,
    email: dbStaff.email,
    staffNumber: dbStaff.staff_number,
    phone: dbStaff.phone,
    role: dbStaff.role,
    notificationPreferences: { ...defaultNotificationPreferences, ...dbStaff.notification_preferences },
    skills: dbStaff.skills,
    rating: dbStaff.rating,
});

// Mapper from application (camelCase) to database (snake_case)
const fromStaffMember = (appStaff: Omit<StaffMember, 'id' | 'staffNumber'>) => ({
    name: appStaff.name,
    email: appStaff.email,
    // FIX: Handle nullable phone type from application model.
    phone: appStaff.phone || null,
    role: appStaff.role,
    notification_preferences: appStaff.notificationPreferences,
    skills: appStaff.skills,
    rating: appStaff.rating,
});

/**
 * Creates both the authentication user and the staff profile in a single, secure transaction.
 * This function should invoke a Supabase Edge Function to handle the creation process securely.
 * @param newStaff - The profile data for the new staff member.
 * @param password - The initial password for the new user.
 * @returns The newly created StaffMember profile.
 */
export const createStaffUserAndProfile = async (newStaff: Omit<StaffMember, 'id'>, password: string): Promise<StaffMember> => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized.");
    }
    
    // In a production environment, this is where you would call your secure Supabase Edge Function.
    // The Edge Function would use the admin client to first create the auth user,
    // then use the returned user's ID to insert into the public.staff table.
    // This prevents exposing service keys on the client.
    /*
    const { data, error } = await supabase.functions.invoke('create-staff-user', {
        body: { staffData: newStaff, password },
    });
    if (error) throw error;
    return toStaffMember(data);
    */

    // --- DEMO/FALLBACK IMPLEMENTATION (Insecure: for demonstration purposes only) ---
    // This block demonstrates the logic but is NOT secure for production.
    // It requires relaxed RLS policies and is not the recommended approach.
    console.warn('Executing insecure fallback for createStaffUserAndProfile. Use Supabase Edge Functions in production.');
    
    // Step 1: Create the user in auth.users (This part is simulated as it cannot be done securely from the client)
    // We will proceed directly to creating the staff profile, assuming an admin is logged in.
    // The real connection would require the user_id from the newly created auth user.

    const { data, error } = await supabase
        .from('staff')
        .insert([fromStaffMember(newStaff as any)])
        .select()
        .single();
        
    if (error) {
        // Handle specific errors, e.g., if the email is already in use.
        if (error.code === '23505') { // unique_violation
            throw new Error(`A staff member with the email "${newStaff.email}" already exists.`);
        }
        throw error;
    }

    // In a real implementation, the Edge Function would return the complete StaffMember object.
    return toStaffMember(data);
};


export const getStaff = async (): Promise<StaffMember[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('staff').select('*');
    if (error) throw error;
    return data.map(toStaffMember);
};

export const getStaffProfileByUserId = async (userId: string): Promise<StaffMember | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    // PGRST116: "exact one row not found", which is a valid case (no profile yet)
    if (error && error.code !== 'PGRST116') {
        throw error;
    }

    return data ? toStaffMember(data) : null;
};

export const addStaff = async (newStaff: Omit<StaffMember, 'id' | 'staffNumber'>): Promise<StaffMember> => {
    // FIX: Replaced checkSupabase() and supabase! with an inline guard to ensure proper type narrowing.
    if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    const { data, error } = await supabase
        .from('staff')
        // FIX: Removed explicit cast. Type inference will work with corrected Database type.
        .insert([fromStaffMember(newStaff)])
        .select()
        .single();
    if (error) throw error;
    return toStaffMember(data);
};

export const updateStaff = async (updatedStaff: StaffMember): Promise<StaffMember> => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    const { id, staffNumber, ...updateData } = updatedStaff;
    const { data, error } = await supabase
        .from('staff')
        // FIX: Removed explicit cast. Type inference will work with corrected Database type.
        .update(fromStaffMember(updateData))
        .eq('id', id)
        .select()
        .single();
    
    if (error) throw error;
    return toStaffMember(data);
};

export const deleteStaff = async (id: string): Promise<void> => {
    // FIX: Replaced checkSupabase() and supabase! with an inline guard to ensure proper type narrowing.
    if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) throw error;
};

export const updateStaffRatingFromBookings = async (staffId: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");

    try {
        // 1. Fetch all completed and rated bookings for the staff member.
        const { data: bookings, error: fetchError } = await supabase
            .from('bookings')
            .select('rating')
            .eq('assigned_staff_id', staffId)
            .eq('status', BookingStatus.Completed)
            .not('rating', 'is', null);

        if (fetchError) throw fetchError;
        
        // 2. Calculate the new average rating.
        let newAverage: number | null = null;
        if (bookings && bookings.length > 0) {
            const totalRating = bookings.reduce((sum, b) => sum + (b.rating || 0), 0);
            const average = totalRating / bookings.length;
            newAverage = parseFloat(average.toFixed(1)); // Round to one decimal place
        }

        // 3. Update the staff member's profile with the new rating.
        const { error: updateError } = await supabase
            .from('staff')
            .update({ rating: newAverage })
            .eq('id', staffId);

        if (updateError) throw updateError;
        
        console.log(`Updated rating for staff ${staffId} to ${newAverage}`);

    } catch (error) {
        console.error(`Failed to update staff rating for staff ID ${staffId}:`, error);
        // We log the error but don't throw it, as this is a background process.
        // Failing to update the staff rating shouldn't block the UI.
    }
};