import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }) => {
  // Hide component if there are no items to paginate
  if (totalItems === 0) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 border-t border-slate-200 dark:border-slate-800 pt-4 gap-4">
        <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{startItem}</span> to <span className="font-semibold text-slate-700 dark:text-slate-200">{endItem}</span> of <span className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</span> results
            </p>
        </div>
        
        {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                 aria-label="Previous page"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              <div className="flex items-center justify-center min-w-[80px]">
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium px-2">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
    
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
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

export default Pagination;