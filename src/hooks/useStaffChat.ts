import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// FIX: Add useEffect to handle side-effects after data fetching, as onSuccess is deprecated in useQuery v5.
import { useEffect, useMemo } from 'react';
import { getMessagesForConversation, sendMessage } from '../dal/messages';
import { useAuthStore } from '../store/authStore';
import { useStaffStore } from '../store/staffStore';
import { supabase } from '../lib/supabaseClient';
import { StaffMessage } from '../types';

export const useStaffChat = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const allStaff = useStaffStore((state) => state.staff);

    const admin = useMemo(() => allStaff.find(s => s.role === 'admin'), [allStaff]);
    const staffId = user?.id;
    const adminId = admin?.id;

    const queryKey = useMemo(() => ['chat', staffId, adminId], [staffId, adminId]);

    const { data: messages = [], isLoading, error } = useQuery({
        queryKey: queryKey,
        queryFn: () => {
            if (!staffId || !adminId) return Promise.resolve([]);
            return getMessagesForConversation(staffId, adminId);
        },
        enabled: !!staffId && !!adminId,
    });


    const { mutate: postMessage, isPending: isSending } = useMutation({
        mutationFn: (content: string) => {
            if (!staffId || !adminId) throw new Error("Cannot send message: user or admin not found.");
            return sendMessage(staffId, adminId, content);
        },
        onMutate: async (content: string) => {
            await queryClient.cancelQueries({ queryKey });

            const optimisticMessage: StaffMessage = {
                id: `temp-${Date.now()}`,
                createdAt: new Date().toISOString(),
                senderId: staffId!,
                recipientId: adminId!,
                content,
                isRead: false,
            };
            
            queryClient.setQueryData(queryKey, (old: StaffMessage[] | undefined) => [...(old || []), optimisticMessage]);

            return { optimisticMessage };
        },
        onError: (err, newPost, context) => {
            queryClient.setQueryData(queryKey, (old: StaffMessage[] | undefined) => (old || []).filter(m => m.id !== context?.optimisticMessage.id));
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    useEffect(() => {
        if (!staffId || !adminId || !supabase) return;

        const channel = supabase.channel(`staff-chat-${staffId}-${adminId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'staff_messages',
                    filter: `recipient_id.eq.${staffId}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [staffId, adminId, queryClient, queryKey, supabase]);


    return {
        messages,
        isLoading,
        error,
        postMessage,
        isSending,
        admin,
        currentUser: user,
    };
};