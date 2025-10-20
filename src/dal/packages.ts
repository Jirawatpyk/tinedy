
import { supabase } from '../lib/supabaseClient';
import { Package } from '../types';
import { Database } from '../lib/supabaseClient';

// Type alias for a database package row for clarity and type safety.
type DbPackage = Database['public']['Tables']['packages']['Row'];

// Mapper from database (snake_case) to application (camelCase)
const toPackage = (dbPackage: DbPackage): Package => ({
    id: dbPackage.id,
    createdAt: dbPackage.created_at,
    name: dbPackage.name,
    description: dbPackage.description,
    price: dbPackage.price,
    duration: dbPackage.duration,
    services: dbPackage.services,
});

// Mapper from application (camelCase) to database (snake_case)
const fromPackage = (appPackage: Omit<Package, 'id' | 'createdAt'>) => ({
    name: appPackage.name,
    description: appPackage.description,
    price: appPackage.price,
    duration: appPackage.duration,
    services: appPackage.services,
});

export const getPackages = async (): Promise<Package[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('packages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(toPackage);
};

export const addPackage = async (newPackage: Omit<Package, 'id' | 'createdAt'>): Promise<Package> => {
    // FIX: Replaced checkSupabase() and supabase! with an inline guard to ensure proper type narrowing.
    if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    const { data, error } = await supabase
        .from('packages')
        // FIX: Removed explicit cast. Type inference will work with corrected Database type.
        .insert([fromPackage(newPackage)])
        .select()
        .single();
    if (error) throw error;
    return toPackage(data);
};

export const updatePackage = async (updatedPackage: Package): Promise<Package> => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    const { id, createdAt, ...updateData } = updatedPackage;
    const { data, error } = await supabase
        .from('packages')
        // FIX: Removed explicit cast. Type inference will work with corrected Database type.
        .update(fromPackage(updateData))
        .eq('id', id)
        .select()
        .single();
    
    if (error) throw error;
    return toPackage(data);
};

export const deletePackage = async (id: string): Promise<void> => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized. Check your environment variables.");
    }
    const { error } = await supabase.from('packages').delete().eq('id', id);
    if (error) throw error;
};