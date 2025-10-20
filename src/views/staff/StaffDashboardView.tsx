import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useStaffStore } from '../../store/staffStore';
import { useStaffSchedule } from '../../hooks/useStaffSchedule';
import JobList from '../../components/staff/JobList';
import Skeleton from '../../components/ui/Skeleton';
import { Booking } from '../../types';

interface StaffDashboardViewProps {
    onViewDetails: (booking: Booking) => void;
}

const StaffDashboardView: React.FC<StaffDashboardViewProps> = ({ onViewDetails }) => {
    const user = useAuthStore(state => state.user);
    const staffMember = useStaffStore(state => state.staff).find(s => s.id === user?.id);
    const { data: bookings, isLoading, error } = useStaffSchedule();

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-3">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-20 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="font-semibold text-red-600">เกิดข้อผิดพลาด</p>
                    <p className="text-sm text-red-500 mt-1">ไม่สามารถโหลดข้อมูลงานได้: {error.message}</p>
                </div>
            );
        }
        
        return <JobList bookings={bookings || []} onViewDetails={onViewDetails} />;
    };

    return (
        <div className="p-4 sm:p-6">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-display">
                    ยินดีต้อนรับ, {staffMember?.name || 'พนักงาน'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">ภาพรวมงานของคุณ</p>
            </header>
            
            {renderContent()}
        </div>
    );
};

export default StaffDashboardView;
