import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg shadow-slate-200/40 dark:shadow-none dark:border dark:border-slate-800 ${className}`}>
      {children}
    </div>
  );
};

export default Card;