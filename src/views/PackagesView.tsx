import React from 'react';
import { Package, ToastType } from '../types';
import PackagesPage from '../components/package/PackagesPage';
import { usePackages, useAddPackage, useUpdatePackage, useDeletePackage } from '../hooks/usePackages';
import { useCrudModals } from '../hooks/useCrudModals';
import { useUiStore } from '../store/uiStore';
import PackageDetailsModal from '../components/package/PackageDetailsModal';

interface PackagesViewProps {
    addToast: (message: string, type: ToastType, title: string) => void;
}

const PackagesView: React.FC<PackagesViewProps> = ({ addToast }) => {
    const { data: packages = [] } = usePackages();
    const { viewingItem, handleOpenViewModal, handleCloseModals: handleCloseViewModal } = useCrudModals<Package>();

    // Global state for 'add' modal
    const { closeAllModals } = useUiStore();

    const { mutate: addPackage } = useAddPackage({
        onSuccess: (newPackage) => {
            addToast(`Package "${newPackage.name}" created successfully.`, 'success', 'Package Added');
            closeAllModals();
        },
        onError: (error) => addToast(error.message, 'error', 'Error'),
    });

    const { mutate: updatePackage } = useUpdatePackage({
        onSuccess: (updatedPackage) => addToast(`Package "${updatedPackage.name}" updated successfully.`, 'success', 'Package Updated'),
        onError: (error) => addToast(error.message, 'error', 'Error'),
    });
    
    const { mutate: deletePackage } = useDeletePackage({
        onSuccess: (deletedPackage) => addToast(`Package "${deletedPackage.name}" deleted.`, 'success', 'Package Deleted'),
        onError: (error) => addToast(error.message, 'error', 'Error'),
    });

    const handleDelete = (id: string) => {
        const packageToDelete = packages.find(p => p.id === id);
        if (packageToDelete) {
            deletePackage(packageToDelete);
        }
    };
    
    const handleViewDetails = (pkg: Package) => {
        handleOpenViewModal(pkg);
    }

    return (
        <>
            <PackagesPage
                packages={packages}
                onAddPackage={addPackage}
                onUpdatePackage={updatePackage}
                onDeletePackage={handleDelete}
                onViewDetails={handleViewDetails}
            />
            <PackageDetailsModal pkg={viewingItem} onClose={handleCloseViewModal} />
        </>
    );
};

export default PackagesView;