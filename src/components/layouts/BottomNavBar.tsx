import React, { useMemo } from 'react';
import { Squares2X2Icon, CalendarDaysIcon, UserCircleIcon, ChatBubbleLeftEllipsisIcon, BellIcon } from '../ui/icons';
import { useStaffMessageNotifications } from '../../hooks/useStaffMessageNotifications';
import { useNotificationStore } from '../../store/notificationStore';
import { useMarkConversationAsRead } from '../../hooks/useMessageMutations';
import { useStaffStore } from '../../store/staffStore';
import { useAuthStore } from '../../store/authStore';

export type StaffPortalView = 'dashboard' | 'schedule' | 'profile' | 'chat' | 'notifications';

interface BottomNavBarProps {
    activeView: StaffPortalView;
    setActiveView: (view: StaffPortalView) => void;
}

interface NavItemProps {
    label: string;
    icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
    badgeCount?: number;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon: Icon, isActive, onClick, badgeCount }) => {
    const color = isActive ? 'text-tinedy-blue dark:text-tinedy-yellow' : 'text-slate-500 dark:text-slate-400';
    return (
        <button
            onClick={onClick}
            className={`relative flex flex-col items-center justify-center gap-1 flex-1 transition-colors duration-200 ${color}`}
        >
            <Icon className={`w-6 h-6`} />
            <span className="text-xs font-bold">{label}</span>
            {badgeCount && badgeCount > 0 ? (
                <span className="absolute top-0 right-1/2 translate-x-5 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white dark:ring-slate-900 flex items-center justify-center">
                    {badgeCount > 9 ? '9+' : badgeCount}
                </span>
            ) : null}
        </button>
    );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setActiveView }) => {
    const { unreadCount: unreadChatCount } = useStaffMessageNotifications();
    const { notifications, markAllAsRead } = useNotificationStore();

    const { mutate: markChatAsRead } = useMarkConversationAsRead();
    const allStaff = useStaffStore(state => state.staff);
    const user = useAuthStore(state => state.user);
    const admin = useMemo(() => allStaff.find(s => s.role === 'admin'), [allStaff]);

    const appUnreadCount = notifications.filter(n =>
        !n.isRead && (n.type === 'ASSIGNMENT' || n.type === 'STATUS_CHANGE' || n.type === 'MENTION')
    ).length;


    const navItems = [
        { id: 'dashboard', label: 'หน้าแรก', icon: Squares2X2Icon },
        { id: 'schedule', label: 'ตารางงาน', icon: CalendarDaysIcon },
        { id: 'chat', label: 'แชท', icon: ChatBubbleLeftEllipsisIcon, badgeCount: unreadChatCount },
        { id: 'notifications', label: 'แจ้งเตือน', icon: BellIcon, badgeCount: appUnreadCount },
        { id: 'profile', label: 'โปรไฟล์', icon: UserCircleIcon },
    ];

    const handleNavClick = (view: StaffPortalView) => {
        if (view === 'chat' && user && admin && unreadChatCount > 0) {
            markChatAsRead({ readerId: user.id, senderId: admin.id });
        }
        if (view === 'notifications') {
          markAllAsRead();
        }
        setActiveView(view);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            {navItems.map(item => (
                <NavItem
                    key={item.id}
                    label={item.label}
                    icon={item.icon}
                    isActive={activeView === item.id}
                    onClick={() => handleNavClick(item.id as StaffPortalView)}
                    badgeCount={item.badgeCount}
                />
            ))}
        </nav>
    );
};

export default BottomNavBar;