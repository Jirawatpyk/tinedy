import { useState } from 'react';
import { Booking } from '../types';

/**
 * A hook to manage modal states specifically for booking actions
 * that go beyond simple CRUD (which is handled by useCrudModals).
 */
export const useBookingModals = () => {
    const [changingStatusFor, setChangingStatusFor] = useState<Booking | null>(null);
    const [sendingReminderFor, setSendingReminderFor] = useState<Booking | null>(null);

    const openChangeStatusModal = (booking: Booking) => setChangingStatusFor(booking);
    const openSendReminderModal = (booking: Booking) => setSendingReminderFor(booking);

    const closeAllBookingModals = () => {
        setChangingStatusFor(null);
        setSendingReminderFor(null);
    };

    return {
        changingStatusFor,
        sendingReminderFor,
        openChangeStatusModal,
        openSendReminderModal,
        closeAllBookingModals,
    };
};