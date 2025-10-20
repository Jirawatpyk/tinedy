import React, { useState, useMemo } from 'react';
import { StaffMember } from '../../types';
import { BriefcaseIcon, PlusIcon } from '../ui/icons';
import Pagination from '../ui/Pagination';
import Modal from '../ui/Modal';
import ConfirmationModal from '../ui/ConfirmationModal';
import StaffForm from './StaffForm';
import StaffItem from './StaffItem';
import Button from '../ui/Button';
import { Table, TableHeaderCell } from '../ui/Table';
import { useUiStore } from '../../store/uiStore';
import { useCrudModals } from '../../hooks/useCrudModals';
import SearchInput from '../ui/SearchInput';
import Card from '../ui/Card';

interface StaffPageProps {
  staff: StaffMember[];
  onAddStaff: (staffMember: Omit<StaffMember, 'id'>, password: string) => void;
  onUpdateStaff: (staffMember: StaffMember) => void;
  onDeleteStaff: (id: string) => void;
  onViewDetails: (staffMember: StaffMember) => void;
}

const STAFF_PER_PAGE = 10;

const StaffPage: React.FC<StaffPageProps> = ({ staff, onAddStaff, onUpdateStaff, onDeleteStaff, onViewDetails }) => {
  const { staffFilters, setStaffFilters } = useUiStore();
  const { isAddStaffModalOpen, openAddStaffModal, closeAllModals } = useUiStore();
  const { searchQuery } = staffFilters;
  const [currentPage, setCurrentPage] = useState(1);

  const { editingItem: editingStaff, deletingItem: deletingStaff, handleOpenEditModal, handleOpenDeleteModal, handleCloseModals } = useCrudModals<StaffMember>();

  const handleSearchChange = (newValue: string) => {
    setStaffFilters({ searchQuery: newValue });
    setCurrentPage(1);
  };

  const filteredStaff = useMemo(() => {
    const sortedStaff = [...staff].sort((a, b) => a.name.localeCompare(b.name));
    
    if (!searchQuery) {
        return sortedStaff;
    }

    return sortedStaff.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [staff, searchQuery]);

  const totalPages = Math.ceil(filteredStaff.length / STAFF_PER_PAGE);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * STAFF_PER_PAGE,
    currentPage * STAFF_PER_PAGE
  );
  
  const handleSubmit = (staffData: Omit<StaffMember, 'id'> | StaffMember, password?: string) => {
    if (editingStaff) {
      onUpdateStaff(staffData as StaffMember);
      handleCloseModals();
    } else {
      onAddStaff(staffData as Omit<StaffMember, 'id'>, password!);
      // Global close is handled in the view on success
    }
  };
  
  const handleDeleteConfirm = () => {
    if (deletingStaff) {
      onDeleteStaff(deletingStaff.id);
      handleCloseModals();
    }
  };

  const hasActiveSearch = searchQuery.trim().length > 0;
  
  const isFormModalOpen = isAddStaffModalOpen || !!editingStaff;
  const formModalTitle = editingStaff ? "Edit Staff Member" : "Add New Staff Member";

  return (
    <>
      <Card>
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                  <div className="bg-tinedy-blue/20 p-2 rounded-lg">
                     <BriefcaseIcon className="w-6 h-6 text-tinedy-blue"/>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Staff Members</h2>
              </div>
              <div className="flex items-center gap-4">
                  <div className="w-full sm:w-auto sm:max-w-xs">
                      <SearchInput
                          placeholder="Search by name or email..."
                          value={searchQuery}
                          onChange={handleSearchChange}
                      />
                  </div>
                  <Button onClick={openAddStaffModal}>
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Staff
                  </Button>
              </div>
          </div>
          
          <Table aria-label="Staff Members List">
              <Table.Header>
                  <TableHeaderCell className="basis-3/12">Staff Member</TableHeaderCell>
                  <TableHeaderCell className="basis-3/12 hidden md:block">Contact</TableHeaderCell>
                  <TableHeaderCell className="basis-2/12 hidden lg:block">Role</TableHeaderCell>
                  <TableHeaderCell className="basis-2/12 hidden lg:block">Rating</TableHeaderCell>
                  <TableHeaderCell className="basis-[120px] text-right">Actions</TableHeaderCell>
              </Table.Header>
              <Table.Body>
                  {paginatedStaff.length > 0 && paginatedStaff.map(member => (
                      <StaffItem
                          key={member.id}
                          member={member}
                          onViewDetails={onViewDetails}
                          onEdit={handleOpenEditModal}
                          onDelete={handleOpenDeleteModal}
                      />
                  ))}
              </Table.Body>
          </Table>
          
          {paginatedStaff.length === 0 && (
              <Table.EmptyState
                  icon={BriefcaseIcon}
                  title={hasActiveSearch ? `No staff found for "${searchQuery}"` : "No staff members yet"}
                  message={hasActiveSearch ? "Try a different search term." : "Get started by adding your first team member."}
                  action={!hasActiveSearch ? <Button onClick={openAddStaffModal}><PlusIcon className="w-5 h-5 mr-2" />Add Staff</Button> : null}
              />
          )}

          {filteredStaff.length > 0 && (
              <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={STAFF_PER_PAGE}
                  totalItems={filteredStaff.length}
              />
          )}
      </Card>
      
      <Modal isOpen={isFormModalOpen} onClose={editingStaff ? handleCloseModals : closeAllModals} title={formModalTitle}>
        <StaffForm initialData={editingStaff} onSubmit={handleSubmit} onClose={editingStaff ? handleCloseModals : closeAllModals} />
      </Modal>

      {deletingStaff && (
         <ConfirmationModal
            isOpen={!!deletingStaff}
            onClose={handleCloseModals}
            onConfirm={handleDeleteConfirm}
            title="Delete Staff Member"
            message={
                <p>Are you sure you want to delete <strong>{deletingStaff.name}</strong>? This action cannot be undone.</p>
            }
            confirmButtonText="Delete"
            confirmButtonVariant="danger"
         />
      )}
    </>
  );
};

export default StaffPage;