import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getUnreadMessagesForStaff } from '../dal/messages';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabaseClient';

export const useStaffMessageNotifications = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const staffId = user?.id;

    const queryKey = ['staffUnreadMessages', staffId];

    const { data: unreadMessages = [] } = useQuery({
        queryKey,
        queryFn: () => {
            if (!staffId) return Promise.resolve([]);
            return getUnreadMessagesForStaff(staffId);
        },
        enabled: !!staffId,
    });

    useEffect(() => {
        if (!staffId || !supabase) return;

        const channel = supabase.channel(`staff-unread-messages-${staffId}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT and UPDATE
                    schema: 'public',
                    table: 'staff_messages',
                    filter: `recipient_id.eq.${staffId}`,
                },
                (payload) => {
                    // Invalidate when a message is inserted or updated (e.g., marked as read elsewhere)
                    queryClient.invalidateQueries({ queryKey });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [staffId, queryClient, queryKey, supabase]);

    return {
        unreadCount: unreadMessages.length,
    };
};
