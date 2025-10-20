import React from 'react';
import { Booking, ToastType, BookingStatus, StaffMember, Package, User } from '../../types';
import { ListBulletIcon, PlusIcon, ChevronDownIcon, ChevronUpIcon, ChevronUpDownIcon } from '../ui/icons';
import Pagination from '../ui/Pagination';
import Button from '../ui/Button';
import { Table, TableHeaderCell } from '../ui/Table';
import Checkbox from '../ui/Checkbox';
import BookingItem from './BookingItem';
import BookingFilterBar from './BookingFilterBar';
import BookingBulkActions from './BookingBulkActions';
import { BookingFilters } from '../../store/uiStore';
import { SortConfig } from '../../hooks/useTableSort';

type SortableBooking = Booking & {
    _customerName: string;
    _packageName: string;
    _dateTime: string;
    _assignmentName: string;
};

interface BookingsPageProps {
  addToast: (message: string, type: ToastType, title: string) => void;
  sortedBookings: SortableBooking[];
  staff: StaffMember[];
  packages: Package[];
  user: User | null;
  bookingFilters: BookingFilters;
  setBookingFilters: (filters: Partial<BookingFilters>) => void;
  selectedBookings: string[];
  isAllSelected: boolean;
  handleSelectAll: () => void;
  handleBookingSelect: (id: string) => void;
  handleBulkDelete: () => void;
  handleBulkUpdateStatus: (status: BookingStatus) => void;
  handleBulkAssignStaff: (staffId: string | null) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  handleOpenViewModal: (booking: Booking) => void;
  handleOpenEditModal: (booking: Booking) => void;
  handleOpenDeleteModal: (booking: Booking) => void;
  openAssignStaffModal: (booking: Booking) => void;
  openChangeStatusModal: (booking: Booking) => void;
  openSendReminderModal: (booking: Booking) => void;
  openAddBookingModal: () => void;
  openGlobalAvailabilityChecker: () => void;
  sortConfig: SortConfig<SortableBooking> | null;
  requestSort: (key: keyof SortableBooking) => void;
}

const BOOKINGS_PER_PAGE = 10;

