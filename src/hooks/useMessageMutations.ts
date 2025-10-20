import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markConversationAsRead } from '../dal/messages';
import { useAuthStore } from '../store/authStore';
import { StaffMessage } from '../types';

export const useMarkConversationAsRead = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const staffId = user?.id;

    return useMutation({
        mutationFn: ({ readerId, senderId }: { readerId: string; senderId: string }) => markConversationAsRead(readerId, senderId),
        onMutate: async () => {
            const queryKey = ['staffUnreadMessages', staffId];
            
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey });

            // Snapshot the previous value
            const previousUnread = queryClient.getQueryData<StaffMessage[]>(queryKey);

            // Optimistically update to an empty array
            queryClient.setQueryData<StaffMessage[]>(queryKey, []);

            // Return a context object with the snapshotted value
            return { previousUnread };
        },
        onError: (err, variables, context) => {
            const queryKey = ['staffUnreadMessages', staffId];
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousUnread) {
                queryClient.setQueryData(queryKey, context.previousUnread);
            }
        },
        onSettled: () => {
            const queryKey = ['staffUnreadMessages', staffId];
            // Always refetch after error or success to ensure the client state is correct
            queryClient.invalidateQueries({ queryKey });
        },
    });
};
