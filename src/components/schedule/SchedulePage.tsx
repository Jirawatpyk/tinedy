import React, { useMemo, useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Booking, Package, StaffMember, BookingStatus } from '../../types';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, ClockIcon, XMarkIcon } from '../ui/icons';
import Select from '../ui/Select';
import ScheduleBookingItem from './ScheduleBookingItem';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { formatTime, formatDate } from '../../lib/utils';
import { STATUS_CONFIG } from '../../constants';
import { useUiStore } from '../../store/uiStore';

interface SchedulePageProps {
    bookings: Booking[];
    staff: StaffMember[];
    packages: Package[];
    // FIX: Changed onAssignStaff to expect a Booking object to match the implementation in child components and the parent view.
    onAssignStaff: (booking: Booking) => void;
    onAddBooking: (date: string) => void;
}

type StatusFilter = 'all' | 'needs-assignment' | 'upcoming' | BookingStatus.Completed | BookingStatus.Cancelled;

const MAX_VISIBLE_BOOKINGS_PER_DAY_WEEK = 2;
const MAX_VISIBLE_BOOKINGS_PER_DAY_MONTH = 2;


// --- Date Helper Functions ---
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDateToYMD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Smart Popover Component ---
interface SchedulePopoverProps {
    anchorEl: HTMLElement;
    date: Date;
    bookingsForDay: Booking[];
    onClose: () => void;
    onAddBooking: (date: string) => void;
    // Props to pass down to ScheduleBookingItem
    staff: StaffMember[];
    packages: Package[];
    // FIX: Changed onAssignStaff to expect a Booking object to align with SchedulePageProps.
    onAssignStaff: (booking: Booking) => void;
}

const SchedulePopover: React.FC<SchedulePopoverProps> = ({ anchorEl, date, bookingsForDay, onClose, onAddBooking, staff, packages, onAssignStaff }) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({
        opacity: 0,
        position: 'fixed',
        zIndex: 30,
    });

    useLayoutEffect(() => {
        if (!anchorEl || !popoverRef.current) return;

        const rect = anchorEl.getBoundingClientRect();
        const popoverRect = popoverRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const margin = 8;

        let top = rect.bottom + margin;
        if (top + popoverRect.height > viewportHeight - margin) {
            top = rect.top - popoverRect.height - margin;
        }

        let left = rect.left;
        if (left + popoverRect.width > viewportWidth - margin) {
            left = rect.right - popoverRect.width;
        }
        if (left < margin) {
            left = margin;
        }
        
        setStyle({
            position: 'fixed',
            top: `${top}px`,
            left: `${left}px`,
            zIndex: 30,
            opacity: 1,
        });

    }, [anchorEl]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node) && !anchorEl.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose, anchorEl]);

    return createPortal(
        <div 
            ref={popoverRef} 
            style={style} 
            className="w-80 bg-white dark:bg-slate-800 rounded-lg shadow-2xl ring-1 ring-black ring-opacity-5 animate-fade-in-up transition-opacity duration-150"
        >
            <div className="flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{formatDate(date, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-3 space-y-2">
                {bookingsForDay.length > 0 ? (
                    bookingsForDay.map(booking => (
                        <ScheduleBookingItem 
                            key={booking.id} 
                            booking={booking} 
                            staff={staff} 
                            pkg={packages.find(p => p.id === booking.packageId)} 
                            onAssignStaff={onAssignStaff} 
                        />
                    ))
                ) : (
                    <p className="text-center text-sm text-slate-500 py-6">No bookings scheduled for this day.</p>
                )}
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                <Button onClick={() => onAddBooking(formatDateToYMD(date))} className="w-full">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Booking
                </Button>
            </div>
        </div>,
        document.body
    );
};


