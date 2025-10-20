import React from 'react';
import Card from '../ui/Card';
import { ChartBarSquareIcon } from '../ui/icons';

interface RevenueChartProps {
  data: { label: string; value: number }[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    const totalRevenue = data.reduce((sum, d) => sum + d.value, 0);
    const maxValue = totalRevenue > 0 ? Math.max(...data.map(d => d.value)) : 0;

    const getNiceMaxValue = (value: number): number => {
        if (value <= 1000) return Math.ceil(value / 200) * 200 || 1000;
        const exponent = Math.floor(Math.log10(value));
        const powerOf10 = Math.pow(10, exponent);
        const firstDigit = value / powerOf10;
        
        let niceFirstDigit;
        if (firstDigit < 1.5) niceFirstDigit = 1.5;
        else if (firstDigit < 2) niceFirstDigit = 2;
        else if (firstDigit < 3) niceFirstDigit = 3;
        else if (firstDigit < 5) niceFirstDigit = 5;
        else if (firstDigit < 7.5) niceFirstDigit = 7.5;
        else niceFirstDigit = 10;
        
        return niceFirstDigit * powerOf10;
    };

    const niceMaxValue = getNiceMaxValue(maxValue);
    const yAxisLabels = [niceMaxValue, niceMaxValue * 0.75, niceMaxValue * 0.5, niceMaxValue * 0.25, 0];

    const formatYAxisLabel = (value: number) => {
        if (value >= 1000) {
            return `${(value / 1000).toFixed(value % 1000 !== 0 ? 1 : 0)}k`;
        }
        return value.toString();
    };

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <ChartBarSquareIcon className="w-6 h-6 text-tinedy-blue" />
        <h3 className="text-lg font-bold text-slate-700">Revenue</h3>
      </div>
      
      <div className="flex-grow border-t border-slate-200 dark:border-slate-700 pt-6">
        {totalRevenue > 0 ? (
            <div className="flex h-full">
                {/* Y-axis Labels */}
                <div className="h-[calc(100%-1.5rem)] flex flex-col justify-between text-right pr-2 text-xs text-slate-500 dark:text-slate-400">
                    {yAxisLabels.map((label, index) => (
                        <span key={index}>{formatYAxisLabel(label)}</span>
                    ))}
                </div>
                
                {/* Chart Area with Bars */}
                <div className="flex-1 h-full flex justify-around items-end gap-1 border-l border-slate-200 dark:border-slate-700 pl-2 pb-6 relative">
                    {/* X-axis line */}
                    <div className="absolute bottom-6 left-0 right-0 border-b border-slate-200 dark:border-slate-700"></div>
                    
                    {data.map(({ label, value }) => (
                        <div key={label} className="flex flex-col items-center h-full text-center flex-1">
                            <div className="flex-grow w-full flex items-end justify-center">
                                <div
                                    className="w-3/4 bg-tinedy-blue/80 rounded-t-md hover:bg-tinedy-blue transition-colors group relative"
                                    style={{ height: `${(value / niceMaxValue) * 100}%` }}
                                    title={`฿${value.toLocaleString()}`}
                                >
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-tinedy-dark text-white text-xs font-bold px-2 py-1 rounded-md pointer-events-none">
                                        ฿{value.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 whitespace-nowrap">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
                No revenue data for this period.
            </div>
        )}
      </div>
    </Card>
  );
};

export default RevenueChart;
