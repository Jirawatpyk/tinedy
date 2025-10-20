import React from 'react';

interface DetailItemProps {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, icon, children, className }) => {
  return (
    <div className={className}>
      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-1">
        {icon}
        <span>{label}</span>
      </h3>
      <div className="text-slate-800 dark:text-slate-100">
        {children}
      </div>
    </div>
  );
};

export default DetailItem;