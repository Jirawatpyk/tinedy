import React, { useState } from 'react';
import { Package } from '../../types';
import { ArchiveBoxIcon, PlusIcon } from '../ui/icons';
import Pagination from '../ui/Pagination';
import Modal from '../ui/Modal';
import ConfirmationModal from '../ui/ConfirmationModal';
import Button from '../ui/Button';
import PackageItem from './PackageItem';
// FIX: Import TableHeaderCell to resolve reference errors.
import { Table, TableHeaderCell } from '../ui/Table';
import Card from '../ui/Card';
import { useUiStore } from '../../store/uiStore';
import { useCrudModals } from '../../hooks/useCrudModals';
import PackageForm from './PackageForm';

interface PackagesPageProps {
  packages: Package[];
  onAddPackage: (pkg: Omit<Package, 'id' | 'createdAt'>) => void;
  onUpdatePackage: (pkg: Package) => void;
  onDeletePackage: (id: string) => void;
  onViewDetails: (pkg: Package) => void;
}

const PACKAGES_PER_PAGE = 10;

const PackagesPage: React.FC<PackagesPageProps> = ({ packages, onAddPackage, onUpdatePackage, onDeletePackage, onViewDetails }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { isAddPackageModalOpen, openAddPackageModal, closeAllModals } = useUiStore();
  const { editingItem: editingPackage, deletingItem: deletingPackage, handleOpenEditModal, handleOpenDeleteModal, handleCloseModals } = useCrudModals<Package>();
  
  const totalPages = Math.ceil(packages.length / PACKAGES_PER_PAGE);
  const paginatedPackages = packages.slice(
    (currentPage - 1) * PACKAGES_PER_PAGE,
    currentPage * PACKAGES_PER_PAGE
  );
  
  const handleFormSubmit = (pkgData: Omit<Package, 'id' | 'createdAt'> | Package) => {
    if (editingPackage) {
      onUpdatePackage(pkgData as Package);
      handleCloseModals();
    } else {
      onAddPackage(pkgData as Omit<Package, 'id' | 'createdAt'>);
      // Global close is handled in the view on success
    }
  };
  
  const handleDeleteConfirm = () => {
    if (deletingPackage) {
      onDeletePackage(deletingPackage.id);
      handleCloseModals();
    }
  };

  const isFormModalOpen = isAddPackageModalOpen || !!editingPackage;
  const formModalTitle = editingPackage ? "Edit Package" : "Add New Package";
  
  return (
    <>
      <Card>
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                  <div className="bg-tinedy-blue/20 p-2 rounded-lg">
                     <ArchiveBoxIcon className="w-6 h-6 text-tinedy-blue"/>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Service Packages</h2>
              </div>
              <Button onClick={openAddPackageModal}>
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Package
              </Button>
          </div>
          
          <Table aria-label="Service Packages List">
              <Table.Header>
                  <TableHeaderCell className="basis-4/12">Package</TableHeaderCell>
                  <TableHeaderCell className="basis-4/12 hidden md:block">Services</TableHeaderCell>
                  <TableHeaderCell className="basis-2/12 hidden lg:block">Info</TableHeaderCell>
                  <TableHeaderCell className="basis-[120px] text-right">Actions</TableHeaderCell>
              </Table.Header>
              <Table.Body>
                {paginatedPackages.length > 0 && paginatedPackages.map(pkg => (
                  <PackageItem 
                    key={pkg.id}
                    pkg={pkg}
                    onViewDetails={onViewDetails}
                    onEdit={handleOpenEditModal}
                    onDelete={handleOpenDeleteModal}
                  />
                ))}
              </Table.Body>
          </Table>

          {paginatedPackages.length === 0 && (
              <Table.EmptyState 
                icon={ArchiveBoxIcon}
                title="No packages have been created"
                message='Click "Add Package" to create a new service offering for your customers.'
                action={<Button onClick={openAddPackageModal}><PlusIcon className="w-5 h-5 mr-2" />Add Package</Button>}
              />
          )}
          
          {packages.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={PACKAGES_PER_PAGE}
                totalItems={packages.length}
              />
          )}
      </Card>

      <Modal isOpen={isFormModalOpen} onClose={editingPackage ? handleCloseModals : closeAllModals} title={formModalTitle}>
        <PackageForm 
          initialData={editingPackage} 
          onSubmit={handleFormSubmit} 
          onClose={editingPackage ? handleCloseModals : closeAllModals}
        />
      </Modal>

      {deletingPackage && (
         <ConfirmationModal
            isOpen={!!deletingPackage}
            onClose={handleCloseModals}
            onConfirm={handleDeleteConfirm}
            title="Delete Package"
            message={
              <>
                <p>Are you sure you want to delete the package <strong>"{deletingPackage.name}"</strong>? This action cannot be undone.</p>
                <p className="mt-2 text-sm text-amber-700 bg-amber-50 p-2 rounded-md"><strong>Warning:</strong> Deleting this package will not affect existing bookings, but it cannot be selected for new bookings.</p>
              </>
            }
            confirmButtonText="Delete"
            confirmButtonVariant="danger"
         />
      )}
    </>
  );
};

export default PackagesPage;