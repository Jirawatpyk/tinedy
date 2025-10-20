import React from 'react';
import { TeamPerformanceData } from '../../types';
import { CurrencyDollarIcon, ListBulletIcon, ClockIcon, StarIcon } from '../ui/icons';
import DetailItem from '../ui/DetailItem';

interface TeamPerformanceMetricsProps {
    data: TeamPerformanceData | undefined;
}

const Metric: React.FC<{ label: string; value: string | number; icon: React.ElementType }> = ({ label, value, icon: Icon }) => (
    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
        <DetailItem label={label} icon={<Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />}>
             <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </DetailItem>
    </div>
);


const TeamPerformanceMetrics: React.FC<TeamPerformanceMetricsProps> = ({ data }) => {
    if (!data) {
        return (
            <div className="text-center py-8 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400">No performance data available.</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Lifetime Performance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Metric 
                    label="Completed Jobs"
                    value={data.completedJobs}
                    icon={ListBulletIcon}
                />
                 <Metric 
                    label="Total Revenue"
                    value={`฿${data.totalRevenue.toLocaleString()}`}
                    icon={CurrencyDollarIcon}
                />
                 <Metric 
                    label="Total Hours"
                    value={`${data.totalHours.toFixed(1)}`}
                    icon={ClockIcon}
                />
                <Metric
                    label="Average Rating"
                    value={data.averageRating > 0 ? data.averageRating.toFixed(1) : 'N/A'}
                    icon={StarIcon}
                />
            </div>
        </div>
    );
};

export default TeamPerformanceMetrics;