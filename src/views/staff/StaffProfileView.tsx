import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useStaffStore } from '../../store/staffStore';
import { PerformanceDateRange, useStaffPerformance } from '../../hooks/useStaffPerformance';
import PerformanceMetrics from '../../components/staff/PerformanceMetrics';
import PerformanceChart from '../../components/staff/PerformanceChart';
import FeedbackCard from '../../components/staff/FeedbackCard';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { ArrowRightStartOnRectangleIcon, ChatBubbleLeftEllipsisIcon, ChartBarIcon } from '../../components/ui/icons';

const StaffProfileView: React.FC = () => {
    const { user, logout } = useAuthStore();
    const staffMember = useStaffStore(state => state.staff).find(s => s.id === user?.id);
    const [dateRange, setDateRange] = useState<PerformanceDateRange>('30d');

    const { averageRating, completedJobs, totalHours, monthlyPerformance, recentFeedback } = useStaffPerformance(user?.id || '', dateRange);

    if (!staffMember) {
        return <div className="p-4">กำลังโหลดข้อมูลโปรไฟล์...</div>;
    }
    
    const getInitials = (name: string): string => {
      if (!name) return '';
      const names = name.trim().split(' ');
      const firstInitial = names[0]?.[0] || '';
      const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] || '' : '';
      return `${firstInitial}${lastInitial}`.toUpperCase();
    };

    const dateRangeOptions = [
        { value: '30d', label: '30 วันล่าสุด' },
        { value: '90d', label: '90 วันล่าสุด' },
        { value: 'all', label: 'ทั้งหมด' },
    ];

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-tinedy-blue/10 dark:bg-tinedy-yellow/20 flex items-center justify-center mb-4 ring-8 ring-white/50 dark:ring-slate-800/50">
                    <span className="text-4xl font-bold text-tinedy-blue dark:text-tinedy-yellow font-display">
                        {getInitials(staffMember.name)}
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-display">{staffMember.name}</h1>
                <p className="text-slate-500 dark:text-slate-400">{staffMember.email}</p>
            </section>

            <div className="flex justify-between items-center pt-4">
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 font-rule">
                    <ChartBarIcon className="w-6 h-6"/>
                    ภาพรวมประสิทธิภาพ
                </h2>
                 <Select 
                    id="perf-range"
                    label=""
                    value={dateRange}
                    onChange={(val) => setDateRange(val as PerformanceDateRange)}
                    options={dateRangeOptions}
                    wrapperClassName="w-40"
                 />
            </div>
            
            <PerformanceMetrics 
                averageRating={averageRating}
                completedJobs={completedJobs}
                totalHours={totalHours}
            />

            <PerformanceChart data={monthlyPerformance} />

            <section>
                <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-4 font-rule">
                    <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                    ความคิดเห็นล่าสุดจากลูกค้า
                </h3>
                {recentFeedback.length > 0 ? (
                    <div className="space-y-3">
                        {recentFeedback.map(booking => (
                            <FeedbackCard key={booking.id} booking={booking} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 font-rule">ยังไม่มีความคิดเห็น</p>
                    </div>
                )}
            </section>
            
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button variant="secondary" onClick={logout} className="w-full sm:w-auto">
                    <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-2" />
                    ออกจากระบบ
                </Button>
            </div>
        </div>
    );
};

export default StaffProfileView;
