import React, { useState } from 'react';
import { BookingStatus } from '../../types';
import { STATUS_CONFIG } from '../../constants';
import Select from '../ui/Select';
import NativeDatePicker from '../ui/NativeDatePicker';
import SearchInput from '../ui/SearchInput';
import { BookingFilters } from '../../store/uiStore';
import { ChevronDownIcon, ChevronUpIcon } from '../ui/icons';

interface BookingFilterBarProps {
  filters: BookingFilters;
  onFilterChange: (filters: Partial<BookingFilters>) => void;
}

const BookingFilterBar: React.FC<BookingFilterBarProps> = ({
  filters,
  onFilterChange,
}) => {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    ...Object.entries(STATUS_CONFIG).map(([status, config]) => ({ value: status, label: config.label }))
  ];
  
  const assignmentOptions = [
    { value: 'all', label: 'All Assignments' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'unassigned', label: 'Unassigned' },
  ];

  return (
    <div className="mb-6">
      <div className="lg:hidden p-2 -mx-2 flex justify-between items-center" onClick={() => setIsMobileFiltersOpen(prev => !prev)}>
        <h3 className="font-semibold text-slate-700 dark:text-slate-200">Filters</h3>
        <button 
            aria-expanded={isMobileFiltersOpen}
            aria-controls="booking-filter-content-fields"
            className="p-1 -m-1"
        >
          {isMobileFiltersOpen ? <ChevronUpIcon className="w-5 h-5 text-slate-500" /> : <ChevronDownIcon className="w-5 h-5 text-slate-500" />}
        </button>
      </div>
      
      <div
        id="booking-filter-content-fields"
        className={`${isMobileFiltersOpen ? 'block pt-4 animate-fade-in-up' : 'hidden'} lg:block`}
        style={{animationDuration: '200ms'}}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <SearchInput
              id="search-bookings"
              aria-label="Search Bookings"
              placeholder="Search by customer, email, package..."
              value={filters.searchQuery}
              onChange={(query) => onFilterChange({ searchQuery: query })}
            />
          </div>

          {/* Status Filter */}
          <Select
              id="status-filter"
              label=""
              aria-label="Filter by status"
              value={filters.status}
              onChange={(status) => onFilterChange({ status: status as BookingStatus | 'all' })}
              options={statusOptions}
          />
          
           {/* Assignment Filter */}
          <Select
              id="assignment-filter"
              label=""
              aria-label="Filter by assignment"
              value={filters.assignment}
              onChange={(assignment) => onFilterChange({ assignment: assignment as 'all' | 'unassigned' | 'assigned' })}
              options={assignmentOptions}
          />

          {/* Booking Date Filter */}
          <NativeDatePicker
              id="booking-date-filter"
              label=""
              aria-label="Filter by booking date"
              value={filters.bookingDate}
              onChange={(date) => onFilterChange({ bookingDate: date })}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingFilterBar;