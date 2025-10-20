import React from 'react';
import { StaffMember, ToastType } from '../types';
import StaffPage from '../components/staff/StaffPage';
import { useStaff, useAddStaff, useUpdateStaff, useDeleteStaff } from '../hooks/useStaff';
import { useCrudModals } from '../hooks/useCrudModals';
import { useUiStore } from '../store/uiStore';
import StaffDetailsModal from '../components/staff/StaffDetailsModal';

interface StaffViewProps {
    addToast: (message: string, type: ToastType, title: string) => void;
}

const StaffView: React.FC<StaffViewProps> = ({ addToast }) => {
    const { data: staff = [] } = useStaff();
    const { viewingItem, handleOpenViewModal, handleCloseModals: handleCloseViewModal } = useCrudModals<StaffMember>();

    // Global state for 'add' modal
    const { closeAllModals } = useUiStore();

    const { mutate: addStaff } = useAddStaff({
        onSuccess: (newStaff) => {
            addToast(`Staff member "${newStaff.name}" created successfully.`, 'success', 'Staff Added');
            closeAllModals();
        },
        onError: (error) => addToast(error.message, 'error', 'Error'),
    });

    const { mutate: updateStaff } = useUpdateStaff({
        onSuccess: (updatedStaff) => addToast(`Staff member "${updatedStaff.name}" updated successfully.`, 'success', 'Staff Updated'),
        onError: (error) => addToast(error.message, 'error', 'Error'),
    });
    
    const { mutate: deleteStaff } = useDeleteStaff({
        onSuccess: (deletedStaff) => addToast(`Staff member "${deletedStaff.name}" deleted.`, 'success', 'Staff Deleted'),
        onError: (error) => addToast(error.message, 'error', 'Error'),
    });

    const handleAdd = (staffData: Omit<StaffMember, 'id'>, password: string) => {
        addStaff({ staffData, password });
    };

    const handleDelete = (id: string) => {
        const staffToDelete = staff.find(s => s.id === id);
        if (staffToDelete) {
            deleteStaff(staffToDelete);
        }
    };
    
    const handleViewDetails = (staffMember: StaffMember) => {
        handleOpenViewModal(staffMember);
    }

    return (
        <>
            <StaffPage
                staff={staff}
                onAddStaff={handleAdd}
                onUpdateStaff={updateStaff}
                onDeleteStaff={handleDelete}
                onViewDetails={handleViewDetails}
            />
            <StaffDetailsModal staffMember={viewingItem} onClose={handleCloseViewModal} />
        </>
    );
};

export default StaffView;