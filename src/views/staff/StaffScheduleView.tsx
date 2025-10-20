import React, { useState, useMemo } from 'react';
import { useStaffUnavailability } from '../../hooks/useAvailability';
import { useStaffLeaveRequests } from '../../hooks/useLeave';
import StaffScheduleCalendar from '../../components/staff/StaffScheduleCalendar';
import { Booking, StaffUnavailability, LeaveRequest } from '../../types';
import JobList from '../../components/staff/JobList';
import BlockedTimeCard from '../../components/staff/BlockedTimeCard';
import LeaveRequestCard from '../../components/staff/LeaveRequestCard';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import { CalendarDaysIcon, PlusIcon } from '../../components/ui/icons';
import { expandRRule } from '../../lib/rrule';


interface StaffScheduleViewProps {
    bookings: Booking[];
    onViewDetails: (booking: Booking) => void;
    onManageAvailability: (date: Date) => void;
    onEditUnavailability: (item: StaffUnavailability) => void;
    onDeleteUnavailability: (id: string) => void;
    onOpenLeaveModal: (date: Date) => void;
    onCancelLeave: (id: string) => void;
}

const StaffScheduleView: React.FC<StaffScheduleViewProps> = ({ 
    bookings,
    onViewDetails, 
    onManageAvailability,
    onEditUnavailability,
    onDeleteUnavailability,
    onOpenLeaveModal,
    onCancelLeave,
}) => {
    const { data: unavailability = [], isLoading: isLoadingUnavailability } = useStaffUnavailability();
    const { data: leaveRequests = [], isLoading: isLoadingLeave } = useStaffLeaveRequests();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const isLoading = isLoadingUnavailability || isLoadingLeave;
    
    const expandedUnavailability = useMemo(() => {
        const viewStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        viewStart.setDate(viewStart.getDate() - 7); // Add buffer for calendar view
        const viewEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        viewEnd.setDate(viewEnd.getDate() + 7); // Add buffer
        viewEnd.setHours(23, 59, 59, 999);

        return unavailability.flatMap(item => expandRRule(item, viewStart, viewEnd));
    }, [unavailability, currentMonth]);


    const datesWithJobs = useMemo(() => new Set(bookings.map(b => b.bookingDate)), [bookings]);
    const datesWithUnavailability = useMemo(() => new Set(expandedUnavailability.map(u => u.startTime.split('T')[0])), [expandedUnavailability]);
    const datesWithLeave = useMemo(() => {
        const dates = new Set<string>();
        leaveRequests.forEach(leave => {
            let currentDate = new Date(leave.startDate + 'T00:00:00');
            const endDate = new Date(leave.endDate + 'T00:00:00');
            while (currentDate <= endDate) {
                dates.add(currentDate.toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });
        return dates;
    }, [leaveRequests]);

    const { bookingsForSelectedDay, unavailabilityForSelectedDay, leaveForSelectedDay } = useMemo(() => {
        const selectedDateStr = selectedDate.toISOString().split('T')[0];
        const dayBookings = bookings.filter(b => b.bookingDate === selectedDateStr)
                                .sort((a, b) => a.bookingTime.localeCompare(b.bookingTime));
        const dayUnavailability = expandedUnavailability.filter(u => u.startTime.split('T')[0] === selectedDateStr)
                                        .sort((a, b) => a.startTime.localeCompare(b.startTime));
        const dayLeave = leaveRequests.filter(l => selectedDateStr >= l.startDate && selectedDateStr <= l.endDate);
        return { bookingsForSelectedDay: dayBookings, unavailabilityForSelectedDay: dayUnavailability, leaveForSelectedDay: dayLeave };
    }, [bookings, expandedUnavailability, leaveRequests, selectedDate]);
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-full pt-20"><Loader /></div>;
    }

    return (
        <div className="p-4 sm:p-6">
            <header className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-display">
                            ตารางงาน
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-rule">ดูและจัดการตารางเวลาของคุณ</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="secondary" onClick={() => onOpenLeaveModal(selectedDate)}>
                            ยื่นเรื่องลา
                        </Button>
                        <Button onClick={() => onManageAvailability(selectedDate)}>
                            <PlusIcon className="w-5 h-5 mr-2" />
                            จัดการเวลาว่าง
                        </Button>
                    </div>
                </div>
            </header>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
                <StaffScheduleCalendar 
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    datesWithJobs={datesWithJobs}
                    datesWithUnavailability={datesWithUnavailability}
                    datesWithLeave={datesWithLeave}
                />
            </div>

            <div className="mt-6">
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-3 font-rule">
                    รายการสำหรับวันที่ {selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h2>
                {(bookingsForSelectedDay.length > 0 || unavailabilityForSelectedDay.length > 0 || leaveForSelectedDay.length > 0) ? (
                    <div className="space-y-3">
                        {leaveForSelectedDay.map(item => (
                            <LeaveRequestCard key={item.id} item={item} onCancel={onCancelLeave} />
                        ))}
                        {unavailabilityForSelectedDay.map(item => (
                            <BlockedTimeCard 
                                key={`${item.id}-${item.startTime}`}
                                item={item}
                                onEdit={onEditUnavailability}
                                onDelete={onDeleteUnavailability}
                            />
                        ))}
                        <JobList bookings={bookingsForSelectedDay} onViewDetails={onViewDetails} />
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-100 dark:bg-slate-800/50 rounded-lg font-rule">
                        <CalendarDaysIcon className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500" />
                        <p className="mt-4 font-semibold text-slate-600 dark:text-slate-300">ไม่มีรายการในวันนี้</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">คุณสามารถเพิ่มเวลาที่ไม่สะดวกหรือยื่นเรื่องลาได้</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffScheduleView;