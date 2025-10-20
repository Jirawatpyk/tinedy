
import React from 'react';
import Card from '../ui/Card';
import { ChartPieIcon } from '../ui/icons';
import { BookingStatus } from '../../types';

interface StatusData {
  status: BookingStatus;
  count: number;
  label: string;
  color: string;
  dotColor: string;
}

interface StatusBreakdownChartProps {
  data: StatusData[];
}

const StatusBreakdownChart: React.FC<StatusBreakdownChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const gradientStops = [];
  let cumulativePercentage = 0;
  
  // Tailwind colors need to be mapped to hex for the gradient
  const colorMap: Record<string, string> = {
    'bg-amber-100': '#fef3c7',
    'bg-tinedy-green/20': '#8fb996',
    'bg-tinedy-blue/20': '#2e4057',
    'bg-red-100': '#fee2e2',
  };

  for (const item of data) {
    const percentage = total > 0 ? (item.count / total) * 100 : 0;
    const hexColor = colorMap[item.color] || '#e5e7eb';
    gradientStops.push(`${hexColor} ${cumulativePercentage}% ${cumulativePercentage + percentage}%`);
    cumulativePercentage += percentage;
  }
  
  const conicGradient = `conic-gradient(from 180deg, ${gradientStops.join(', ')})`;

  return (
    <Card className="h-full">
      <div className="flex items-center gap-2 mb-4">
        <ChartPieIcon className="w-6 h-6 text-tinedy-green" />
        <h3 className="text-lg font-bold text-slate-700">Bookings by Status</h3>
      </div>
      <div className="border-t border-slate-200 pt-4 h-full flex flex-col justify-center">
        {total > 0 ? (
          <div className="grid grid-cols-2 gap-6 items-center">
            <div className="relative flex justify-center items-center">
              <div
                className="w-40 h-40 rounded-full"
                style={{ background: conicGradient }}
              ></div>
              <div className="absolute w-24 h-24 bg-white rounded-full flex justify-center items-center flex-col">
                  <span className="text-3xl font-bold text-slate-800">{total}</span>
                  <span className="text-xs text-slate-500 font-medium">Total</span>
              </div>
            </div>
            <div className="space-y-3">
              {data.map(item => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${item.dotColor}`}></span>
                    <span className="text-sm font-medium text-slate-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-slate-500">
              No booking data for this period.
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatusBreakdownChart;