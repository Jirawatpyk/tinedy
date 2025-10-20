import { supabase } from '../lib/supabaseClient';
// FIX: Import CustomerRelationship to be used in mappers.
import { Booking, BookingStatus, Customer, CustomerRelationship } from '../types';
import { findCustomerByEmail, addCustomer } from './customers';
import { Database } from '../lib/supabaseClient';

// Type helper for the result of a booking query that includes customer data.
// This ensures type safety in our mapper function.
type BookingWithCustomer = Database['public']['Tables']['bookings']['Row'] & {
    customers: Database['public']['Tables']['customers']['Row'];
};

// Mapper from database (snake_case with joined customer) to application (camelCase)
const toBooking = (dbBooking: BookingWithCustomer): Booking => {
    if (!dbBooking.customers) {
        // This check is for runtime safety, though TypeScript now helps prevent this.
        // Given our query `customers!inner(*)`, this data should always be present.
        throw new Error(`Booking with ID ${dbBooking.id} is missing customer data. Check your query join.`);
    }
    return {
        id: dbBooking.id,
        bookingNumber: dbBooking.booking_number,
        customerId: dbBooking.customer_id,
        customer: {
            id: dbBooking.customers.id,
            name: dbBooking.customers.name,
            email: dbBooking.customers.email,
            phone: dbBooking.customers.phone,
            createdAt: dbBooking.customers.created_at,
            relationship: (dbBooking.customers.relationship as CustomerRelationship) || CustomerRelationship.New,
            notes: dbBooking.customers.notes,
            preferredStaffId: dbBooking.customers.preferred_staff_id,
            lineId: dbBooking.customers.line_id,
            preferredContactMethod: (dbBooking.customers.preferred_contact_method as Customer['preferredContactMethod']) || null,
            // Tags are not joined in the standard booking query, so we default to an empty array to satisfy the type.
            tags: [],
        },
        packageId: dbBooking.package_id,
        bookingDate: dbBooking.booking_date,
        bookingTime: dbBooking.booking_time,
        address: dbBooking.address,
        status: dbBooking.status as BookingStatus,
        notes: dbBooking.notes,
        assignedStaffId: dbBooking.assigned_staff_id,
        assignedTeamId: dbBooking.assigned_team_id,
        createdAt: dbBooking.created_at,
        reminderSent: dbBooking.reminder_sent,
        rating: dbBooking.rating,
    };
};

export const getBookings = async (): Promise<Booking[]> => {
    if (!supabase) return [];
    // Join with customers table to get customer details and order by creation date
    const { data, error } = await supabase
        .from('bookings')
        .select('*, customers!inner(*)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(toBooking);
};

export type NewBookingData = {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    packageId: string;
    bookingDate: string;
    bookingTime: string;
    address: string;
    notes?: string;
    assignedStaffId?: string | null;
    assignedTeamId?: string | null;
};

export type NewBookingForExistingCustomerData = {
    customerId: string;
    packageId: string;
    bookingDate: string;
    bookingTime: string;
    address: string;
    notes?: string;
    assignedStaffId?: string | null;
    assignedTeamId?: string | null;
};

export type BookingUpdateData = {
    packageId: string;
    bookingDate: string;
    bookingTime: string;
    address: string;
    notes?: string;
    assignedStaffId?: string | null;
    assignedTeamId?: string | null;
};

export const createBooking = async (bookingData: NewBookingForExistingCustomerData): Promise<Booking> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");

    const newBookingPayload = {
        customer_id: bookingData.customerId,
        package_id: bookingData.packageId,
        booking_date: bookingData.bookingDate,
        booking_time: bookingData.bookingTime,
        address: bookingData.address,
        status: BookingStatus.Pending,
        notes: bookingData.notes || null,
        reminder_sent: false,
        assigned_staff_id: bookingData.assignedStaffId || null,
        assigned_team_id: bookingData.assignedTeamId || null,
    };

    const { data: insertedBooking, error } = await supabase
        .from('bookings')
        .insert([newBookingPayload])
        .select('*, customers!inner(*)') // Eager load customer data
        .single();
    
    if (error) throw error;
    return toBooking(insertedBooking);
};

export const createBookingWithCustomer = async (bookingData: NewBookingData): Promise<Booking> => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    
    // Step 1: Find or create the customer
    let customer = await findCustomerByEmail(bookingData.customerEmail);
    if (!customer) {
        customer = await addCustomer({
            name: bookingData.customerName,
            email: bookingData.customerEmail,
            phone: bookingData.customerPhone || null,
            // FIX: Add missing 'relationship' property for new customers.
            relationship: CustomerRelationship.New,
            // FIX: Add missing 'notes' property for new customers.
            notes: null,
        });
    }

    // Step 2: Create the booking with the customer's ID
    const newBookingPayload: Database['public']['Tables']['bookings']['Insert'] = {
        customer_id: customer.id,
        package_id: bookingData.packageId,
        booking_date: bookingData.bookingDate,
        booking_time: bookingData.bookingTime,
        address: bookingData.address,
        status: BookingStatus.Pending,
        // FIX: Ensure notes is explicitly null if not provided, to match schema.
        notes: bookingData.notes || null,
        reminder_sent: false,
        assigned_staff_id: bookingData.assignedStaffId || null,
        assigned_team_id: bookingData.assignedTeamId || null,
    };
    
    // Select just the newly created booking row, without the join.
    const { data: insertedBooking, error } = await supabase
        .from('bookings')
        .insert([newBookingPayload])
        .select()
        .single();

    if (error) throw error;

    // Manually construct the final Booking object to ensure it has the correct structure.
    // This is more robust than relying on a join after an insert.
    return {
        id: insertedBooking.id,
        bookingNumber: insertedBooking.booking_number,
        customerId: insertedBooking.customer_id,
        customer: customer, // Use the customer object we already have from Step 1
        packageId: insertedBooking.package_id,
        bookingDate: insertedBooking.booking_date,
        bookingTime: insertedBooking.booking_time,
        address: insertedBooking.address,
        status: insertedBooking.status as BookingStatus,
        notes: insertedBooking.notes || undefined,
        assignedStaffId: insertedBooking.assigned_staff_id,
        assignedTeamId: insertedBooking.assigned_team_id,
        createdAt: insertedBooking.created_at,
        reminderSent: insertedBooking.reminder_sent,
        rating: insertedBooking.rating,
    };
};

