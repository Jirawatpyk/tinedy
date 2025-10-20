import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getBookings,
    createBookingWithCustomer,
    createBooking,
    updateBooking as dalUpdateBooking,
    deleteBooking as dalDeleteBooking,
    updateBookingStatus as dalUpdateBookingStatus,
    patchBooking,
    assignStaffToBooking as dalAssignStaffToBooking,
    assignTeamToBooking as dalAssignTeamToBooking,
    updateReminderSentStatus as dalUpdateReminderSentStatus,
    updateBookingRating as dalUpdateBookingRating,
    deleteBookings as dalDeleteBookings,
    updateBookingsStatus as dalUpdateBookingsStatus,
    assignStaffToBookings as dalAssignStaffToBookings,
    NewBookingData,
    NewBookingForExistingCustomerData,
    BookingUpdateData,
} from '../dal/bookings';
import { useAuthStore } from '../store/authStore';
import { useAuditStore } from '../store/auditStore';
import { useStaffStore } from '../store/staffStore';
import { Booking, BookingStatus } from '../types';
import { useTeamStore } from '../store/teamStore';
import { Database } from '../lib/supabaseClient';
import { updateStaffRatingFromBookings } from '../dal/staff';

type MutationCallbacks<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

// --- QUERY HOOK ---
export const useBookings = () => {
    return useQuery({
        queryKey: ['bookings'],
        queryFn: getBookings,
    });
};

// --- MUTATION HOOKS ---

export const useAddBooking = ({ onSuccess, onError }: MutationCallbacks<Booking> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: (bookingData: NewBookingData | NewBookingForExistingCustomerData) => {
            if ('customerId' in bookingData) {
                return createBooking(bookingData);
            }
            return createBookingWithCustomer(bookingData);
        },
        onSuccess: (newBooking) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            addLog(user.email, 'CREATE_BOOKING', `Created new booking #${newBooking.bookingNumber} for customer: ${newBooking.customer.name}.`, newBooking.id);
            onSuccess?.(newBooking);
        },
        onError,
    });
};

export const useUpdateBooking = ({ onSuccess, onError }: MutationCallbacks<Booking> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: ({ id, updateData }: { id: string, updateData: BookingUpdateData }) => dalUpdateBooking(id, updateData),
        onSuccess: (updatedBooking) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            addLog(user.email, 'UPDATE_BOOKING', `Updated details for booking #${updatedBooking.bookingNumber}.`, updatedBooking.id);
            onSuccess?.(updatedBooking);
        },
        onError,
    });
};

export const usePatchBooking = ({ onSuccess, onError }: MutationCallbacks<Booking> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);
    
    return useMutation({
        mutationFn: ({ id, updateData }: { id: string, updateData: Partial<Database['public']['Tables']['bookings']['Update']> }) => patchBooking(id, updateData),
        onSuccess: (updatedBooking, { updateData }) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['staffSchedule', user.id] });
            
            let details = `Updated booking #${updatedBooking.bookingNumber}.`;
            if (updateData.status) {
                details = `Changed status to ${updateData.status} for booking #${updatedBooking.bookingNumber}.`
            }
            
            addLog(user.email, 'UPDATE_STATUS', details, updatedBooking.id);
            onSuccess?.(updatedBooking);
        },
        onError,
    });
};

export const useDeleteBooking = ({ onSuccess, onError }: MutationCallbacks<Booking> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: async (booking: Booking) => {
            await dalDeleteBooking(booking.id);
            return booking; // Pass booking object for logging
        },
        onSuccess: (deletedBooking) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            addLog(user.email, 'DELETE_BOOKING', `Deleted booking #${deletedBooking.bookingNumber} for customer ${deletedBooking.customer.name}.`, deletedBooking.id);
            onSuccess?.(deletedBooking);
        },
        onError,
    });
};

export const useUpdateBookingStatus = ({ onSuccess, onError }: MutationCallbacks<Booking> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: ({ id, status }: { id: string, status: BookingStatus }) => dalUpdateBookingStatus(id, status),
        onSuccess: (updatedBooking, { status }) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            addLog(user.email, 'UPDATE_STATUS', `Changed status to ${status} for booking #${updatedBooking.bookingNumber}.`, updatedBooking.id);
            onSuccess?.(updatedBooking);
        },
        onError,
    });
};

export const useAssignStaffToBooking = ({ onSuccess, onError }: MutationCallbacks<Booking> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const staff = useStaffStore((state) => state.staff);
    const addLog = useAuditStore((state) => state.addLog);
    
    return useMutation({
        mutationFn: ({ bookingId, staffId }: { bookingId: string, staffId: string | null, overrideReason?: string }) => dalAssignStaffToBooking(bookingId, staffId),
        onSuccess: (updatedBooking, { staffId, overrideReason }) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            const staffName = staff.find(s => s.id === staffId)?.name || 'unassigned';
            
            if (overrideReason) {
                addLog(user.email, 'OVERRIDE_ASSIGNMENT', `Forcefully assigned ${staffName} to booking #${updatedBooking.bookingNumber}. Reason: ${overrideReason}`, updatedBooking.id);
            } else {
                addLog(user.email, 'ASSIGN_STAFF', `Assigned ${staffName} to booking #${updatedBooking.bookingNumber}.`, updatedBooking.id);
            }
            onSuccess?.(updatedBooking);
        },
        onError,
    });
};

export const useAssignTeamToBooking = ({ onSuccess, onError }: MutationCallbacks<Booking> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const teams = useTeamStore((state) => state.teams);
    const addLog = useAuditStore((state) => state.addLog);
    
    return useMutation({
        mutationFn: ({ bookingId, teamId, leadStaffId }: { bookingId: string, teamId: string | null, leadStaffId: string | null, overrideReason?: string }) => dalAssignTeamToBooking(bookingId, teamId, leadStaffId),
        onSuccess: (updatedBooking, { teamId, overrideReason }) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            const teamName = teams.find(t => t.id === teamId)?.name || 'unassigned';
            
            if (overrideReason) {
                addLog(user.email, 'OVERRIDE_ASSIGNMENT', `Forcefully assigned team ${teamName} to booking #${updatedBooking.bookingNumber}. Reason: ${overrideReason}`, updatedBooking.id);
            } else {
                addLog(user.email, 'ASSIGN_STAFF', `Assigned team ${teamName} to booking #${updatedBooking.bookingNumber}.`, updatedBooking.id);
            }
            onSuccess?.(updatedBooking);
        },
        onError,
    });
};

export const useSendReminder = ({ onSuccess, onError }: MutationCallbacks<Booking> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: (id: string) => dalUpdateReminderSentStatus(id, true),
        onSuccess: (updatedBooking) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            addLog(user.email, 'SEND_REMINDER', `Sent SMS reminder for booking #${updatedBooking.bookingNumber}.`, updatedBooking.id);
            onSuccess?.(updatedBooking);
        },
        onError,
    });
};

export const useUpdateBookingRating = ({ onSuccess, onError }: MutationCallbacks<Booking> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: ({ id, rating }: { id: string, rating: number | null }) => dalUpdateBookingRating(id, rating),
        onSuccess: (updatedBooking, { rating }) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            addLog(user.email, 'UPDATE_BOOKING', `Updated rating to ${rating} for booking #${updatedBooking.bookingNumber}.`, updatedBooking.id);
            
            // After successfully updating the booking rating, trigger the recalculation of the staff's overall rating.
            if (updatedBooking.assignedStaffId) {
                updateStaffRatingFromBookings(updatedBooking.assignedStaffId).then(() => {
                    // Invalidate staff query to refetch updated ratings
                    queryClient.invalidateQueries({ queryKey: ['staff'] });
                });
            }

            onSuccess?.(updatedBooking);
        },
        onError,
    });
};


// --- BULK MUTATIONS ---

export const useBulkDeleteBookings = ({ onSuccess, onError }: MutationCallbacks<string[]> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: async (ids: string[]) => {
            await dalDeleteBookings(ids);
            return ids;
        },
        onSuccess: (deletedIds) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            addLog(user.email, 'DELETE_BOOKING', `Bulk deleted ${deletedIds.length} bookings.`);
            onSuccess?.(deletedIds);
        },
        onError,
    });
};

export const useBulkUpdateStatus = ({ onSuccess, onError }: MutationCallbacks<Booking[]> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: ({ ids, status }: { ids: string[], status: BookingStatus }) => dalUpdateBookingsStatus(ids, status),
        onSuccess: (updatedBookings, { status }) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            addLog(user.email, 'UPDATE_STATUS', `Bulk changed status to ${status} for ${updatedBookings.length} bookings.`);
            onSuccess?.(updatedBookings);
        },
        onError,
    });
};

export const useBulkAssignStaff = ({ onSuccess, onError }: MutationCallbacks<Booking[]> = {}) => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);
    
    return useMutation({
        mutationFn: ({ ids, staffId }: { ids: string[], staffId: string | null }) => dalAssignStaffToBookings(ids, staffId),
        onSuccess: (updatedBookings) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            addLog(user.email, 'ASSIGN_STAFF', `Bulk assigned staff for ${updatedBookings.length} bookings.`);
            onSuccess?.(updatedBookings);
        },
        onError,
    });
};