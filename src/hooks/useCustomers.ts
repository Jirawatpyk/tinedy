import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getCustomers,
    addCustomer as dalAddCustomer,
    updateCustomer as dalUpdateCustomer,
    deleteCustomer as dalDeleteCustomer,
    updateCustomerNotes as dalUpdateCustomerNotes,
    deleteCustomers as dalDeleteCustomers,
    updateCustomersRelationship as dalUpdateCustomersRelationship,
} from '../dal/customers';
import { useAuthStore } from '../store/authStore';
import { useAuditStore } from '../store/auditStore';
import { Customer, CustomerRelationship } from '../types';

type MutationCallbacks<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

// --- QUERY HOOK ---
export const useCustomers = () => {
    return useQuery({
        queryKey: ['customers'],
        queryFn: getCustomers,
    });
};

// --- MUTATION HOOKS ---

export const useAddCustomer = ({ onSuccess, onError }: MutationCallbacks<Customer> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: (customerData: Omit<Customer, 'id' | 'createdAt'>) => dalAddCustomer(customerData),
        onSuccess: (newCustomer) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            addLog(user.email, 'CREATE_CUSTOMER', `Added new customer: ${newCustomer.name}.`);
            onSuccess?.(newCustomer);
        },
        onError,
    });
};

export const useUpdateCustomer = ({ onSuccess, onError }: MutationCallbacks<Customer> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: (customerData: Customer) => dalUpdateCustomer(customerData),
        onSuccess: (updatedCustomer) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            // Also invalidate bookings as customer details might be nested
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            addLog(user.email, 'UPDATE_CUSTOMER', `Updated profile for customer: ${updatedCustomer.name}.`);
            onSuccess?.(updatedCustomer);
        },
        onError,
    });
};

export const useUpdateCustomerNotes = ({ onSuccess, onError }: MutationCallbacks<Customer> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: ({ customerId, notes }: { customerId: string, notes: string | null }) => dalUpdateCustomerNotes(customerId, notes),
        onSuccess: (updatedCustomer) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            addLog(user.email, 'UPDATE_CUSTOMER', `Updated notes for customer: ${updatedCustomer.name}.`);
            onSuccess?.(updatedCustomer);
        },
        onError,
    });
};

export const useDeleteCustomer = ({ onSuccess, onError }: MutationCallbacks<Customer> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: async (customer: Customer) => {
            await dalDeleteCustomer(customer.id);
            return customer; // Pass customer object for logging
        },
        onSuccess: (deletedCustomer) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['bookings'] }); // Bookings will be cascade deleted
            addLog(user.email, 'DELETE_CUSTOMER', `Archived customer: ${deletedCustomer.name}.`);
            onSuccess?.(deletedCustomer);
        },
        onError,
    });
};

// --- BULK MUTATIONS ---

export const useBulkDeleteCustomers = ({ onSuccess, onError }: MutationCallbacks<Customer[]> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: async (customers: Customer[]) => {
            const ids = customers.map(c => c.id);
            await dalDeleteCustomers(ids);
            return customers; // Pass customers for logging
        },
        onSuccess: (deletedCustomers) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            addLog(user.email, 'DELETE_CUSTOMER', `Bulk archived ${deletedCustomers.length} customers.`);
            onSuccess?.(deletedCustomers);
        },
        onError,
    });
};

export const useBulkUpdateCustomersRelationship = ({ onSuccess, onError }: MutationCallbacks<Customer[]> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: ({ ids, relationship }: { ids: string[], relationship: CustomerRelationship }) => dalUpdateCustomersRelationship(ids, relationship),
        onSuccess: (updatedCustomers, { relationship }) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            addLog(user.email, 'UPDATE_CUSTOMER', `Bulk changed relationship to ${relationship} for ${updatedCustomers.length} customers.`);
            onSuccess?.(updatedCustomers);
        },
        onError,
    });
};