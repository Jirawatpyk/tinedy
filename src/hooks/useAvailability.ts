import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getUnavailabilityForStaff,
    createUnavailability,
    updateUnavailability,
    deleteUnavailability,
} from '../dal/availability';
import { StaffUnavailability } from '../types';
import { useAuthStore } from '../store/authStore';

type MutationCallbacks<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

// --- QUERY HOOK ---
export const useStaffUnavailability = () => {
    const user = useAuthStore((state) => state.user);
    
    return useQuery({
        queryKey: ['staffUnavailability', user?.id],
        queryFn: () => {
            if (!user?.id) return Promise.resolve([]);
            return getUnavailabilityForStaff(user.id);
        },
        enabled: !!user?.id,
    });
};

// --- MUTATION HOOKS ---
type CreateData = Omit<StaffUnavailability, 'id' | 'createdAt'>;
export const useCreateUnavailability = ({ onSuccess, onError }: MutationCallbacks<StaffUnavailability> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;

    return useMutation({
        mutationFn: (data: CreateData) => createUnavailability(data),
        onSuccess: (newItem) => {
            queryClient.invalidateQueries({ queryKey: ['staffUnavailability', user.id] });
            onSuccess?.(newItem);
        },
        onError,
    });
};

type UpdateData = Partial<Omit<StaffUnavailability, 'createdAt' | 'staffId'>>;
export const useUpdateUnavailability = ({ onSuccess, onError }: MutationCallbacks<StaffUnavailability> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    
    return useMutation({
        mutationFn: (data: UpdateData & {id: string}) => {
            const { id, ...updatePayload } = data;
            return updateUnavailability(id, updatePayload);
        },
        onSuccess: (updatedItem) => {
            queryClient.invalidateQueries({ queryKey: ['staffUnavailability', user.id] });
            onSuccess?.(updatedItem);
        },
        onError,
    });
};

export const useDeleteUnavailability = ({ onSuccess, onError }: MutationCallbacks<string> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;

    return useMutation({
        mutationFn: (id: string) => deleteUnavailability(id).then(() => id),
        onSuccess: (deletedId) => {
            queryClient.invalidateQueries({ queryKey: ['staffUnavailability', user.id] });
            onSuccess?.(deletedId);
        },
        onError,
    });
};