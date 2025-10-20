import React from 'react';
import { BookingStatus } from '../../types';
import { STATUS_CONFIG } from '../../constants';

interface StatusBadgeProps {
  status: BookingStatus;
  showDot?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = false }) => {
  const config = STATUS_CONFIG[status];

  if (!config) {
    return null;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {showDot && <span className={`w-2 h-2 mr-1.5 rounded-full ${config.dotColor}`}></span>}
      {config.label}
    </span>
  );
};

export default StatusBadge;
