import React from 'react';
import { Booking, Package, StaffMember, BookingStatus } from '../../types';
import { CogIcon, CheckCircleIcon, XCircleIcon, UserGroupIcon } from '../ui/icons';
import { formatTime, calculateEndTime } from '../../lib/utils';
import { useTeamStore } from '../../store/teamStore';

interface ScheduleBookingItemProps {
    booking: Booking;
    staff: StaffMember[];
    pkg: Package | undefined;
    onAssignStaff: (booking: Booking) => void;
}

const ScheduleBookingItem: React.FC<ScheduleBookingItemProps> = ({ booking, staff, pkg, onAssignStaff }) => {
    
    const assignedStaff = staff.find(s => s.id === booking.assignedStaffId);
    const assignedTeam = useTeamStore(state => state.teams).find(t => t.id === booking.assignedTeamId);
    
    const getBorderColor = () => {
        switch (booking.status) {
            case BookingStatus.Completed:
                return 'border-slate-400 dark:border-slate-600';
            case BookingStatus.Cancelled:
                return 'border-red-500 dark:border-red-700';
            case BookingStatus.Confirmed:
                return booking.assignedStaffId ? 'border-tinedy-green' : 'border-amber-500 dark:border-amber-400';
            case BookingStatus.Pending:
                return 'border-amber-500 dark:border-amber-400';
            default:
                return 'border-slate-300 dark:border-slate-700';
        }
    };
    
    const isInactive = booking.status === BookingStatus.Completed || booking.status === BookingStatus.Cancelled;

    const renderAssignmentOrStatus = () => {
        switch (booking.status) {
            case BookingStatus.Pending:
            case BookingStatus.Confirmed:
                return (
                     <button
                        onClick={() => onAssignStaff(booking)}
                        className={`w-full mt-2 py-1 px-2 text-xs rounded-md font-semibold transition-colors ${
                            assignedStaff || assignedTeam
                                ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                                : 'bg-amber-100 dark:bg-amber-900/20 text-amber-900 dark:text-amber-300 border border-amber-400 dark:border-amber-700 hover:bg-amber-200'
                        }`}
                        aria-label="Assign Staff or Team"
                     >
                        {assignedTeam ? (
                            <div className="flex items-center gap-1.5 justify-center truncate">
                                <UserGroupIcon className="w-3 h-3" />
                                <span className="truncate">{assignedTeam.name}</span>
                            </div>
                        ) : assignedStaff ? (
                            <span className="truncate">{assignedStaff.name}</span>
                        ) : 'Assign...'}
                     </button>
                );
            case BookingStatus.Completed:
                return (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mt-2">
                        <CheckCircleIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span className="truncate">Completed: {assignedStaff?.name || 'N/A'}</span>
                    </div>
                );
            case BookingStatus.Cancelled:
                 return (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-500 font-medium mt-2">
                        <XCircleIcon className="w-4 h-4" />
                        <span>Cancelled</span>
                    </div>
                );
            default: return null;
        }
    }

    const startTimeFormatted = formatTime(booking.bookingTime);
    const timeDisplay = pkg?.duration 
        ? `${startTimeFormatted} - ${calculateEndTime(booking.bookingTime, pkg.duration)}`
        : startTimeFormatted;

    return (
        <div 
            className={`border-l-4 p-2 rounded-r-md bg-white dark:bg-slate-800 shadow-sm transition-shadow duration-200 ${getBorderColor()} ${isInactive ? 'opacity-70' : ''}`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex flex-col">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate" title={timeDisplay}>{timeDisplay}</p>
                
                <div className="min-w-0 mt-1">
                    <p className={`font-semibold text-slate-900 dark:text-white text-sm truncate ${booking.status === BookingStatus.Cancelled ? 'line-through' : ''}`} title={booking.customer.name}>
                        {booking.customer.name}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate" title={pkg?.name || 'Unknown Package'}>
                        <CogIcon className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{pkg?.name || 'Unknown Package'}</span>
                    </div>
                </div>

                {renderAssignmentOrStatus()}
            </div>
        </div>
    );
};

export default ScheduleBookingItem;