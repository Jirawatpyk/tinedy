import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createJobIssue } from '../dal/issues';
import { JobIssue, IssueSeverity } from '../types';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

type CreateIssueData = Omit<JobIssue, 'id' | 'createdAt' | 'status'>;

type MutationCallbacks<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

export const useCreateJobIssue = ({ onSuccess, onError }: MutationCallbacks<JobIssue> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addNotification = useNotificationStore(state => state.addNotification);

    return useMutation({
        mutationFn: (issueData: CreateIssueData) => createJobIssue(issueData),
        onSuccess: (newIssue) => {
            queryClient.invalidateQueries({ queryKey: ['jobIssues', newIssue.bookingId] });
            
            // Send a notification to admins for high-priority issues
            if (newIssue.severity === IssueSeverity.High || newIssue.severity === IssueSeverity.Emergency) {
                addNotification(
                    `[${newIssue.severity}] Issue reported by ${user.email} for booking #${newIssue.bookingId}.`,
                    'ISSUE_REPORTED',
                    { targetPage: 'bookings', targetId: newIssue.bookingId }
                );
            }

            onSuccess?.(newIssue);
        },
        onError,
    });
};
