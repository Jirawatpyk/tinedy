import { useMemo } from 'react';
import { useUiStore } from '../store/uiStore';
import { Booking } from '../types';

export const useBookingFilters = (bookings: Booking[]) => {
    const { bookingFilters, setBookingFilters, resetBookingFilters } = useUiStore();

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const { searchQuery, status, assignment, bookingDate } = bookingFilters;
            const searchLower = searchQuery.toLowerCase();

            if (searchQuery &&
                !booking.customer.name.toLowerCase().includes(searchLower) &&
                !booking.customer.email.toLowerCase().includes(searchLower) &&
                !booking.id.toLowerCase().includes(searchLower)
            ) {
                return false;
            }

            if (status !== 'all' && booking.status !== status) {
                return false;
            }

            if (assignment !== 'all') {
                if (assignment === 'assigned' && !booking.assignedStaffId) return false;
                if (assignment === 'unassigned' && booking.assignedStaffId) return false;
            }

            if (bookingDate && booking.bookingDate !== bookingDate) {
                return false;
            }

            return true;
        });
    }, [bookings, bookingFilters]);

    return {
        filteredBookings,
        bookingFilters,
        setBookingFilters,
        resetBookingFilters,
    };
};