import React from 'react';
import { BookingStatus } from '../../types';
import { STATUS_CONFIG } from '../../constants';
import { Badge } from './Badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: BookingStatus;
  showDot?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = false, className }) => {
  const config = STATUS_CONFIG[status];

  if (!config) {
    return null;
  }

  return (
    <Badge className={cn(config.color, className)}>
      {showDot && <span className={cn("w-2 h-2 mr-1.5 rounded-full", config.dotColor)}></span>}
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
