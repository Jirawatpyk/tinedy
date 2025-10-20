import React, { useMemo } from 'react';
import { Booking } from '../../types';
import JobCard from './JobCard';
import { CalendarDaysIcon } from '../ui/icons';

interface JobListProps {
    bookings: Booking[];
    onViewDetails: (booking: Booking) => void;
}

const JobList: React.FC<JobListProps> = ({ bookings, onViewDetails }) => {
    const groupedBookings = useMemo(() => {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const todayBookings: Booking[] = [];
        const tomorrowBookings: Booking[] = [];
        const upcomingBookings: Booking[] = [];

        bookings.forEach(booking => {
            if (booking.bookingDate === todayStr) {
                todayBookings.push(booking);
            } else if (booking.bookingDate === tomorrowStr) {
                tomorrowBookings.push(booking);
            } else {
                upcomingBookings.push(booking);
            }
        });
        
        // Sort upcoming bookings by date
        upcomingBookings.sort((a, b) => a.bookingDate.localeCompare(b.bookingDate));

        return { todayBookings, tomorrowBookings, upcomingBookings };
    }, [bookings]);
    
    if (bookings.length === 0) {
        return (
             <div className="text-center py-20 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                <CalendarDaysIcon className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500" />
                <p className="mt-4 font-semibold text-slate-600 dark:text-slate-300">ไม่มีงานในตารางของคุณ</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">ดูเหมือนว่าคุณจะว่างแล้ว!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {groupedBookings.todayBookings.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-3">งานวันนี้</h2>
                    <div className="space-y-3">
                        {groupedBookings.todayBookings.map(booking => <JobCard key={booking.id} booking={booking} onViewDetails={onViewDetails} />)}
                    </div>
                </section>
            )}

            {groupedBookings.tomorrowBookings.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-3">งานพรุ่งนี้</h2>
                    <div className="space-y-3">
                        {groupedBookings.tomorrowBookings.map(booking => <JobCard key={booking.id} booking={booking} onViewDetails={onViewDetails} />)}
                    </div>
                </section>
            )}

            {groupedBookings.upcomingBookings.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-3">งานที่กำลังจะมาถึง</h2>
                    <div className="space-y-3">
                        {groupedBookings.upcomingBookings.map(booking => <JobCard key={booking.id} booking={booking} onViewDetails={onViewDetails} />)}
                    </div>
                </section>
            )}
        </div>
    );
};

export default JobList;