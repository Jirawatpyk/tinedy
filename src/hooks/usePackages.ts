import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getPackages,
    addPackage as dalAddPackage,
    updatePackage as dalUpdatePackage,
    deletePackage as dalDeletePackage,
} from '../dal/packages';
import { useAuthStore } from '../store/authStore';
import { useAuditStore } from '../store/auditStore';
import { Package } from '../types';

type MutationCallbacks<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

// --- QUERY HOOK ---
export const usePackages = () => {
    return useQuery({
        queryKey: ['packages'],
        queryFn: getPackages,
    });
};

// --- MUTATION HOOKS ---

export const useAddPackage = ({ onSuccess, onError }: MutationCallbacks<Package> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: (pkgData: Omit<Package, 'id' | 'createdAt'>) => dalAddPackage(pkgData),
        onSuccess: (newPackage) => {
            queryClient.invalidateQueries({ queryKey: ['packages'] });
            addLog(user.email, 'CREATE_PACKAGE', `Added new package: ${newPackage.name}.`);
            onSuccess?.(newPackage);
        },
        onError,
    });
};

export const useUpdatePackage = ({ onSuccess, onError }: MutationCallbacks<Package> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: (pkgData: Package) => dalUpdatePackage(pkgData),
        onSuccess: (updatedPackage) => {
            queryClient.invalidateQueries({ queryKey: ['packages'] });
            addLog(user.email, 'UPDATE_PACKAGE', `Updated package: ${updatedPackage.name}.`);
            onSuccess?.(updatedPackage);
        },
        onError,
    });
};

export const useDeletePackage = ({ onSuccess, onError }: MutationCallbacks<Package> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: async (pkg: Package) => {
            await dalDeletePackage(pkg.id);
            return pkg;
        },
        onSuccess: (deletedPackage) => {
            queryClient.invalidateQueries({ queryKey: ['packages'] });
            addLog(user.email, 'DELETE_PACKAGE', `Deleted package: ${deletedPackage.name}.`);
            onSuccess?.(deletedPackage);
        },
        onError,
    });
};