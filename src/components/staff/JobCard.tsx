import React from 'react';
import { Booking, BookingStatus } from '../../types';
import { usePackageStore } from '../../store/packageStore';
import { formatTime, calculateEndTime, formatDate } from '../../lib/utils';
import { MapPinIcon, UserIcon, ArchiveBoxIcon, QueueListIcon, CalendarDaysIcon } from '../ui/icons';
import { STATUS_CONFIG } from '../../constants';


interface JobCardProps {
    booking: Booking;
    onViewDetails: (booking: Booking) => void;
}

const JobCard: React.FC<JobCardProps> = ({ booking, onViewDetails }) => {
    const pkg = usePackageStore(state => state.packages).find(p => p.id === booking.packageId);
    
    const statusConfig = STATUS_CONFIG[booking.status];
    const borderColorClass = statusConfig.dotColor.replace('bg-', 'border-');

    return (
        <div 
            onClick={() => onViewDetails(booking)}
            className={`bg-white dark:bg-slate-800 rounded-xl shadow-md shadow-slate-200/50 dark:shadow-none dark:border dark:border-slate-700/50 border-l-4 ${borderColorClass} flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:scale-[0.99] cursor-pointer font-rule overflow-hidden`}
            role="button"
            tabIndex={0}
            aria-label={`View details for job with ${booking.customer.name}`}
        >
            {/* Header: Booking Number & Date */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                    <QueueListIcon className="w-3.5 h-3.5" />
                    <span>{booking.bookingNumber}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <CalendarDaysIcon className="w-3.5 h-3.5" />
                    <span>{formatDate(booking.bookingDate, { day: 'numeric', month: 'long', year: 'numeric' }, 'th-TH')}</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 flex gap-4">
                {/* Time Column */}
                <div className="flex flex-col items-center justify-center w-24 text-center flex-shrink-0">
                    <p className="font-bold text-xl text-tinedy-blue dark:text-tinedy-yellow">{formatTime(booking.bookingTime, undefined, 'th-TH')}</p>
                    {pkg && pkg.duration && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            ถึง {calculateEndTime(booking.bookingTime, pkg.duration, 'th-TH')}
                        </p>
                    )}
                </div>
                
                {/* Details Column */}
                <div className="flex-grow min-w-0 space-y-2.5">
                    <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <p className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">{booking.customer.name}</p>
                    </div>
                     <div className="flex items-center gap-2">
                        <ArchiveBoxIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{pkg?.name || 'ไม่พบแพ็คเกจ'}</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <MapPinIcon className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{booking.address}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobCard;