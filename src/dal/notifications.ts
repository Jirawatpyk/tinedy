import { supabase } from '../lib/supabaseClient';
import { Database } from '../lib/supabaseClient';

export const savePushSubscription = async (staffId: string, subscription: PushSubscriptionJSON): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");

    const payload: Database['public']['Tables']['push_subscriptions']['Insert'] = {
        staff_id: staffId,
        subscription: subscription as any, // Cast to any to match Supabase JSONB type
    };

    // Use upsert to handle cases where the user re-subscribes on a new device or browser
    const { error } = await supabase
        .from('push_subscriptions')
        .upsert(payload, { onConflict: 'staff_id' });

    if (error) throw error;
};

export const deletePushSubscription = async (staffId: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    
    const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('staff_id', staffId);
        
    if (error) throw error;
};