export const updateBookingStatus = async (id: string, status: BookingStatus): Promise<Booking> => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    const { data, error } = await supabase
        .from('bookings')
        // FIX: Removed explicit cast. Type inference will work with corrected Database type.
        .update({ status })
        .eq('id', id)
        .select('*, customers!inner(*)')
        .single();
    if (error) throw error;
    return toBooking(data);
};

export const updateBooking = async (id: string, updateData: BookingUpdateData): Promise<Booking> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    
    const dbUpdateData: Database['public']['Tables']['bookings']['Update'] = {
        package_id: updateData.packageId,
        booking_date: updateData.bookingDate,
        booking_time: updateData.bookingTime,
        address: updateData.address,
        notes: updateData.notes,
        assigned_staff_id: updateData.assignedStaffId,
        assigned_team_id: updateData.assignedTeamId,
    };

    const { data, error } = await supabase
        .from('bookings')
        .update(dbUpdateData)
        .eq('id', id)
        .select('*, customers!inner(*)')
        .single();
    if (error) throw error;
    return toBooking(data);
};

export const patchBooking = async (id: string, updateData: Partial<Database['public']['Tables']['bookings']['Update']>): Promise<Booking> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .select('*, customers!inner(*)')
        .single();
    if (error) throw error;
    return toBooking(data);
};


export const assignStaffToBooking = async (bookingId: string, staffId: string | null): Promise<Booking> => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    const { data, error } = await supabase
        .from('bookings')
        .update({ assigned_staff_id: staffId, assigned_team_id: null }) // Un-assign team when assigning individual
        .eq('id', bookingId)
        .select('*, customers!inner(*)')
        .single();
    if (error) throw error;
    return toBooking(data);
};

export const assignTeamToBooking = async (bookingId: string, teamId: string | null, leadStaffId: string | null): Promise<Booking> => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    const { data, error } = await supabase
        .from('bookings')
        .update({ assigned_team_id: teamId, assigned_staff_id: leadStaffId })
        .eq('id', bookingId)
        .select('*, customers!inner(*)')
        .single();
    if (error) throw error;
    return toBooking(data);
};

export const updateReminderSentStatus = async (id: string, sent: boolean): Promise<Booking> => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    const { data, error } = await supabase
        .from('bookings')
        .update({ reminder_sent: sent })
        .eq('id', id)
        .select('*, customers!inner(*)')
        .single();
    if (error) throw error;
    return toBooking(data);
};

export const updateBookingRating = async (id: string, rating: number | null): Promise<Booking> => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized.");
    }
    const { data, error } = await supabase
        .from('bookings')
        .update({ rating })
        .eq('id', id)
        .select('*, customers!inner(*)')
        .single();
    if (error) throw error;
    return toBooking(data);
};

export const deleteBooking = async (id: string): Promise<void> => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) throw error;
};

// --- BULK ACTIONS ---

export const deleteBookings = async (ids: string[]): Promise<void> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    const { error } = await supabase.from('bookings').delete().in('id', ids);
    if (error) throw error;
};

export const updateBookingsStatus = async (ids: string[], status: BookingStatus): Promise<Booking[]> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .in('id', ids)
        .select('*, customers!inner(*)');
    if (error) throw error;
    return data.map(toBooking);
};

export const assignStaffToBookings = async (ids: string[], staffId: string | null): Promise<Booking[]> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    const { data, error } = await supabase
        .from('bookings')
        .update({ assigned_staff_id: staffId })
        .in('id', ids)
        .select('*, customers!inner(*)');
    if (error) throw error;
    return data.map(toBooking);
};

export const getBookingsForStaff = async (staffId: string): Promise<Booking[]> => {
    if (!supabase) return [];
    
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('bookings')
        .select('*, customers!inner(*)')
        .eq('assigned_staff_id', staffId)
        .gte('booking_date', today) // Only get today's and future bookings
        .in('status', [BookingStatus.Pending, BookingStatus.Confirmed, BookingStatus.InProgress]) // Only active bookings
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true });

    if (error) throw error;
    return data.map(toBooking);
};

export const getAllBookingsForStaff = async (staffId: string): Promise<Booking[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('bookings')
        .select('*, customers!inner(*)')
        .eq('assigned_staff_id', staffId)
        .order('booking_date', { ascending: false });

    if (error) throw error;
    return data.map(toBooking as (dbBooking: any) => Booking);
};