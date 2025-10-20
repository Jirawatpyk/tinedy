import React from 'react';
import { StarIcon, CheckCircleIcon, ClockIcon } from '../ui/icons';

interface PerformanceMetricsProps {
    averageRating: number;
    completedJobs: number;
    totalHours: number;
}

const MetricItem: React.FC<{ icon: React.ElementType, value: string, label: string }> = ({ icon: Icon, value, label }) => (
    <div className="flex flex-col items-center text-center p-4">
        <div className="bg-tinedy-blue/10 dark:bg-tinedy-blue/20 p-3 rounded-full mb-2">
            <Icon className="w-6 h-6 text-tinedy-blue dark:text-tinedy-yellow" />
        </div>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-rule">{label}</p>
    </div>
);


const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ averageRating, completedJobs, totalHours }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-700">
                <MetricItem 
                    icon={StarIcon}
                    value={averageRating.toFixed(1)}
                    label="คะแนนเฉลี่ย"
                />
                <MetricItem 
                    icon={CheckCircleIcon}
                    value={completedJobs.toString()}
                    label="งานที่เสร็จสิ้น"
                />
                <MetricItem 
                    icon={ClockIcon}
                    value={totalHours.toFixed(1)}
                    label="ชั่วโมงทำงาน"
                />
            </div>
        </div>
    );
};

export default PerformanceMetrics;