const SortableHeader: React.FC<{
  sortKey: keyof SortableBooking;
  sortConfig: SortConfig<SortableBooking> | null;
  onRequestSort: (key: keyof SortableBooking) => void;
  className?: string;
  children: React.ReactNode;
}> = ({ sortKey, sortConfig, onRequestSort, className, children }) => {
    const isSorted = sortConfig?.key === sortKey;
    const direction = isSorted ? sortConfig?.direction : undefined;
    
    return (
        <TableHeaderCell className={`cursor-pointer ${className}`} onClick={() => onRequestSort(sortKey)}>
            <div className="flex items-center gap-1.5 group hover:text-slate-800 dark:hover:text-slate-200">
                <span>{children}</span>
                {isSorted ? (
                    direction === 'asc' ? <ChevronUpIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" /> : <ChevronDownIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                ) : (
                    <ChevronUpDownIcon className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
            </div>
        </TableHeaderCell>
    );
};


const BookingsPage: React.FC<BookingsPageProps> = ({
    addToast,
    sortedBookings,
    staff,
    packages,
    user,
    bookingFilters,
    setBookingFilters,
    selectedBookings,
    isAllSelected,
    handleSelectAll,
    handleBookingSelect,
    handleBulkDelete,
    handleBulkUpdateStatus,
    handleBulkAssignStaff,
    currentPage,
    setCurrentPage,
    handleOpenViewModal,
    handleOpenEditModal,
    handleOpenDeleteModal,
    openAssignStaffModal,
    openChangeStatusModal,
    openSendReminderModal,
    openAddBookingModal,
    openGlobalAvailabilityChecker,
    sortConfig,
    requestSort,
}) => {
    
    // Pagination
    const totalPages = Math.ceil(sortedBookings.length / BOOKINGS_PER_PAGE);
    const paginatedBookings = sortedBookings.slice(
        (currentPage - 1) * BOOKINGS_PER_PAGE,
        currentPage * BOOKINGS_PER_PAGE
    );

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg shadow-slate-200/40 dark:shadow-none dark:border dark:border-slate-800 flex flex-col flex-grow min-h-0">
            <div className="flex justify-between items-center mb-5 pb-5 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <ListBulletIcon className="w-8 h-8 text-slate-500 dark:text-slate-400"/>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Bookings</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={openAddBookingModal}>
                        <PlusIcon className="w-5 h-5 sm:mr-2" />
                        <span className="hidden sm:inline">New Booking</span>
                    </Button>
                </div>
            </div>

            <BookingFilterBar 
                filters={bookingFilters}
                onFilterChange={setBookingFilters}
            />
            
            {selectedBookings.length > 0 && user && (user.role === 'admin' || user.role === 'manager') && (
                <BookingBulkActions 
                    selectedCount={selectedBookings.length}
                    staff={staff}
                    onDelete={handleBulkDelete}
                    onUpdateStatus={handleBulkUpdateStatus}
                    onAssignStaff={handleBulkAssignStaff}
                />
            )}
            
            <div className="overflow-y-auto flex-grow -mx-6 px-6">
                <Table aria-label="Bookings List">
                    <Table.Header isSticky>
                        <TableHeaderCell className="flex-none w-16">
                            <Checkbox checked={isAllSelected} onChange={handleSelectAll} aria-label="Select all bookings"/>
                        </TableHeaderCell>
                        <TableHeaderCell className="w-6 flex-none !px-0 hidden md:block"></TableHeaderCell>
                        <SortableHeader sortKey="_customerName" sortConfig={sortConfig} onRequestSort={requestSort} className="flex-1 md:basis-3/12 min-w-0 hidden md:block">Customer</SortableHeader>
                        <SortableHeader sortKey="_packageName" sortConfig={sortConfig} onRequestSort={requestSort} className="flex-1 md:basis-2/12 min-w-0 hidden md:block">Package</SortableHeader>
                        <SortableHeader sortKey="_dateTime" sortConfig={sortConfig} onRequestSort={requestSort} className="md:basis-2/12 hidden md:block grow-0">Date & Time</SortableHeader>
                        <SortableHeader sortKey="_assignmentName" sortConfig={sortConfig} onRequestSort={requestSort} className="md:basis-2/12 hidden md:block grow-0">Assignment</SortableHeader>
                        <SortableHeader sortKey="status" sortConfig={sortConfig} onRequestSort={requestSort} className="md:basis-2/12 hidden md:block grow-0 justify-center">Status</SortableHeader>
                        <SortableHeader sortKey="reminderSent" sortConfig={sortConfig} onRequestSort={requestSort} className="md:basis-1/12 hidden md:block grow-0 justify-center">Reminder</SortableHeader>
                        <TableHeaderCell className="basis-[60px] shrink-0 grow-0 flex justify-end"></TableHeaderCell>
                    </Table.Header>
                    <Table.Body>
                        {paginatedBookings.map(booking => (
                            <BookingItem 
                                key={booking.id}
                                booking={booking}
                                staff={staff}
                                packages={packages}
                                user={user!}
                                isSelected={selectedBookings.includes(booking.id)}
                                onSelect={handleBookingSelect}
                                onViewDetails={handleOpenViewModal}
                                onEdit={handleOpenEditModal}
                                onDelete={handleOpenDeleteModal}
                                onAssignStaff={openAssignStaffModal}
                                onChangeStatus={openChangeStatusModal}
                                onSendReminder={openSendReminderModal}
                            />
                        ))}
                    </Table.Body>
                </Table>

                {paginatedBookings.length === 0 && (
                    <Table.EmptyState 
                        icon={ListBulletIcon}
                        title="No bookings found"
                        message="Try adjusting your search filters or create a new booking."
                    />
                )}
            </div>

            {sortedBookings.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={BOOKINGS_PER_PAGE}
                    totalItems={sortedBookings.length}
                />
            )}
        </div>
    );
};

export default BookingsPage;
