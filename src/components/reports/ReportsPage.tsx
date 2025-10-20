import React, { useState } from 'react';
import { Booking, StaffMember, Package, BookingStatus, Team } from '../../types';
import { ChartBarSquareIcon, CurrencyDollarIcon, UsersIcon, ArchiveBoxIcon, UserGroupIcon, StarIcon } from '../ui/icons';
import ReportDisplay from './ReportDisplay';
import ReportGeneratorCard from './ReportGeneratorCard';
import { useTeamPerformance } from '../../hooks/useTeamPerformance';

interface ReportsPageProps {
  bookings: Booking[];
  staff: StaffMember[];
  packages: Package[];
  teams: Team[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ bookings, staff, packages, teams }) => {
  const [report, setReport] = useState<{ title: string; headers: { key: string; label: string }[]; data: any[] } | null>(null);
  const teamPerformanceData = useTeamPerformance(bookings, packages, teams);

  const generateRevenueReport = () => {
    const completedBookings = bookings.filter(b => b.status === BookingStatus.Completed && b.createdAt);
    
    const monthlyData: Record<string, { revenue: number; bookings: number }> = {};

    completedBookings.forEach(booking => {
        const period = new Date(booking.createdAt!).toISOString().slice(0, 7); // YYYY-MM
        const price = packages.find(p => p.id === booking.packageId)?.price || 0;

        if (!monthlyData[period]) {
            monthlyData[period] = { revenue: 0, bookings: 0 };
        }
        monthlyData[period].revenue += price;
        monthlyData[period].bookings += 1;
    });

    const reportData = Object.entries(monthlyData)
        .map(([period, data]) => ({
            period,
            revenue: `฿${data.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            bookings: data.bookings
        }))
        .sort((a, b) => b.period.localeCompare(a.period));
    
    setReport({
        title: 'Monthly Revenue Report',
        headers: [
            { key: 'period', label: 'Month' },
            { key: 'revenue', label: 'Total Revenue' },
            { key: 'bookings', label: 'Completed Bookings' }
        ],
        data: reportData
    });
  };

  const generateStaffPerformanceReport = () => {
    const completedBookings = bookings.filter(b => b.status === BookingStatus.Completed && b.assignedStaffId);
    const performance: Record<string, number> = {};

    completedBookings.forEach(booking => {
        performance[booking.assignedStaffId!] = (performance[booking.assignedStaffId!] || 0) + 1;
    });

    const reportData = Object.entries(performance)
        .map(([staffId, count]) => ({
            staffId,
            staffName: staff.find(s => s.id === staffId)?.name || 'Unknown Staff',
            completedBookings: count
        }))
        .sort((a, b) => b.completedBookings - a.completedBookings);
    
    setReport({
        title: 'Staff Performance Report',
        headers: [
            { key: 'staffName', label: 'Staff Member' },
            { key: 'completedBookings', label: 'Completed Jobs' }
        ],
        data: reportData
    });
  };

  const generatePopularPackagesReport = () => {
    const totalBookings = bookings.length;
    if (totalBookings === 0) {
        setReport({
            title: 'Popular Packages Report',
            headers: [
                { key: 'packageName', label: 'Package Name' },
                { key: 'bookingCount', label: 'Times Booked' },
                { key: 'percentage', label: '% of Total Bookings' }
            ],
            data: []
        });
        return;
    }

    const packageCounts: Record<string, number> = {};
    bookings.forEach(booking => {
        packageCounts[booking.packageId] = (packageCounts[booking.packageId] || 0) + 1;
    });

    const reportData = Object.entries(packageCounts)
        .map(([packageId, count]) => ({
            packageId,
            packageName: packages.find(p => p.id === packageId)?.name || 'Unknown Package',
            bookingCount: count,
            percentage: `${((count / totalBookings) * 100).toFixed(1)}%`
        }))
        .sort((a, b) => b.bookingCount - a.bookingCount);
    
    setReport({
        title: 'Popular Packages Report',
        headers: [
            { key: 'packageName', label: 'Package Name' },
            { key: 'bookingCount', label: 'Times Booked' },
            { key: 'percentage', label: '% of Total Bookings' }
        ],
        data: reportData
    });
  };

  const generateTeamPerformanceReport = () => {
    const reportData = teamPerformanceData.map(team => ({
        ...team,
        totalRevenue: `฿${team.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        totalHours: team.totalHours.toFixed(1),
        averageRating: team.averageRating > 0 ? team.averageRating.toFixed(1) : 'N/A',
    })).sort((a, b) => b.completedJobs - a.completedJobs);
    
    setReport({
        title: 'Team Performance Report',
        headers: [
            { key: 'teamName', label: 'Team Name' },
            { key: 'completedJobs', label: 'Completed Jobs' },
            { key: 'totalRevenue', label: 'Total Revenue' },
            { key: 'totalHours', label: 'Total Hours Worked' },
            { key: 'averageRating', label: 'Avg. Rating' },
        ],
        data: reportData
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg shadow-slate-200/80">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-tinedy-blue/20 p-2 rounded-lg">
            <ChartBarSquareIcon className="w-6 h-6 text-tinedy-blue" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Reports & Analytics</h2>
        </div>
        <p className="text-slate-600">
            Generate reports to gain insights into your business operations. Select a report type below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportGeneratorCard 
            title="Revenue Report"
            description="Analyzes total revenue and completed bookings, grouped by month."
            icon={CurrencyDollarIcon}
            onGenerate={generateRevenueReport}
        />
        <ReportGeneratorCard 
            title="Staff Performance"
            description="Ranks staff members based on the number of completed bookings."
            icon={UsersIcon}
            onGenerate={generateStaffPerformanceReport}
        />
        <ReportGeneratorCard 
            title="Popular Packages"
            description="Shows which service packages are most frequently booked by customers."
            icon={ArchiveBoxIcon}
            onGenerate={generatePopularPackagesReport}
        />
        <ReportGeneratorCard 
            title="Team Performance"
            description="Summarizes jobs, revenue, and hours worked for each team."
            icon={UserGroupIcon}
            onGenerate={generateTeamPerformanceReport}
        />
      </div>

      {report && (
        <ReportDisplay 
            title={report.title}
            headers={report.headers}
            data={report.data}
        />
      )}
    </div>
  );
};

export default ReportsPage;