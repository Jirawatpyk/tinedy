import React, { useMemo, useState, useEffect } from 'react';
import { Booking, ToastType, BookingStatus, StaffMember, Package } from '../types';
import BookingsPage from '../components/booking/BookingsPage';
// store hooks
import { useBookingStore } from '../store/bookingStore';
import { useStaffStore } from '../store/staffStore';
import { usePackageStore } from '../store/packageStore';
import { useCustomerStore } from '../store/customerStore';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { useTeamStore } from '../store/teamStore';
// custom hooks
import { useBookingFilters } from '../hooks/useBookingFilters';
import { useBookingBulkActions } from '../hooks/useBookingBulkActions';
import { useCrudModals } from '../hooks/useCrudModals';
import { useBookingModals } from '../hooks/useBookingModals';
import { useTableSort } from '../hooks/useTableSort';
// mutation hooks
import { 
    useAddBooking, 
    useUpdateBooking, 
    useDeleteBooking, 
    useUpdateBookingStatus, 
    useSendReminder,
} from '../hooks/useBookings';
import { NewBookingData } from '../dal/bookings';
// UI components for modals
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import BookingForm from '../components/booking/BookingForm';
import ChangeStatusModal from '../components/booking/ChangeStatusModal';
import BookingDetailsModal from '../components/booking/BookingDetailsModal';

const BOOKINGS_PER_PAGE = 10;

interface BookingsViewProps {
  addToast: (message: string, type: ToastType, title: string) => void;
}