// --- Compact Booking Item for Month View ---
const getBookingAppearance = (status: BookingStatus) => {
    switch (status) {
        case BookingStatus.Confirmed: return { border: 'border-tinedy-green', bg: 'bg-tinedy-green/10 dark:bg-tinedy-green/20' };
        case BookingStatus.Pending: return { border: 'border-amber-500', bg: 'bg-amber-100/50 dark:bg-amber-900/20' };
        case BookingStatus.Completed: return { border: 'border-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' };
        case BookingStatus.Cancelled: return { border: 'border-red-400', bg: 'bg-red-100/40 dark:bg-red-900/20' };
        default: return { border: 'border-slate-300', bg: 'bg-slate-50 dark:bg-slate-800' };
    }
};

const MonthViewBookingItem: React.FC<{ booking: Booking }> = ({ booking }) => {
    const { border, bg } = getBookingAppearance(booking.status);

    return (
        <div
            className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-2 truncate border-l-4 ${border} ${bg} ${booking.status === BookingStatus.Cancelled ? 'line-through' : ''}`}
            title={`${formatTime(booking.bookingTime)} - ${booking.customer.name}`}
        >
            <div className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[booking.status]?.dotColor} flex-shrink-0`}></div>
            <span className="truncate text-slate-700 dark:text-slate-200">
                <span className="font-bold">{formatTime(booking.bookingTime, { hour12: false, hour: '2-digit', minute: '2-digit' })}</span> {booking.customer.name}
            </span>
        </div>
    );
};


