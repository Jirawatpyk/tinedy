import { create } from 'zustand';
import { Booking } from '../types';

interface BookingState {
    bookings: Booking[];
    setBookings: (bookings: Booking[]) => void;
    addBooking: (booking: Booking) => void;
    updateBooking: (booking: Booking) => void;
    updateMultipleBookings: (bookings: Booking[]) => void;
    removeMultipleBookings: (bookingIds: string[]) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
    bookings: [],
    setBookings: (bookings) => set({ bookings }),
    // FIX: Add addBooking action.
    addBooking: (booking) => set((state) => ({
        bookings: [booking, ...state.bookings]
    })),
    // FIX: Add updateBooking action.
    updateBooking: (booking) => set((state) => ({
        bookings: state.bookings.map(b => b.id === booking.id ? booking : b)
    })),
    // FIX: Add updateMultipleBookings action.
    updateMultipleBookings: (bookingsToUpdate) => set((state) => {
        const bookingMap = new Map(bookingsToUpdate.map(b => [b.id, b]));
        return {
            bookings: state.bookings.map(b => bookingMap.has(b.id) ? bookingMap.get(b.id)! : b)
        };
    }),
    // FIX: Add removeMultipleBookings action.
    removeMultipleBookings: (bookingIds) => set((state) => ({
        bookings: state.bookings.filter(b => !bookingIds.includes(b.id))
    })),
}));