const BookingsView: React.FC<BookingsViewProps> = ({ addToast }) => {
    const { bookings } = useBookingStore();
    const { staff } = useStaffStore();
    const { packages } = usePackageStore();
    const { customers } = useCustomerStore();
    const { user } = useAuthStore();
    const { teams } = useTeamStore();
    const { 
        isAddBookingModalOpen, 
        newBookingCustomerContext, 
        newBookingInitialValues,
        openAddBookingModal, 
        closeAllModals,
        openGlobalAvailabilityChecker
    } = useUiStore();

    const { deletingItem, viewingItem, handleOpenDeleteModal, handleOpenViewModal, handleCloseModals: handleCloseCrudModals } = useCrudModals<Booking>();
    const [editingItem, setEditingItem] = useState<Booking | null>(null);
    const [isSwitchingToChecker, setIsSwitchingToChecker] = useState(false);
    
    const { filteredBookings, bookingFilters, setBookingFilters } = useBookingFilters(bookings);
    
    const bookingsForSort = useMemo(() => {
        const packagesById = new Map(packages.map(p => [p.id, p]));
        const staffById = new Map(staff.map(s => [s.id, s]));
        const teamsById = new Map(teams.map(t => [t.id, t]));

        return filteredBookings.map(b => {
            let assignmentName = 'Unassigned';
            if (b.assignedTeamId) {
                assignmentName = teamsById.get(b.assignedTeamId)?.name || 'Unknown Team';
            } else if (b.assignedStaffId) {
                assignmentName = staffById.get(b.assignedStaffId)?.name || 'Unknown Staff';
            }

            return {
                ...b,
                _customerName: b.customer.name,
                _packageName: packagesById.get(b.packageId)?.name || 'Unknown Package',
                _dateTime: `${b.bookingDate}T${b.bookingTime}`,
                _assignmentName: assignmentName,
            };
        });
    }, [filteredBookings, packages, staff, teams]);

    type SortableBooking = typeof bookingsForSort[0];

    const { sortedItems: sortedBookings, requestSort, sortConfig } = useTableSort<SortableBooking>(bookingsForSort, { key: 'createdAt', direction: 'desc' });

    const [currentPage, setCurrentPage] = React.useState(1);
    const totalPages = Math.ceil(sortedBookings.length / BOOKINGS_PER_PAGE);

    React.useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedIds = useMemo(() => {
        return sortedBookings.slice((currentPage - 1) * BOOKINGS_PER_PAGE, currentPage * BOOKINGS_PER_PAGE).map(b => b.id);
    }, [sortedBookings, currentPage]);
    
    const {
        selectedBookings,
        isAllSelected,
        handleSelectAll,
        handleBookingSelect,
        handleBulkDelete,
        handleBulkUpdateStatus,
        handleBulkAssignStaff,
    } = useBookingBulkActions({ filteredBookingIds: paginatedIds, addToast });

    const { changingStatusFor, sendingReminderFor, openChangeStatusModal, openSendReminderModal, closeAllBookingModals } = useBookingModals();

    const handleOpenEditModal = (item: Booking) => setEditingItem(item);
    
    const closeModal = () => {
        setEditingItem(null);
        handleCloseCrudModals();
        closeAllBookingModals();
        closeAllModals();
        setIsSwitchingToChecker(false);
    };
    
    const handleAssignStaff = (booking: Booking) => {
        openGlobalAvailabilityChecker({ mode: 'direct-assign', booking });
    };

    const handleOpenCheckerFromForm = (formData: Partial<NewBookingData>, options?: { defaultTab?: 'staff' | 'teams' }) => {
        if (!editingItem && !isAddBookingModalOpen) return;
        
        setIsSwitchingToChecker(true);
        
        const onComplete = (result: Partial<NewBookingData>) => {
            closeAllModals(); // Close the checker
            if (editingItem) {
                setEditingItem(prev => prev ? { ...prev, ...result } : null);
            } else {
                openAddBookingModal(newBookingCustomerContext, { ...formData, ...result });
            }
            setIsSwitchingToChecker(false);
        };
        
        const onCancel = () => {
            closeAllModals(); // Close the checker
            setIsSwitchingToChecker(false);
        };

        openGlobalAvailabilityChecker({ mode: 'form-assist', formData, booking: editingItem || undefined, ...options }, onComplete, onCancel);
    };

    // Mutations
    const { mutate: addBooking } = useAddBooking({
        onSuccess: (newBooking) => {
            addToast(`Booking for ${newBooking.customer.name} created.`, 'success', 'Booking Created');
            closeModal();
        },
        onError: (error) => addToast(error.message, 'error', 'Creation Failed'),
    });
    
    const { mutate: updateBooking } = useUpdateBooking({
        onSuccess: (updated) => {
            addToast(`Booking for ${updated.customer.name} updated.`, 'success', 'Booking Updated');
            closeModal();
        },
        onError: (error) => addToast(error.message, 'error', 'Update Failed'),
    });

    const { mutate: deleteBooking } = useDeleteBooking({
        onSuccess: () => {
            addToast('Booking deleted successfully.', 'success', 'Booking Deleted');
            closeModal();
        },
        onError: (error) => addToast(error.message, 'error', 'Deletion Failed'),
    });

    const { mutate: updateStatus } = useUpdateBookingStatus({
        onSuccess: () => {
            addToast('Booking status updated.', 'success', 'Status Updated');
            closeModal();
        },
        onError: (error) => addToast(error.message, 'error', 'Update Failed'),
    });

    const { mutate: sendReminder } = useSendReminder({
        onSuccess: () => {
            addToast('Reminder sent successfully.', 'success', 'Reminder Sent');
            closeModal();
        },
        onError: (error) => addToast(error.message, 'error', 'Send Failed'),
    });
    
    const handleFormSubmit = (data: any) => {
        if (editingItem) {
            updateBooking({ id: editingItem.id, updateData: data });
        } else {
            addBooking(data);
        }
    };
    
    const isAddModalOpen = isAddBookingModalOpen && !isSwitchingToChecker;
    const isEditModalOpen = !!editingItem && !isSwitchingToChecker;

    return (
        <>
            <BookingsPage
                addToast={addToast}
                sortedBookings={sortedBookings}
                staff={staff}
                packages={packages}
                user={user}
                bookingFilters={bookingFilters}
                setBookingFilters={setBookingFilters}
                selectedBookings={selectedBookings}
                isAllSelected={isAllSelected}
                handleSelectAll={handleSelectAll}
                handleBookingSelect={handleBookingSelect}
                handleBulkDelete={handleBulkDelete}
                handleBulkUpdateStatus={handleBulkUpdateStatus}
                handleBulkAssignStaff={handleBulkAssignStaff}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                handleOpenViewModal={handleOpenViewModal}
                handleOpenEditModal={handleOpenEditModal}
                handleOpenDeleteModal={handleOpenDeleteModal}
                openAssignStaffModal={handleAssignStaff}
                openChangeStatusModal={openChangeStatusModal}
                openSendReminderModal={openSendReminderModal}
                openAddBookingModal={() => openAddBookingModal()}
                openGlobalAvailabilityChecker={() => openGlobalAvailabilityChecker({ mode: 'discovery' })}
                sortConfig={sortConfig}
                requestSort={requestSort}
            />

            {/* --- Modals --- */}
            <Modal isOpen={isAddModalOpen} onClose={closeModal} title="New Appointment" size="lg">
                <BookingForm 
                    initialCustomer={newBookingCustomerContext}
                    initialValues={newBookingInitialValues}
                    onSubmit={handleFormSubmit}
                    onClose={closeModal}
                    packages={packages}
                    customers={customers}
                    staff={staff}
                    addToast={addToast}
                    onOpenAvailabilityChecker={handleOpenCheckerFromForm}
                />
            </Modal>
            
            <Modal isOpen={isEditModalOpen} onClose={closeModal} title="Edit Appointment" size="lg">
                <BookingForm 
                    initialData={editingItem}
                    onSubmit={handleFormSubmit}
                    onClose={closeModal}
                    packages={packages}
                    customers={customers}
                    staff={staff}
                    addToast={addToast}
                    onOpenAvailabilityChecker={handleOpenCheckerFromForm}
                />
            </Modal>
            
            <BookingDetailsModal 
                booking={viewingItem} 
                onClose={closeModal} 
                addToast={addToast}
                onEdit={handleOpenEditModal}
                onAssignStaff={handleAssignStaff}
                onChangeStatus={openChangeStatusModal}
            />
            
            <ChangeStatusModal 
                booking={changingStatusFor}
                onClose={closeModal}
                onUpdate={(id, status) => updateStatus({ id, status })}
            />

            <ConfirmationModal 
                isOpen={!!deletingItem}
                onClose={closeModal}
                onConfirm={() => deletingItem && deleteBooking(deletingItem)}
                title="Delete Booking"
                message={<p>Are you sure you want to delete this booking? This action cannot be undone.</p>}
                confirmButtonText="Delete"
                confirmButtonVariant="danger"
            />
            
            <ConfirmationModal 
                isOpen={!!sendingReminderFor}
                onClose={closeModal}
                onConfirm={() => sendingReminderFor && sendReminder(sendingReminderFor.id)}
                title="Send SMS Reminder"
                message={<p>Send a reminder to <strong>{sendingReminderFor?.customer.name}</strong> for their appointment?</p>}
                confirmButtonText="Send"
            />
        </>
    );
}

export default BookingsView;