const SchedulePage: React.FC<SchedulePageProps> = ({ bookings, staff, packages, onAssignStaff, onAddBooking }) => {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('upcoming');
    const [staffFilter, setStaffFilter] = useState<string>('all');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewDays, setViewDays] = useState<string>('30'); // Default to month view
    const [popover, setPopover] = useState<{ date: Date; element: HTMLDivElement } | null>(null);
    const isGlobalAvailabilityCheckerOpen = useUiStore(state => state.isGlobalAvailabilityCheckerOpen);
    
    const isMonthView = viewDays === '30';

    useEffect(() => {
        if (isGlobalAvailabilityCheckerOpen) {
            setPopover(null);
        }
    }, [isGlobalAvailabilityCheckerOpen]);

    const goToPrevious = () => {
        if (isMonthView) {
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        } else {
            setCurrentDate(prev => addDays(prev, -Number(viewDays)));
        }
    };
    const goToNext = () => {
         if (isMonthView) {
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        } else {
            setCurrentDate(prev => addDays(prev, Number(viewDays)));
        }
    };
    const goToToday = () => setCurrentDate(new Date());

    const { displayDates, viewRangeString } = useMemo(() => {
        if (isMonthView) {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const firstDayOfMonth = new Date(year, month, 1);
            const dayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon
            const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            const calendarStart = addDays(firstDayOfMonth, -adjustedDayOfWeek);
            
            const dates = Array.from({ length: 42 }).map((_, i) => addDays(calendarStart, i));
            const rangeString = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            return { displayDates: dates, viewRangeString: rangeString };
        } else {
            const d = new Date(currentDate);
            d.setHours(0, 0, 0, 0);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            const viewStart = new Date(d.setDate(diff));

            const dates = Array.from({ length: Number(viewDays) }).map((_, i) => addDays(viewStart, i));
            const rangeString = dates.length > 0 
                ? `${dates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${dates[dates.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                : '';
            return { displayDates: dates, viewRangeString: rangeString };
        }
    }, [currentDate, viewDays, isMonthView]);
    

    const bookingsForView = useMemo(() => {
        if (displayDates.length === 0) return {};

        const viewStartStr = formatDateToYMD(displayDates[0]);
        const viewEndStr = formatDateToYMD(displayDates[displayDates.length - 1]);

        let filtered = bookings.filter(b => {
            if (b.bookingDate < viewStartStr || b.bookingDate > viewEndStr) return false;
            
            const statusMatch = (() => {
                switch (statusFilter) {
                    case 'all': return true;
                    case 'needs-assignment': return (b.status === BookingStatus.Pending || b.status === BookingStatus.Confirmed) && !b.assignedStaffId;
                    case 'upcoming': return b.status === BookingStatus.Pending || b.status === BookingStatus.Confirmed;
                    default: return b.status === statusFilter;
                }
            })();
            const staffMatch = staffFilter === 'all' || b.assignedStaffId === staffFilter;
            return statusMatch && staffMatch;
        });

        const grouped: Record<string, Booking[]> = {};
        filtered.forEach(booking => {
            if (!grouped[booking.bookingDate]) grouped[booking.bookingDate] = [];
            grouped[booking.bookingDate].push(booking);
        });

        for (const date in grouped) {
            grouped[date].sort((a, b) => a.bookingTime.localeCompare(b.bookingTime));
        }
        return grouped;
    }, [bookings, statusFilter, staffFilter, displayDates]);
    
    const popoverDateKey = popover ? formatDateToYMD(popover.date) : null;
    const popoverBookings = popoverDateKey ? bookingsForView[popoverDateKey] || [] : [];
    
    const handleDayClick = (e: React.MouseEvent<HTMLDivElement>, date: Date) => {
        setPopover({ date, element: e.currentTarget });
    };

    const handleAddBookingAndClosePopover = (date: string) => {
        onAddBooking(date);
        setPopover(null);
    };

    const statusFilterOptions = [
        { value: "upcoming", label: "Upcoming" },
        { value: "all", label: "All Bookings" },
        { value: "needs-assignment", label: "Needs Assignment" },
        { value: BookingStatus.Completed, label: "Completed" },
        { value: BookingStatus.Cancelled, label: "Cancelled" },
    ];
    const staffFilterOptions = [ { value: "all", label: "All Staff" }, ...staff.map(s => ({ value: s.id, label: s.name })) ];
    const viewDaysOptions = [
        { value: '7', label: "Week View" },
        { value: '14', label: "2-Week View" },
        { value: '30', label: "Month View" }
    ];

    return (
        <>
            <Card className="flex flex-col flex-grow min-h-0">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-tinedy-blue/20 dark:bg-tinedy-blue/30 p-2 rounded-lg">
                           <CalendarDaysIcon className="w-6 h-6 text-tinedy-blue dark:text-tinedy-off-white"/>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Schedule</h2>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                        <Select id="view-days-filter" label="" value={viewDays} onChange={setViewDays} options={viewDaysOptions} wrapperClassName="min-w-[140px]" />
                        <Select id="status-filter" label="" value={statusFilter} onChange={(value) => setStatusFilter(value as StatusFilter)} options={statusFilterOptions} wrapperClassName="min-w-[180px]" />
                        <Select id="staff-filter" label="" value={staffFilter} onChange={setStaffFilter} options={staffFilterOptions} wrapperClassName="min-w-[180px]" />
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <h3 className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200">{viewRangeString}</h3>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={goToPrevious} aria-label="Previous period"><ChevronLeftIcon className="w-4 h-4" /></Button>
                        <Button variant="secondary" onClick={goToToday} className="hidden sm:inline-flex px-4">Today</Button>
                        <Button variant="secondary" onClick={goToNext} aria-label="Next period"><ChevronRightIcon className="w-4 h-4" /></Button>
                    </div>
                </div>

                {isMonthView ? (
                    <div className="flex flex-col flex-grow border-t border-r border-slate-200 dark:border-slate-700">
                        <div className="grid grid-cols-7">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <div key={day} className="p-2 text-center font-semibold text-sm text-slate-600 dark:text-slate-300 border-b border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 grid-rows-6 flex-grow">
                             {displayDates.map(date => {
                                const dateKey = formatDateToYMD(date);
                                const dailyBookings = bookingsForView[dateKey] || [];
                                const isToday = dateKey === formatDateToYMD(new Date());
                                const isCurrentMonth = date.getMonth() === currentDate.getMonth();

                                const visibleBookings = dailyBookings.slice(0, MAX_VISIBLE_BOOKINGS_PER_DAY_MONTH);
                                const remainingCount = dailyBookings.length - MAX_VISIBLE_BOOKINGS_PER_DAY_MONTH;

                                return (
                                    <div 
                                        key={dateKey} 
                                        className={`border-b border-l border-slate-200 dark:border-slate-700 p-2 flex flex-col group relative cursor-pointer transition-colors ${!isCurrentMonth ? 'bg-slate-100 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-900/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'}`}
                                        onClick={(e) => dailyBookings.length > 0 ? handleDayClick(e, date) : onAddBooking(dateKey)}
                                    >
                                        <div className="flex justify-end">
                                            <div className={`text-xs font-bold mb-1 ${isToday ? 'bg-tinedy-blue text-white rounded-full w-5 h-5 flex items-center justify-center' : 'p-1'} ${!isCurrentMonth ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                                {date.getDate()}
                                            </div>
                                        </div>
                                        {dailyBookings.length > 0 ? (
                                            <div className="space-y-1">
                                                {visibleBookings.map(b => <MonthViewBookingItem key={b.id} booking={b} />)}
                                                {remainingCount > 0 && (
                                                    <button
                                                        className="w-full text-center text-xs font-bold text-tinedy-blue hover:underline p-1 rounded-sm hover:bg-tinedy-blue/10 transition-colors"
                                                    >
                                                        + {remainingCount} more
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-50/80 dark:bg-slate-800/50">
                                                <div className="flex items-center gap-1 text-tinedy-blue font-semibold text-sm">
                                                    <PlusIcon className="w-4 h-4" />
                                                    <span>Add Booking</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : ( // Week/List View
                    <div className="grid grid-cols-1 md:grid-cols-7 border-t border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/30">
                        {displayDates.map(date => {
                            const dateKey = formatDateToYMD(date);
                            const dailyBookings = bookingsForView[dateKey] || [];
                            const isToday = dateKey === formatDateToYMD(new Date());
                            const remainingCount = dailyBookings.length - MAX_VISIBLE_BOOKINGS_PER_DAY_WEEK;

                            return (
                                <div key={dateKey} className="border-b border-l border-slate-200 dark:border-slate-700 min-h-[200px] flex flex-col">
                                    <div className={`p-2 text-center font-semibold text-sm sticky top-0 z-10 ${isToday ? 'bg-tinedy-blue dark:bg-tinedy-blue/80 text-white' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200'}`}>
                                        <span>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                        <span className="ml-2 font-bold">{date.getDate()}</span>
                                    </div>
                                    <div 
                                        className="p-2 space-y-2 flex-grow cursor-pointer group relative transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                                        onClick={(e) => dailyBookings.length > 0 ? handleDayClick(e, date) : onAddBooking(dateKey)}
                                    >
                                        {dailyBookings.length > 0 ? (
                                            <>
                                                {dailyBookings.slice(0, MAX_VISIBLE_BOOKINGS_PER_DAY_WEEK).map(booking => <ScheduleBookingItem key={booking.id} booking={booking} staff={staff} pkg={packages.find(p => p.id === booking.packageId)} onAssignStaff={onAssignStaff} />)}
                                                {remainingCount > 0 && (
                                                    <button className="w-full text-center text-xs font-semibold text-tinedy-blue hover:underline p-1 rounded-md hover:bg-tinedy-blue/10 transition-colors mt-2">
                                                        + {remainingCount} more
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <div className="flex items-center gap-1 text-tinedy-blue font-semibold text-sm">
                                                    <PlusIcon className="w-4 h-4" />
                                                    <span>Add Booking</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                 {Object.keys(bookingsForView).length === 0 && !isMonthView && (
                     <div className="text-center py-12 border border-slate-200 dark:border-slate-700 border-t-0">
                        <p className="text-slate-500 dark:text-slate-400">No bookings match the current filters for this period.</p>
                         <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting the filters or navigate to a different date range.</p>
                    </div>
                )}
            </Card>

            {popover && (
                <SchedulePopover
                    anchorEl={popover.element}
                    date={popover.date}
                    bookingsForDay={popoverBookings}
                    onClose={() => setPopover(null)}
                    onAddBooking={handleAddBookingAndClosePopover}
                    staff={staff}
                    packages={packages}
                    onAssignStaff={onAssignStaff}
                />
            )}
        </>
    );
};

export default SchedulePage;