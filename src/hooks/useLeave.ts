import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getLeaveRequestsForStaff,
    createLeaveRequest,
    cancelLeaveRequest,
    CreateLeaveRequestData,
} from '../dal/leave';
import { LeaveRequest } from '../types';
import { useAuthStore } from '../store/authStore';

type MutationCallbacks<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

// --- QUERY HOOK ---
export const useStaffLeaveRequests = () => {
    const user = useAuthStore((state) => state.user);
    
    return useQuery({
        queryKey: ['staffLeaveRequests', user?.id],
        queryFn: () => {
            if (!user?.id) return Promise.resolve([]);
            return getLeaveRequestsForStaff(user.id);
        },
        enabled: !!user?.id,
    });
};

// --- MUTATION HOOKS ---
export const useCreateLeaveRequest = ({ onSuccess, onError }: MutationCallbacks<LeaveRequest> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;

    return useMutation({
        mutationFn: (data: CreateLeaveRequestData) => createLeaveRequest(data),
        onSuccess: (newItem) => {
            queryClient.invalidateQueries({ queryKey: ['staffLeaveRequests', user.id] });
            onSuccess?.(newItem);
        },
        onError,
    });
};

export const useCancelLeaveRequest = ({ onSuccess, onError }: MutationCallbacks<string> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;

    return useMutation({
        mutationFn: (id: string) => cancelLeaveRequest(id).then(() => id),
        onSuccess: (deletedId) => {
            queryClient.invalidateQueries({ queryKey: ['staffLeaveRequests', user.id] });
            onSuccess?.(deletedId);
        },
        onError,
    });
};