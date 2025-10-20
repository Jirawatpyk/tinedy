
import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '../ui/icons';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    percentageChange?: number;
    onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color, percentageChange, onClick }) => {
    const hasChange = typeof percentageChange === 'number' && isFinite(percentageChange);
    const isPositive = hasChange && percentageChange >= 0;

    const content = (
        <>
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-full ${color}`}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
                {hasChange && (
                    <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-tinedy-green' : 'text-red-500'}`}>
                        {isPositive ? <ArrowTrendingUpIcon className="w-4 h-4" /> : <ArrowTrendingDownIcon className="w-4 h-4" />}
                        <span>{Math.abs(percentageChange).toFixed(1)}%</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-3xl font-bold text-slate-800 mt-4">{value}</p>
                <p className="text-sm font-medium text-slate-500">{title}</p>
            </div>
        </>
    );

    if (onClick) {
        return (
            <button
                onClick={onClick}
                className="bg-white p-6 rounded-xl shadow-lg shadow-slate-200/80 flex flex-col justify-between h-full text-left transition-all duration-200 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-tinedy-blue focus:ring-offset-2"
            >
                {content}
            </button>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg shadow-slate-200/80 flex flex-col justify-between h-full">
            {content}
        </div>
    );
};

export default MetricCard;