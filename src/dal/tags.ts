import { supabase } from '../lib/supabaseClient';
import { Tag } from '../types';
import { Database } from '../lib/supabaseClient';

type DbTag = Database['public']['Tables']['tags']['Row'];

const toTag = (dbTag: DbTag): Tag => ({
    id: dbTag.id,
    name: dbTag.name,
});

export const getTags = async (): Promise<Tag[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('tags').select('*').order('name');
    if (error) throw error;
    return data.map(toTag);
};

// A smart function to add a tag. It finds or creates the tag, then links it to the customer.
export const addTagToCustomer = async (customerId: string, tagName: string): Promise<Tag> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");

    // Step 1: Find or create the tag. `upsert` with `onConflict` is perfect here.
    const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .upsert({ name: tagName.trim() }, { onConflict: 'name', ignoreDuplicates: false })
        .select()
        .single();
    
    if (tagError) throw tagError;
    
    const tag = toTag(tagData);

    // Step 2: Link the tag to the customer. `ignoreDuplicates` will prevent errors if the link already exists.
    const { error: linkError } = await supabase
        .from('customer_tags')
        .insert({ customer_id: customerId, tag_id: tag.id });

    if (linkError && linkError.code !== '23505') { // 23505 is unique violation, which we can ignore
         throw linkError;
    }

    return tag;
};

export const removeTagFromCustomer = async (customerId: string, tagId: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    const { error } = await supabase
        .from('customer_tags')
        .delete()
        .match({ customer_id: customerId, tag_id: tagId });
    
    if (error) throw error;
};

export const createTag = async (name: string): Promise<Tag> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    const { data, error } = await supabase
        .from('tags')
        .insert({ name: name.trim() })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') { // unique_violation
            throw new Error(`A tag named "${name.trim()}" already exists.`);
        }
        throw error;
    }
    return toTag(data);
};

export const updateTag = async (id: string, name: string): Promise<Tag> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    const { data, error } = await supabase
        .from('tags')
        .update({ name: name.trim() })
        .eq('id', id)
        .select()
        .single();
    
    if (error) {
        if (error.code === '23505') {
             throw new Error(`A tag named "${name.trim()}" already exists.`);
        }
        throw error;
    }
    return toTag(data);
};

export const deleteTag = async (id: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    // RLS and CASCADE constraint on customer_tags will handle deletion.
    const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);
    
    if (error) throw error;
};