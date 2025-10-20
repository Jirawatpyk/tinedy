import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getStaff,
    createStaffUserAndProfile,
    updateStaff as dalUpdateStaff,
    deleteStaff as dalDeleteStaff,
} from '../dal/staff';
import { useAuthStore } from '../store/authStore';
import { useAuditStore } from '../store/auditStore';
import { StaffMember } from '../types';
import { supabase } from '../lib/supabaseClient';

type MutationCallbacks<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

// --- QUERY HOOK ---
export const useStaff = () => {
    return useQuery({
        queryKey: ['staff'],
        queryFn: getStaff,
    });
};

// --- MUTATION HOOKS ---

export const useAddStaff = ({ onSuccess, onError }: MutationCallbacks<StaffMember> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: ({ staffData, password }: { staffData: Omit<StaffMember, 'id'>, password: string}) => createStaffUserAndProfile(staffData, password),
        onSuccess: (newStaff) => {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
            addLog(user.email, 'CREATE_STAFF', `Added new staff member and user account: ${newStaff.name}.`);
            onSuccess?.(newStaff);
        },
        onError,
    });
};

export const useUpdateStaff = ({ onSuccess, onError }: MutationCallbacks<StaffMember> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: (staffData: StaffMember) => dalUpdateStaff(staffData),
        onSuccess: (updatedStaff, variables) => {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
            // If the current user updated their own profile, update their auth store too
            if (user.id === variables.id) {
                useAuthStore.getState().updateUserProfile({
                    notificationPreferences: updatedStaff.notificationPreferences
                });
            }
            addLog(user.email, 'UPDATE_STAFF', `Updated profile for staff member: ${updatedStaff.name}.`);
            onSuccess?.(updatedStaff);
        },
        onError,
    });
};

export const useDeleteStaff = ({ onSuccess, onError }: MutationCallbacks<StaffMember> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: async (staffMember: StaffMember) => {
            await dalDeleteStaff(staffMember.id);
            return staffMember;
        },
        onSuccess: (deletedStaff) => {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
            // Also refetch bookings as some may have been unassigned
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            addLog(user.email, 'DELETE_STAFF', `Deleted staff member: ${deletedStaff.name}.`);
            onSuccess?.(deletedStaff);
        },
        onError,
    });
};

export const useUpdatePassword = ({ onSuccess, onError }: MutationCallbacks<void> = {}) => {
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: async (password: string) => {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
        },
        onSuccess: () => {
            addLog(user.email, 'UPDATE_STAFF', 'Changed own password.');
            onSuccess?.();
        },
        onError,
    });
};
