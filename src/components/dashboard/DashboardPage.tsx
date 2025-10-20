import React, { useMemo, useState } from 'react';
import { Booking, Customer, Package, BookingStatus } from '../../types';
import { Squares2X2Icon, ClockIcon, CurrencyDollarIcon, UsersIcon, ExclamationTriangleIcon } from '../ui/icons';
import MetricCard from './MetricCard';
import Select from '../ui/Select';
import RevenueChart from './RevenueChart';
import StatusBreakdownChart from './StatusBreakdownChart';
import Card from '../ui/Card';
import { formatTime } from '../../lib/utils';
import { useDashboardAnalytics } from '../../hooks/useDashboardAnalytics';

interface DashboardPageProps {
    bookings: Booking[];
    customers: Customer[];
    packages: Package[];
    onMetricClick: (metric: 'unassigned') => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ bookings, customers, packages, onMetricClick }) => {
    const [periodDays, setPeriodDays] = useState('30'); 

    const dashboardData = useDashboardAnalytics(bookings, customers, packages, periodDays);

    const periodOptions = [
        { label: 'Last 7 Days', value: '7' },
        { label: 'Last 30 Days', value: '30' },
        { label: 'Last 90 Days', value: '90' },
    ];
    
    const today = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    const todaysAppointments = useMemo(() => {
      return bookings
        .filter(b => b.bookingDate === today && (b.status === BookingStatus.Confirmed || b.status === BookingStatus.Pending))
        .sort((a, b) => a.bookingTime.localeCompare(b.bookingTime));
    }, [bookings, today]);
    
    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-lg shadow-slate-200/80 flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg">
                        <Squares2X2Icon className="w-6 h-6 text-tinedy-blue" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
                </div>
                <div className="w-full sm:w-auto">
                    <Select
                        id="period-filter"
                        label=""
                        value={periodDays}
                        onChange={setPeriodDays}
                        options={periodOptions}
                        wrapperClassName="min-w-[180px]"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="Revenue" 
                    value={`฿${dashboardData.metrics.revenue.value.toLocaleString()}`} 
                    icon={CurrencyDollarIcon} 
                    color="bg-tinedy-green"
                    percentageChange={dashboardData.metrics.revenue.change}
                />
                <MetricCard 
                    title="Total Bookings" 
                    value={dashboardData.metrics.totalBookings.value} 
                    icon={ClockIcon} 
                    color="bg-tinedy-blue"
                    percentageChange={dashboardData.metrics.totalBookings.change}
                />
                <MetricCard 
                    title="New Customers" 
                    value={dashboardData.metrics.newCustomers.value} 
                    icon={UsersIcon} 
                    color="bg-tinedy-yellow"
                    percentageChange={dashboardData.metrics.newCustomers.change}
                />
                <MetricCard 
                    title="Unassigned Jobs" 
                    value={dashboardData.metrics.unassignedJobs.value} 
                    icon={ExclamationTriangleIcon} 
                    color="bg-amber-500"
                    onClick={() => onMetricClick('unassigned')}
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <RevenueChart data={dashboardData.charts.revenue} />
                </div>
                <div className="lg:col-span-2">
                    <StatusBreakdownChart data={dashboardData.charts.statusBreakdown} />
                </div>
            </div>

            <Card>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Today's Appointments</h2>
                {todaysAppointments.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {todaysAppointments.map(booking => {
                            const pkg = packages.find(p => p.id === booking.packageId);
                            return (
                                <div key={booking.id} className="p-4 border border-slate-200 rounded-lg flex items-center gap-4 hover:bg-slate-50">
                                    <div className="w-28 text-center">
                                        <p className="font-bold text-tinedy-blue text-lg">{formatTime(booking.bookingTime)}</p>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-slate-800">{booking.customer.name}</p>
                                        <p className="text-sm text-slate-500">{pkg?.name || 'Unknown Package'}</p>
                                    </div>
                                    <div className="w-40 text-right">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            booking.status === BookingStatus.Confirmed 
                                            ? 'bg-tinedy-green/20 text-tinedy-green' 
                                            : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No appointments scheduled for today.</p>
                        <p className="text-sm text-slate-400 mt-1">Enjoy the quiet day or schedule a new booking.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DashboardPage;