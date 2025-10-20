import React, { useState } from 'react';
import { Booking, ToastType } from '../types';
import { createBooking, createBookingWithCustomer, NewBookingData, NewBookingForExistingCustomerData } from '../dal/bookings';
import { useAuditStore } from '../store/auditStore';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { useStaffStore } from '../store/staffStore';
import { usePackageStore } from '../store/packageStore';
import { useCustomerStore } from '../store/customerStore';
import { useUiStore } from '../store/uiStore';
import SchedulePage from '../components/schedule/SchedulePage';
import Modal from '../components/ui/Modal';
import BookingForm from '../components/booking/BookingForm';

interface ScheduleViewProps {
    addToast: (message: string, type: ToastType, title: string) => void;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ addToast }) => {
    const { addBooking } = useBookingStore();
    const staff = useStaffStore(state => state.staff);
    const packages = usePackageStore(state => state.packages);
    const { customers, addCustomer: addCustomerToStore } = useCustomerStore();
    const user = useAuthStore((state) => state.user)!;
    const addLog = useAuditStore((state) => state.addLog);
    const { openGlobalAvailabilityChecker, closeAllModals } = useUiStore();

    const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState(false);
    const [bookingInitialValues, setBookingInitialValues] = useState<Partial<NewBookingData> | null>(null);
    const [isSwitchingToChecker, setIsSwitchingToChecker] = useState(false);

    const handleOpenAssignment = (booking: Booking) => {
        openGlobalAvailabilityChecker({ mode: 'direct-assign', booking });
    };

    const handleAddBookingFromSchedule = (date: string) => {
        setBookingInitialValues({ bookingDate: date });
        setIsAddBookingModalOpen(true);
    };

    const handleAddBookingSubmit = async (newBookingData: NewBookingData | NewBookingForExistingCustomerData) => {
        try {
            let newBooking: Booking;
            if ('customerId' in newBookingData) {
                newBooking = await createBooking(newBookingData as NewBookingForExistingCustomerData);
            } else {
                newBooking = await createBookingWithCustomer(newBookingData as NewBookingData);
                addCustomerToStore(newBooking.customer);
            }
            addBooking(newBooking);
            setIsAddBookingModalOpen(false);
            setBookingInitialValues(null);
            addLog(user.email, 'CREATE_BOOKING', `Created new booking for ${newBooking.customer.name}.`);
            addToast(`Booking for ${newBooking.customer.name} created successfully.`, 'success', 'Booking Created');
        } catch (err: any) {
            addToast(err?.message || "An unknown error occurred.", 'error', 'Creation Failed');
        }
    };
    
    const handleOpenCheckerFromForm = (formData: Partial<NewBookingData>, options?: { defaultTab?: 'staff' | 'teams' }) => {
        setIsSwitchingToChecker(true);
        setIsAddBookingModalOpen(false); // Hide form
        
        const onComplete = (result: Partial<NewBookingData>) => {
            closeAllModals(); // Close checker
            setBookingInitialValues({ ...formData, ...result }); // Set new initial values
            setIsAddBookingModalOpen(true); // Re-open form
            setIsSwitchingToChecker(false);
        };
        
        const onCancel = () => {
            closeAllModals(); // Close the checker
            setIsAddBookingModalOpen(true); // Re-open form without changes
            setIsSwitchingToChecker(false);
        };

        openGlobalAvailabilityChecker({ mode: 'form-assist', formData, ...options }, onComplete, onCancel);
    };


    return (
        <>
            <SchedulePage
                bookings={useBookingStore(state => state.bookings)}
                staff={staff}
                packages={packages}
                onAssignStaff={handleOpenAssignment}
                onAddBooking={handleAddBookingFromSchedule}
            />
            
            <Modal 
                isOpen={isAddBookingModalOpen && !isSwitchingToChecker} 
                onClose={() => { 
                    setIsAddBookingModalOpen(false); 
                    setBookingInitialValues(null);
                }} 
                title={'Create New Booking'} 
                size="lg"
            >
                <BookingForm
                    onSubmit={(data) => handleAddBookingSubmit(data as NewBookingData | NewBookingForExistingCustomerData)}
                    packages={packages}
                    customers={customers}
                    staff={staff}
                    onClose={() => { 
                        setIsAddBookingModalOpen(false); 
                        setBookingInitialValues(null);
                    }}
                    initialValues={bookingInitialValues}
                    addToast={addToast}
                    onOpenAvailabilityChecker={handleOpenCheckerFromForm}
                />
            </Modal>
        </>
    );
};

export default ScheduleView;