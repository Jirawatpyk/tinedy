import React from 'react';
import { AppNotification, AppNotificationType } from '../../types';
import { formatDistanceToNow } from '../../lib/utils';
import { 
    PlusIcon, BriefcaseIcon, CheckCircleIcon, XCircleIcon, AtSymbolIcon, FlagIcon, BellIcon 
} from '../ui/icons';

const NotificationIcon: React.FC<{ type: AppNotificationType }> = ({ type }) => {
    const icons: Record<AppNotificationType, React.ElementType> = {
        'NEW_BOOKING': PlusIcon,
        'ASSIGNMENT': BriefcaseIcon,
        'STATUS_CHANGE': CheckCircleIcon,
        'CANCELLATION': XCircleIcon,
        'MENTION': AtSymbolIcon,
        'ISSUE_REPORTED': FlagIcon,
    };
    const colors: Record<AppNotificationType, string> = {
        'NEW_BOOKING': 'bg-tinedy-green',
        'ASSIGNMENT': 'bg-tinedy-blue',
        'STATUS_CHANGE': 'bg-tinedy-yellow',
        'CANCELLATION': 'bg-red-500',
        'MENTION': 'bg-purple-500',
        'ISSUE_REPORTED': 'bg-orange-500',
    };
    const Icon = icons[type] || BellIcon;
    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colors[type]}`}>
            <Icon className="w-5 h-5 text-white" />
        </div>
    );
};

interface NotificationItemProps {
    notification: AppNotification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
    // The onClick handler to navigate to the specific booking is a future enhancement.
    // For now, it's just a display component.
    const isOld = (new Date().getTime() - new Date(notification.createdAt).getTime()) > 1000 * 60 * 60 * 24 * 7; // older than 7 days

    return (
        <div 
            className={`bg-white dark:bg-slate-800 p-4 rounded-lg flex items-start gap-4 shadow-sm ${notification.isRead && isOld ? 'opacity-60' : ''}`}
        >
            <NotificationIcon type={notification.type} />
            <div className="flex-grow min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 font-rule">
                    {notification.message}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {formatDistanceToNow(notification.createdAt)}
                </p>
            </div>
        </div>
    );
};

export default NotificationItem;
