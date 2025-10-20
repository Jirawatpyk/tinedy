import { supabase } from '../lib/supabaseClient';
import { Customer, CustomerRelationship } from '../types';
import { Database } from '../lib/supabaseClient';

// Type alias for a database customer row for clarity and type safety.
type DbCustomer = Database['public']['Tables']['customers']['Row'];

const toCustomer = (dbCustomer: any): Customer => ({
    id: dbCustomer.id,
    name: dbCustomer.name,
    email: dbCustomer.email,
    phone: dbCustomer.phone,
    createdAt: dbCustomer.created_at,
    relationship: (dbCustomer.relationship as CustomerRelationship) || CustomerRelationship.New,
    notes: dbCustomer.notes,
    preferredStaffId: dbCustomer.preferred_staff_id,
    lineId: dbCustomer.line_id,
    preferredContactMethod: (dbCustomer.preferred_contact_method as Customer['preferredContactMethod']) || null,
    tags: dbCustomer.tags ? dbCustomer.tags.map((t: any) => ({ id: t.id, name: t.name })) : [],
});

// FIX: Correct typo from 'created_at' to 'createdAt' to match the Customer type.
const fromCustomer = (appCustomer: Omit<Customer, 'id' | 'createdAt' | 'tags'>) => ({
    name: appCustomer.name,
    email: appCustomer.email,
    // FIX: Handle nullable phone type from application model.
    phone: appCustomer.phone || null,
    relationship: appCustomer.relationship,
    notes: appCustomer.notes || null,
    preferred_staff_id: appCustomer.preferredStaffId,
    line_id: appCustomer.lineId || null,
    preferred_contact_method: appCustomer.preferredContactMethod || null,
});

export const getCustomers = async (): Promise<Customer[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('customers').select('*, tags(*)').order('name', { ascending: true });
    if (error) throw error;
    return data.map(toCustomer);
};

export const findCustomerByEmail = async (email: string): Promise<Customer | null> => {
    // FIX: Replaced checkSupabase() and supabase! with an inline guard to ensure proper type narrowing.
    if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    const { data, error } = await supabase
        .from('customers')
        .select('*, tags(*)')
        .eq('email', email)
        .limit(1)
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116: "exact one row not found"
        throw error;
    }
    
    return data ? toCustomer(data) : null;
};

export const findCustomerByEmailOrPhoneExcludingId = async (
  details: { email?: string; phone?: string },
  excludeId?: string
): Promise<Customer | null> => {
  if (!supabase) throw new Error("Supabase client is not initialized.");
  
  // Only proceed if there's something to search for
  const trimmedEmail = details.email?.trim();
  const trimmedPhone = details.phone?.trim();
  if (!trimmedEmail && !trimmedPhone) return null;

  const filters = [];
  if (trimmedEmail) filters.push(`email.eq.${trimmedEmail}`);
  if (trimmedPhone) filters.push(`phone.eq.${trimmedPhone}`);

  let query = supabase
    .from('customers')
    .select('*, tags(*)')
    .or(filters.join(','));
  
  if (excludeId) {
    query = query.not('id', 'eq', excludeId);
  }

  const { data, error } = await query.limit(1).maybeSingle();

  if (error) throw error;
  
  return data ? toCustomer(data) : null;
};


export const addCustomer = async (newCustomer: Omit<Customer, 'id' | 'createdAt' | 'tags'>): Promise<Customer> => {
    // FIX: Replaced checkSupabase() and supabase! with an inline guard to ensure proper type narrowing.
    if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    const { data, error } = await supabase
        .from('customers')
        // FIX: Removed explicit cast. Type inference will work with corrected Database type.
        .insert([fromCustomer(newCustomer)])
        .select('*, tags(*)')
        .single();
    if (error) throw error;
    return toCustomer(data);
};

export const updateCustomer = async (updatedCustomer: Customer): Promise<Customer> => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    const { id, ...updateData } = updatedCustomer;
    const { data, error } = await supabase
        .from('customers')
        // FIX: Removed explicit cast. Type inference will work with corrected Database type.
        .update(fromCustomer(updateData))
        .eq('id', id)
        .select('*, tags(*)')
        .single();
    
    if (error) throw error;
    return toCustomer(data);
};

export const updateCustomerNotes = async (customerId: string, notes: string | null): Promise<Customer> => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    const { data, error } = await supabase
        .from('customers')
        .update({ notes })
        .eq('id', customerId)
        .select('*, tags(*)')
        .single();
    if (error) throw error;
    return toCustomer(data);
};


export const deleteCustomer = async (id: string): Promise<void> => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    // In a real-world app with foreign key constraints, you'd need to handle this carefully.
    // e.g., Supabase might prevent deletion if bookings reference this customer.
    // An 'archive' flag is often a safer pattern.
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
};

// --- BULK ACTIONS ---

export const deleteCustomers = async (ids: string[]): Promise<void> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    const { error } = await supabase.from('customers').delete().in('id', ids);
    if (error) throw error;
};

export const updateCustomersRelationship = async (ids: string[], relationship: CustomerRelationship): Promise<Customer[]> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    const { data, error } = await supabase
        .from('customers')
        .update({ relationship })
        .in('id', ids)
        .select('*, tags(*)');
    if (error) throw error;
    return data.map(toCustomer);
};