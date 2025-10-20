import React, { useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../ui/icons';

interface StaffScheduleCalendarProps {
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    datesWithJobs: Set<string>;
    datesWithUnavailability: Set<string>;
    datesWithLeave: Set<string>;
}

const StaffScheduleCalendar: React.FC<StaffScheduleCalendarProps> = ({
    currentMonth,
    setCurrentMonth,
    selectedDate,
    setSelectedDate,
    datesWithJobs,
    datesWithUnavailability,
    datesWithLeave
}) => {
    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const calendarGrid = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1);
        const dayOfWeek = firstDayOfMonth.getDay(); // 0=Sun

        // Start calendar on Sunday
        const calendarStart = new Date(firstDayOfMonth);
        calendarStart.setDate(firstDayOfMonth.getDate() - dayOfWeek);

        const grid: Date[] = [];
        for (let i = 0; i < 42; i++) { // 6 weeks to be safe
            grid.push(new Date(calendarStart.getFullYear(), calendarStart.getMonth(), calendarStart.getDate() + i));
        }

        return grid;
    }, [currentMonth]);

    const todayStr = new Date().toISOString().split('T')[0];
    const selectedDateStr = selectedDate.toISOString().split('T')[0];

    const weekdays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 font-rule">
                    {currentMonth.toLocaleString('th-TH', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-y-2 text-center">
                {weekdays.map(day => (
                    <div key={day} className="text-xs font-bold text-slate-500 dark:text-slate-400 py-1 font-rule">{day}</div>
                ))}
                {calendarGrid.map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDateStr;
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const hasJobs = datesWithJobs.has(dateStr);
                    const isUnavailable = datesWithUnavailability.has(dateStr);
                    const hasLeave = datesWithLeave.has(dateStr);

                    return (
                        <div key={dateStr} className="flex justify-center items-center h-10">
                            <button
                                onClick={() => setSelectedDate(date)}
                                className={`w-9 h-9 flex flex-col justify-center items-center rounded-full transition-colors relative ${
                                    isSelected ? 'bg-tinedy-blue text-white' : 
                                    isToday ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100' : 
                                    isCurrentMonth ? 'hover:bg-slate-100 dark:hover:bg-slate-700' : ''
                                }`}
                            >
                                <span className={`text-sm font-semibold ${isSelected ? 'text-white' : (isCurrentMonth ? 'text-slate-700 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600')}`}>
                                    {date.getDate()}
                                </span>
                                <div className="absolute bottom-1 flex items-center gap-1">
                                    {hasJobs && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-tinedy-green dark:bg-tinedy-green'}`}></div>}
                                    {isUnavailable && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-300' : 'bg-slate-400'}`}></div>}
                                    {hasLeave && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-purple-300' : 'bg-purple-500'}`}></div>}
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StaffScheduleCalendar;