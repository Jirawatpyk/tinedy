import { useState, useMemo, useEffect } from 'react';
import { useBulkDeleteBookings, useBulkUpdateStatus, useBulkAssignStaff } from './useBookings';
import { Booking, BookingStatus, ToastType } from '../types';

interface UseBookingBulkActionsProps {
    filteredBookingIds: string[];
    addToast: (message: string, type: ToastType, title: string) => void;
}

export const useBookingBulkActions = ({ filteredBookingIds, addToast }: UseBookingBulkActionsProps) => {
    const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
    
    const { mutate: bulkDelete } = useBulkDeleteBookings({
        onSuccess: (deletedIds) => {
            addToast(`Successfully deleted ${deletedIds.length} bookings.`, 'success', 'Bulk Delete');
            setSelectedBookings([]);
        },
        onError: (error) => addToast(error.message, 'error', 'Bulk Delete Error'),
    });

    const { mutate: bulkUpdateStatus } = useBulkUpdateStatus({
        onSuccess: (updatedBookings) => {
            addToast(`Successfully updated status for ${updatedBookings.length} bookings.`, 'success', 'Bulk Update');
            setSelectedBookings([]);
        },
        onError: (error) => addToast(error.message, 'error', 'Bulk Update Error'),
    });

    const { mutate: bulkAssignStaff } = useBulkAssignStaff({
        onSuccess: (updatedBookings) => {
            addToast(`Successfully assigned staff for ${updatedBookings.length} bookings.`, 'success', 'Bulk Assign');
            setSelectedBookings([]);
        },
        onError: (error) => addToast(error.message, 'error', 'Bulk Assign Error'),
    });

    const isAllSelected = useMemo(() => {
        return filteredBookingIds.length > 0 && selectedBookings.length === filteredBookingIds.length;
    }, [selectedBookings, filteredBookingIds]);
    
    // Deselect bookings that are no longer in the filtered list
    useEffect(() => {
        setSelectedBookings(currentSelected => currentSelected.filter(id => filteredBookingIds.includes(id)));
    }, [filteredBookingIds]);


    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedBookings([]);
        } else {
            setSelectedBookings(filteredBookingIds);
        }
    };

    const handleBookingSelect = (bookingId: string) => {
        setSelectedBookings(prev =>
            prev.includes(bookingId)
                ? prev.filter(id => id !== bookingId)
                : [...prev, bookingId]
        );
    };
    
    const handleBulkDelete = () => {
        if (selectedBookings.length > 0) {
            bulkDelete(selectedBookings);
        }
    };

    const handleBulkUpdateStatus = (status: BookingStatus) => {
        if (selectedBookings.length > 0) {
            bulkUpdateStatus({ ids: selectedBookings, status });
        }
    };

    const handleBulkAssignStaff = (staffId: string | null) => {
        if (selectedBookings.length > 0) {
            bulkAssignStaff({ ids: selectedBookings, staffId });
        }
    };

    return {
        selectedBookings,
        isAllSelected,
        handleSelectAll,
        handleBookingSelect,
        handleBulkDelete,
        handleBulkUpdateStatus,
        handleBulkAssignStaff,
        setSelectedBookings, // Expose setter to clear selections on filter change
    };
};
