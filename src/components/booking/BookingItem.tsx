import React, { useState, useEffect, useRef } from 'react';
import { Booking, StaffMember, Package, User } from '../../types';
import { STATUS_CONFIG } from '../../constants';
import StatusBadge from '../ui/StatusBadge';
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu';
import { PencilIcon, TrashIcon, UserIcon, ClipboardDocumentCheckIcon, PaperAirplaneIcon, ListBulletIcon, ArchiveBoxIcon, CalendarDaysIcon, ClockIcon, UserGroupIcon } from '../ui/icons';
import { formatDate, formatTime, calculateEndTime } from '../../lib/utils';
import { TableRow, TableCell } from '../ui/Table';
import Checkbox from '../ui/Checkbox';
import { useTeamStore } from '../../store/teamStore';

interface BookingItemProps {
  booking: Booking;
  staff: StaffMember[];
  packages: Package[];
  user: User;
  onSelect: (bookingId: string) => void;
  isSelected: boolean;
  onViewDetails: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
  onAssignStaff: (booking: Booking) => void;
  onChangeStatus: (booking: Booking) => void;
  onSendReminder: (booking: Booking) => void;
  isHighlighted?: boolean; // Allow parent to control highlighting
}

const BookingItem: React.FC<BookingItemProps> = ({
  booking,
  staff,
  packages,
  user,
  onSelect,
  isSelected,
  onViewDetails,
  onEdit,
  onDelete,
  onAssignStaff,
  onChangeStatus,
  onSendReminder,
  isHighlighted: isHighlightedByParent = false,
}) => {
  const pkg = packages.find(p => p.id === booking.packageId);
  const assignedStaff = staff.find(s => s.id === booking.assignedStaffId);
  const assignedTeam = useTeamStore(state => state.teams).find(t => t.id === booking.assignedTeamId);
  const statusConfig = STATUS_CONFIG[booking.status];

  const canManage = user.role === 'admin' || user.role === 'manager';

  const [isHighlighted, setIsHighlighted] = useState(false);
  const isInitialMount = useRef(true); // To prevent highlighting on first render

  // This effect tracks changes to specific booking properties.
  // It avoids issues with object reference changes on list refetches.
  useEffect(() => {
    // Skip the effect on the initial render.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // If we reach here, it's a subsequent render and a property has changed.
    setIsHighlighted(true);
    const timer = setTimeout(() => setIsHighlighted(false), 3000); // Corresponds to animation duration

    // Cleanup function to clear the timer if the component unmounts
    // or if the effect re-runs before the timer finishes.
    return () => clearTimeout(timer);
  }, [
    booking.status,
    booking.assignedStaffId,
    booking.assignedTeamId,
    booking.bookingDate,
    booking.bookingTime,
    booking.packageId,
  ]);
  
  const AssignmentDisplay = () => {
    if (assignedTeam) {
        return (
            <>
                <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <UserGroupIcon className="w-4 h-4 text-slate-500" />
                    {assignedTeam.name}
                </p>
                {assignedStaff && <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">Lead: {assignedStaff.name}</p>}
            </>
        );
    }
    if (assignedStaff) {
        return (
            <>
                <p className="font-semibold text-slate-700 dark:text-slate-300">{assignedStaff.name}</p>
                {assignedStaff.role && <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{assignedStaff.role}</p>}
            </>
        );
    }
    return <p className="font-semibold text-slate-700 dark:text-slate-300 italic text-slate-400 dark:text-slate-500">Unassigned</p>;
  }

  const renderDropdownMenuItems = () => (
    <>
      <DropdownMenuItem onClick={() => onEdit(booking)}>
        <PencilIcon className="w-4 h-4" /> Edit Booking
      </DropdownMenuItem>
      {canManage && (
        <>
          <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
          <DropdownMenuItem onClick={() => onAssignStaff(booking)}>
            <UserIcon className="w-4 h-4" /> Assign Staff/Team
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeStatus(booking)}>
            <ClipboardDocumentCheckIcon className="w-4 h-4" /> Change Status
          </DropdownMenuItem>
           <DropdownMenuItem onClick={() => onSendReminder(booking)} disabled={booking.reminderSent}>
            <PaperAirplaneIcon className="w-4 h-4" /> Send Reminder
          </DropdownMenuItem>
          <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
          <DropdownMenuItem onClick={() => onDelete(booking)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
            <TrashIcon className="w-4 h-4" /> Delete Booking
          </DropdownMenuItem>
        </>
      )}
    </>
  );

  return (
    <TableRow 
        className={`group even:bg-transparent dark:even:bg-slate-800/50 cursor-pointer ${isSelected ? 'bg-tinedy-blue/10 dark:bg-tinedy-blue/20' : ''} ${isHighlighted || isHighlightedByParent ? 'animate-highlight-fade' : ''}`}
        onClick={() => onViewDetails(booking)}
    >
        <TableCell 
            className="w-16 flex-none"
            onClick={(e) => e.stopPropagation()}
        >
            <Checkbox
              checked={isSelected}
              onChange={() => onSelect(booking.id)}
              aria-label={`Select booking for ${booking.customer.name}`}
            />
        </TableCell>
        
        {/* --- Mobile View Cell --- */}
        <TableCell className="flex-grow min-w-0 md:hidden !py-4">
            <div className="w-full">
                {/* Top row: Name, Status, Actions */}
                <div className="flex justify-between items-start mb-3">
                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate pr-2">{booking.customer.name}</p>
                    <div 
                        className="flex-shrink-0 flex items-center gap-2 -mr-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <StatusBadge status={booking.status} />
                        <DropdownMenu>
                            {renderDropdownMenuItems()}
                        </DropdownMenu>
                    </div>
                </div>

                {/* Main info grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {/* Left column */}
                    <div className="space-y-1.5 truncate">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <ArchiveBoxIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{pkg?.name || 'Unknown Package'}</span>
                        </div>
                         <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                           {assignedTeam ? <UserGroupIcon className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <UserIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                           <span className="font-medium truncate">{assignedTeam?.name || assignedStaff?.name || <span className="italic text-slate-500 dark:text-slate-400">Unassigned</span>}</span>
                        </div>
                    </div>
                    
                    {/* Right column */}
                    <div className="space-y-1.5 text-right">
                        <div className="flex items-center justify-end gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="truncate">{formatDate(booking.bookingDate, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <CalendarDaysIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        </div>
                        <div className="flex items-center justify-end gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="truncate">
                                {pkg && pkg.duration
                                    ? `${formatTime(booking.bookingTime)} - ${calculateEndTime(booking.bookingTime, pkg.duration)}`
                                    : formatTime(booking.bookingTime)
                                }
                            </span>
                            <ClockIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        </div>
                    </div>
                </div>
            </div>
        </TableCell>
        
        {/* --- Desktop View Cells --- */}
        <TableCell className="w-6 flex-none !px-0 hidden md:block">
            <div className={`w-1 h-10 rounded-full ${statusConfig?.dotColor || 'bg-slate-300'}`}></div>
        </TableCell>
        <TableCell className="flex-1 md:basis-3/12 min-w-0 hidden md:block">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{booking.customer.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{booking.customer.email}</p>
          </div>
        </TableCell>
        <TableCell className="flex-1 md:basis-2/12 min-w-0 hidden md:block">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{pkg?.name || 'Unknown Package'}</p>
            {pkg && (
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    ฿{pkg.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            )}
          </div>
        </TableCell>
        <TableCell className="md:basis-2/12 hidden md:block grow-0">
          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(booking.bookingDate, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {pkg && pkg.duration
                    ? `${formatTime(booking.bookingTime)} - ${calculateEndTime(booking.bookingTime, pkg.duration)}`
                    : formatTime(booking.bookingTime)
                }
            </p>
          </div>
        </TableCell>
        <TableCell className="md:basis-2/12 hidden md:block grow-0">
          <div>
            <AssignmentDisplay />
          </div>
        </TableCell>
        <TableCell className="md:basis-2/12 hidden md:block grow-0 justify-center">
          <StatusBadge status={booking.status} />
        </TableCell>
        <TableCell className="md:basis-1/12 hidden md:block grow-0 justify-center">
          {booking.reminderSent ? 
              <span className="text-sm font-semibold text-tinedy-green">Sent</span> : 
              <span className="text-sm text-slate-400">Not Sent</span>
          }
        </TableCell>
        <TableCell 
            className="basis-[60px] shrink-0 grow-0 justify-end hidden md:flex"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                <DropdownMenu>
                    {renderDropdownMenuItems()}
                </DropdownMenu>
            </div>
        </TableCell>
    </TableRow>
  );
};

export default BookingItem;