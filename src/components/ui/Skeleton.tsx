import React from 'react';

/**
 * A simple, re-usable skeleton component that displays a pulsing gray box.
 * Used to create placeholder UIs while data is loading.
 */
const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={`bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${className || ''}`}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
