import React from 'react';

interface WorkloadBarProps {
  utilization: number;
}

const getWorkloadColor = (utilization: number) => {
  if (utilization > 90) return 'bg-red-500';
  if (utilization > 60) return 'bg-tinedy-yellow';
  return 'bg-tinedy-green';
};

const WorkloadBar: React.FC<WorkloadBarProps> = ({ utilization }) => {
  const displayUtilization = Math.round(utilization);
  const clampedWidth = Math.min(utilization, 100);

  return (
    <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700 group relative">
      <div
        className={`${getWorkloadColor(utilization)} h-2.5 rounded-full transition-all duration-300`}
        style={{ width: `${clampedWidth}%` }}
      ></div>
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-tinedy-dark text-white text-xs font-bold px-2 py-1 rounded-md pointer-events-none">
        {displayUtilization}%
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-tinedy-dark"></div>
      </div>
    </div>
  );
};

export default WorkloadBar;