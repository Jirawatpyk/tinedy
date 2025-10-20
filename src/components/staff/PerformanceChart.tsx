import React from 'react';
import { ChartBarIcon } from '../ui/icons';

interface PerformanceChartProps {
    data: { month: string; jobs: number }[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
    // 1. Filter data to only include months with jobs
    const filteredData = data.filter(item => item.jobs > 0);

    const totalJobs = filteredData.reduce((sum, item) => sum + item.jobs, 0);
    const maxValue = totalJobs > 0 ? Math.max(...filteredData.map(d => d.jobs)) : 0;

    // Calculate a "nice" top value for the Y-axis, making it divisible by 4.
    const getNiceMaxValue = (value: number): number => {
        if (value === 0) return 4; // Default to 4 if no jobs
        if (value <= 4) return 4;
        return Math.ceil(value / 4) * 4;
    };

    const niceMaxValue = getNiceMaxValue(maxValue);
    const yAxisLabels = [niceMaxValue, niceMaxValue * 0.75, niceMaxValue * 0.5, niceMaxValue * 0.25, 0];

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-4 font-rule">
                <ChartBarIcon className="w-5 h-5" />
                จำนวนงานที่เสร็จสิ้น (6 เดือนล่าสุด)
            </h3>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700 pt-6">
                {filteredData.length > 0 ? (
                    <div className="flex h-64">
                        {/* Y-axis Labels */}
                        <div className="h-[calc(100%-1.5rem)] flex flex-col justify-between text-right pr-2 text-xs text-slate-500 dark:text-slate-400">
                            {yAxisLabels.map((label, index) => (
                                <span key={index}>{label}</span>
                            ))}
                        </div>
                        
                        {/* Chart Area with Bars */}
                        <div className="flex-1 h-full flex items-end gap-2 border-l border-slate-200 dark:border-slate-700 pl-2 pb-6 relative">
                            {/* X-axis line */}
                            <div className="absolute bottom-6 left-0 right-0 border-b border-slate-200 dark:border-slate-700"></div>
                            
                            {filteredData.map(({ month, jobs }) => (
                                <div key={month} className="flex flex-col items-center h-full text-center group w-12">
                                    <div className="relative flex-grow flex items-end w-full justify-center">
                                        <div
                                            className="w-1/2 max-w-[20px] bg-tinedy-blue/60 dark:bg-tinedy-yellow/60 rounded-t-md hover:bg-tinedy-blue dark:hover:bg-tinedy-yellow transition-all duration-300 relative"
                                            style={{ height: `${niceMaxValue > 0 ? (jobs / niceMaxValue) * 100 : 0}%` }}
                                        >
                                           {jobs > 0 && (
                                               <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-tinedy-dark text-white text-xs font-bold px-2 py-1 rounded-md pointer-events-none">
                                                    {jobs}
                                                </div>
                                           )}
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-rule">{month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-64 flex items-center justify-center text-center text-slate-500 dark:text-slate-400 font-rule px-4">
                        ไม่มีข้อมูลงานที่เสร็จสิ้นในช่วง 6 เดือนที่ผ่านมา
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerformanceChart;