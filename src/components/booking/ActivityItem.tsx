import React from 'react';
import { BookingComment, AuditLog, User, AuditAction } from '../../types';
import { TrashIcon, CheckCircleIcon, BriefcaseIcon, PencilIcon, PlusIcon, ExclamationTriangleIcon, ChatBubbleLeftEllipsisIcon, BellIcon, ArrowRightStartOnRectangleIcon } from '../ui/icons';

type FeedItem = (BookingComment & { itemType: 'comment' }) | (AuditLog & { itemType: 'log' });

interface ActivityItemProps {
    item: FeedItem;
    currentUser: User;
    onDelete: (comment: BookingComment) => void;
}

const formatRelativeTime = (isoDate: string) => {
    const date = new Date(isoDate);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const parseMentions = (text: string) => {
    const mentionRegex = /@([\w\s]+)/g;
    const parts = text.split(mentionRegex);

    return parts.map((part, index) => {
        // Every odd-indexed part is a mention
        if (index % 2 === 1) {
            return (
                <strong
                    key={index}
                    className="bg-tinedy-blue/10 text-tinedy-blue dark:bg-blue-500/20 dark:text-blue-300 font-semibold px-1 rounded-sm"
                >
                    @{part}
                </strong>
            );
        }
        return part;
    });
};

const ActionIcon: React.FC<{ action: AuditAction }> = ({ action }) => {
    const iconMap: Record<AuditAction, { icon: React.ElementType; color: string }> = {
        'CREATE_BOOKING': { icon: PlusIcon, color: 'bg-tinedy-green' },
        'UPDATE_BOOKING': { icon: PencilIcon, color: 'bg-tinedy-yellow' },
        'UPDATE_STATUS': { icon: CheckCircleIcon, color: 'bg-tinedy-blue' },
        'DELETE_BOOKING': { icon: TrashIcon, color: 'bg-red-500' },
        'ASSIGN_STAFF': { icon: BriefcaseIcon, color: 'bg-slate-500' },
        'OVERRIDE_ASSIGNMENT': { icon: ExclamationTriangleIcon, color: 'bg-amber-500' },
        'SEND_REMINDER': { icon: BellIcon, color: 'bg-tinedy-blue' },
        'CREATE_CUSTOMER': { icon: PlusIcon, color: 'bg-tinedy-green' },
        'UPDATE_CUSTOMER': { icon: PencilIcon, color: 'bg-tinedy-yellow' },
        'DELETE_CUSTOMER': { icon: TrashIcon, color: 'bg-red-500' },
        'CREATE_STAFF': { icon: PlusIcon, color: 'bg-tinedy-green' },
        'UPDATE_STAFF': { icon: PencilIcon, color: 'bg-tinedy-yellow' },
        'DELETE_STAFF': { icon: TrashIcon, color: 'bg-red-500' },
        'CREATE_PACKAGE': { icon: PlusIcon, color: 'bg-tinedy-green' },
        'UPDATE_PACKAGE': { icon: PencilIcon, color: 'bg-tinedy-yellow' },
        'DELETE_PACKAGE': { icon: TrashIcon, color: 'bg-red-500' },
        'USER_LOGIN': { icon: ArrowRightStartOnRectangleIcon, color: 'bg-slate-500' },
        'POST_COMMENT': { icon: ChatBubbleLeftEllipsisIcon, color: 'bg-tinedy-blue' },
        'DELETE_COMMENT': { icon: TrashIcon, color: 'bg-red-500' },
    };

    const config = iconMap[action] || { icon: PencilIcon, color: 'bg-slate-400' };
    const Icon = config.icon;

    return (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
            <Icon className="w-4 h-4 text-white" />
        </div>
    );
};


const ActivityItem: React.FC<ActivityItemProps> = ({ item, currentUser, onDelete }) => {
    if (item.itemType === 'comment') {
        const isCurrentUser = currentUser.id === item.authorId;
        const canDelete = currentUser.role === 'admin' || currentUser.role === 'manager' || isCurrentUser;

        return (
            <div className={`flex items-start gap-2.5 group ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm flex-shrink-0 ${isCurrentUser ? 'bg-tinedy-blue' : 'bg-tinedy-green'}`}>
                    {item.authorName.charAt(0)}
                </div>
                <div className={`w-full max-w-[85%] rounded-lg px-3 py-2 ${isCurrentUser ? 'bg-white dark:bg-slate-700/50 rounded-br-none' : 'bg-white dark:bg-slate-700/50 rounded-bl-none'}`}>
                    <div className="flex items-baseline justify-between">
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{item.authorName}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 ml-3 flex-shrink-0">{formatRelativeTime(item.createdAt)}</p>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap break-words mt-1">{parseMentions(item.content)}</p>
                </div>
                {canDelete && (
                    <button
                        onClick={() => onDelete(item)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete comment"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
        );
    }
    
    if (item.itemType === 'log') {
        return (
            <div className="flex items-start gap-2.5">
                <ActionIcon action={item.action} />
                <div className="pt-1 flex-grow">
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                        {item.details}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        <span className="font-medium">{item.userEmail}</span> &bull; {formatRelativeTime(item.createdAt)}
                    </p>
                </div>
            </div>
        )
    }

    return null;
};

export default ActivityItem;