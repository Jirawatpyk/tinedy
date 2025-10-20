import React, { useState } from 'react';
import { Booking, Package, StaffMember } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, MapPinIcon } from '../ui/icons';
import { formatDate, formatTime } from '../../lib/utils';

interface BookingHistoryListProps {
  bookings: Booking[];
  packages: Package[];
  staff: StaffMember[];
}

const ITEMS_PER_PAGE = 3;

const BookingHistoryList: React.FC<BookingHistoryListProps> = ({ bookings, packages, staff }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const sortedBookings = [...bookings].sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
  const totalItems = sortedBookings.length;

  if (totalItems === 0) {
    return (
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Booking History</h3>
        <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
          <CalendarDaysIcon className="w-12 h-12 mx-auto text-slate-300" />
          <p className="mt-4 text-slate-500 font-semibold">No Booking History</p>
          <p className="text-sm text-slate-400 mt-1">This customer has not made any bookings yet.</p>
        </div>
      </div>
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedBookings = sortedBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Booking History</h3>
        {totalItems > 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold">{startItem}</span> to <span className="font-semibold">{endItem}</span> of <span className="font-semibold">{totalItems}</span> results
          </p>
        )}
      </div>
      <div className="space-y-3">
        {paginatedBookings.map(booking => {
            const pkg = packages.find(p => p.id === booking.packageId);
            const assignedStaff = staff.find(s => s.id === booking.assignedStaffId);
            return (
            <div key={booking.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                <div className="sm:w-1/3">
                <p className="font-bold text-slate-800 dark:text-slate-200">{formatDate(booking.bookingDate)}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{formatTime(booking.bookingTime)}</p>
                </div>
                <div className="flex-grow min-w-0">
                <p className="font-semibold text-tinedy-blue">{pkg?.name || 'Unknown Package'}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Assigned to: {assignedStaff?.name || <span className="italic">Unassigned</span>}
                </p>
                 <div className="flex items-start gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                        <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="hover:text-tinedy-blue hover:underline"
                        >
                            {booking.address}
                        </a>
                    </div>
                </div>
                <div className="flex-shrink-0 text-left sm:text-right mt-2 sm:mt-0">
                    <StatusBadge status={booking.status} />
                </div>
            </div>
            );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-3 py-1 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                aria-label="Previous page"
            >
                <ChevronLeftIcon className="w-4 h-4" />
                <span>Prev</span>
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-3 py-1 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                aria-label="Next page"
            >
                <span>Next</span>
                <ChevronRightIcon className="w-4 h-4" />
            </button>
        </div>
      )}
    </div>
  );
};

export default BookingHistoryList;
