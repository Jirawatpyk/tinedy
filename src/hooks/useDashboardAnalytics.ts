import { useMemo } from 'react';
import { Booking, Customer, Package, BookingStatus } from '../types';
import { STATUS_CONFIG } from '../constants';

export const useDashboardAnalytics = (
    bookings: Booking[],
    customers: Customer[],
    packages: Package[],
    periodDays: string
) => {
    return useMemo(() => {
        const toYYYYMMDD = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const period = parseInt(periodDays, 10);
        const now = new Date();
        
        const localEndDate = new Date(now);
        const localStartDate = new Date(now);
        localStartDate.setDate(now.getDate() - (period - 1));

        const startDateString = toYYYYMMDD(localStartDate);
        const endDateString = toYYYYMMDD(localEndDate);

        const prevLocalEndDate = new Date(localStartDate);
        prevLocalEndDate.setDate(prevLocalEndDate.getDate() - 1);
        const prevLocalStartDate = new Date(prevLocalEndDate);
        prevLocalStartDate.setDate(prevLocalEndDate.getDate() - (period - 1));

        const prevStartDateString = toYYYYMMDD(prevLocalStartDate);
        const prevEndDateString = toYYYYMMDD(prevLocalEndDate);

        // For metrics based on creation date (e.g., New Customers, Total Bookings)
        // This part needs its own date objects because it uses full timestamps
        const endTimestamp = new Date();
        endTimestamp.setHours(23, 59, 59, 999);
        const startTimestamp = new Date();
        startTimestamp.setDate(startTimestamp.getDate() - (period - 1));
        startTimestamp.setHours(0, 0, 0, 0);

        const bookingsInPeriod = bookings.filter(b => {
            if (!b.createdAt) return false;
            const createdAt = new Date(b.createdAt);
            return createdAt >= startTimestamp && createdAt <= endTimestamp;
        });
        const customersInPeriod = customers.filter(c => {
            const createdAt = new Date(c.createdAt);
            return createdAt >= startTimestamp && createdAt <= endTimestamp;
        });
        
        const prevEndTimestamp = new Date(startTimestamp);
        prevEndTimestamp.setDate(prevEndTimestamp.getDate() - 1);
        prevEndTimestamp.setHours(23, 59, 59, 999);
        const prevStartTimestamp = new Date(prevEndTimestamp);
        prevStartTimestamp.setDate(prevStartTimestamp.getDate() - (period - 1));
        prevStartTimestamp.setHours(0, 0, 0, 0);

        const prevCustomersInPeriod = customers.filter(c => {
            const createdAt = new Date(c.createdAt);
            return createdAt >= prevStartTimestamp && createdAt <= prevEndTimestamp;
        });

        const completedBookingsInPeriod = bookings.filter(b => 
            b.status === BookingStatus.Completed &&
            b.bookingDate >= startDateString &&
            b.bookingDate <= endDateString
        );
        const prevCompletedBookingsInPeriod = bookings.filter(b =>
            b.status === BookingStatus.Completed &&
            b.bookingDate >= prevStartDateString &&
            b.bookingDate <= prevEndDateString
        );

        const calculateRevenue = (bookingSet: Booking[]) => bookingSet
            .reduce((acc, b) => acc + (packages.find(p => p.id === b.packageId)?.price || 0), 0);

        const revenue = calculateRevenue(completedBookingsInPeriod);
        const prevRevenue = calculateRevenue(prevCompletedBookingsInPeriod);

        const newCustomers = customersInPeriod.length;
        const prevNewCustomers = prevCustomersInPeriod.length;

        const totalBookings = bookingsInPeriod.length;
        const prevTotalBookings = bookings.filter(b => {
            if (!b.createdAt) return false;
            const createdAt = new Date(b.createdAt);
            return createdAt >= prevStartTimestamp && createdAt <= prevEndTimestamp;
        }).length;
        
        const unassignedJobs = bookings.filter(b => 
            (b.status === BookingStatus.Pending || b.status === BookingStatus.Confirmed) &&
            !b.assignedStaffId &&
            new Date(b.bookingDate) >= new Date(new Date().setHours(0,0,0,0))
        ).length;

        const calcPercentageChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? Infinity : 0;
            return ((current - previous) / previous) * 100;
        };
        
        // ** FIX START **
        // Create an object containing only the days with actual revenue.
        const revenueByDay = completedBookingsInPeriod.reduce((acc, booking) => {
            const day = booking.bookingDate;
            const price = packages.find(p => p.id === booking.packageId)?.price || 0;
            if (price > 0) {
                acc[day] = (acc[day] || 0) + price;
            }
            return acc;
        }, {} as { [key: string]: number });

        // Convert the object to an array, sort it by date, and format for the chart.
        const revenueChartData = Object.entries(revenueByDay)
            .sort((a, b) => a[0].localeCompare(b[0])) // Sort by date string 'YYYY-MM-DD'
            .map(([date, value]) => ({
                label: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                value
            }));
        // ** FIX END **
        
        const statusCounts = bookingsInPeriod.reduce((acc, b) => {
            acc[b.status] = (acc[b.status] || 0) + 1;
            return acc;
        }, {} as Record<BookingStatus, number>);
        
        const statusBreakdownData = Object.entries(statusCounts).map(([status, count]) => ({
            status: status as BookingStatus,
            count: count,
            label: STATUS_CONFIG[status as BookingStatus].label,
            color: STATUS_CONFIG[status as BookingStatus].color.split(' ')[0],
            dotColor: STATUS_CONFIG[status as BookingStatus].dotColor,
        }));

        return {
            metrics: {
                revenue: { value: revenue, change: calcPercentageChange(revenue, prevRevenue) },
                newCustomers: { value: newCustomers, change: calcPercentageChange(newCustomers, prevNewCustomers) },
                totalBookings: { value: totalBookings, change: calcPercentageChange(totalBookings, prevTotalBookings) },
                unassignedJobs: { value: unassignedJobs },
            },
            charts: {
                revenue: revenueChartData,
                statusBreakdown: statusBreakdownData,
            }
        };
    }, [bookings, customers, packages, periodDays]);
};