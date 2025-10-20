import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Booking, BookingStatus, Package } from '../types';
import { usePackageStore } from '../store/packageStore';
import { getAllBookingsForStaff } from '../dal/bookings';

export type PerformanceDateRange = '30d' | '90d' | 'all';

export const useStaffPerformance = (staffId: string, dateRange: PerformanceDateRange) => {
    const { data: allBookings = [] } = useQuery({
        queryKey: ['staffAllBookings', staffId],
        queryFn: () => getAllBookingsForStaff(staffId),
        enabled: !!staffId,
    });

    const allPackages = usePackageStore(state => state.packages);
    
    return useMemo(() => {
        const now = new Date();
        const startDate = new Date(now);
        if (dateRange === '30d') {
            startDate.setDate(now.getDate() - 30);
        } else if (dateRange === '90d') {
            startDate.setDate(now.getDate() - 90);
        }

        const relevantBookings = allBookings.filter(b => {
            if (b.assignedStaffId !== staffId || b.status !== BookingStatus.Completed) {
                return false;
            }
            if (dateRange !== 'all') {
                const bookingDate = new Date(`${b.bookingDate}T00:00:00`);
                return bookingDate >= startDate && bookingDate <= now;
            }
            return true;
        });

        // 1. Average Rating
        const ratedBookings = relevantBookings.filter(b => b.rating !== null && b.rating !== undefined);
        const totalRating = ratedBookings.reduce((sum, b) => sum + (b.rating || 0), 0);
        const averageRating = ratedBookings.length > 0 ? totalRating / ratedBookings.length : 0;

        // 2. Completed Jobs
        const completedJobs = relevantBookings.length;

        // 3. Total Hours Worked
        const packagesById = new Map<string, Package>(allPackages.map(p => [p.id, p]));
        const totalMinutes = relevantBookings.reduce((sum, b) => {
            const pkg = packagesById.get(b.packageId);
            return sum + (pkg?.duration || 0);
        }, 0);
        const totalHours = totalMinutes / 60;

        // 4. Monthly Performance (last 6 months)
        const monthlyPerformance: { month: string; jobs: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthKey = d.toLocaleString('th-TH', { month: 'short' });
            monthlyPerformance.push({ month: monthKey, jobs: 0 });
        }
        
        const allCompletedBookingsForChart = allBookings.filter(b => b.assignedStaffId === staffId && b.status === BookingStatus.Completed);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        allCompletedBookingsForChart.forEach(b => {
            const bookingDate = new Date(`${b.bookingDate}T00:00:00`);

            if (bookingDate >= sixMonthsAgo) {
                 const monthKey = bookingDate.toLocaleString('th-TH', { month: 'short' });
                 const monthData = monthlyPerformance.find(m => m.month === monthKey);
                 if (monthData) {
                     monthData.jobs++;
                 }
            }
        });

        // 5. Recent Feedback
        const recentFeedback = allBookings
            .filter(b => b.assignedStaffId === staffId && b.status === BookingStatus.Completed && b.rating !== null)
            .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
            .slice(0, 5);

        return {
            averageRating,
            completedJobs,
            totalHours,
            monthlyPerformance,
            recentFeedback,
        };

    }, [staffId, dateRange, allBookings, allPackages]);
};