import React, { useState, useRef, useEffect } from 'react';
import { AppNotification, AppNotificationType } from '../../types';
import { useThemeStore, Theme } from '../../store/themeStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useUiStore } from '../../store/uiStore';
import { 
    SunIcon, MoonIcon, BellIcon, PlusIcon, CheckCircleIcon, XCircleIcon, BriefcaseIcon, AtSymbolIcon, Bars3Icon, MagnifyingGlassIcon, QuestionMarkCircleIcon, FlagIcon
} from '../ui/icons';
import GlobalSearch from './GlobalSearch';
import { formatDistanceToNow } from '../../lib/utils';


interface HeaderProps {
    onMobileNavOpen: () => void;
}

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
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colors[type]}`}>
            <Icon className="w-4 h-4 text-white" />
        </div>
    );
};

const NotificationDropdown: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotificationStore();
    const setActiveView = useUiStore((state) => state.setActiveView);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            onClose();
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleItemClick = (item: AppNotification) => {
        if (!item.isRead) markAsRead(item.id);
        if (item.targetPage) setActiveView(item.targetPage);
        onClose();
    };
    
    return (
         <div ref={menuRef} className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-2xl ring-1 ring-black ring-opacity-5 z-40 animate-fade-in-up" style={{ animationDuration: '150ms' }}>
            <div className="flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-800 dark:text-slate-100">Notifications</h4>
                <button onClick={markAllAsRead} className="text-xs font-semibold text-tinedy-blue hover:underline">Mark all as read</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(item => (
                        <div key={item.id} onClick={() => handleItemClick(item)} className={`flex items-start gap-3 p-3 border-b border-slate-100 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 ${!item.isRead ? 'bg-tinedy-blue/5 dark:bg-tinedy-blue/10' : ''}`}>
                           <NotificationIcon type={item.type} />
                           <div className="flex-grow">
                               <p className="text-sm text-slate-700 dark:text-slate-200">{item.message}</p>
                               <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatDistanceToNow(item.createdAt)}</p>
                           </div>
                        </div>
                    ))
                ) : (
                    <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">You're all caught up!</p>
                )}
            </div>
             <div className="p-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
                <button onClick={clearNotifications} className="w-full text-center text-xs font-semibold text-slate-500 hover:text-red-500 p-1">
                    Clear All
                </button>
            </div>
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ onMobileNavOpen }) => {
  const { toggleCommandPalette, openGlobalAvailabilityChecker } = useUiStore();
  const { theme, cycleTheme } = useThemeStore();
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const ThemeIcon: React.FC<{ theme: Theme }> = ({ theme }) => {
    return theme === 'dark' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />;
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 flex-shrink-0">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
            {/* Left Group: Hamburger, Global Search */}
            <div className="flex items-center gap-4">
                <button 
                    className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300" 
                    onClick={onMobileNavOpen}
                    aria-controls="mobile-menu"
                    aria-label="Open sidebar"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
                <div className="w-full max-w-xs sm:max-w-md">
                    <GlobalSearch />
                </div>
            </div>
            
            {/* Right Group: Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
                 <button
                      onClick={toggleCommandPalette}
                      className="hidden lg:flex p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors items-center gap-2 border border-slate-300 dark:border-slate-700"
                      title="Open command palette (⌘K)"
                      aria-label="Open command palette"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4" />
                      <span className="text-xs font-semibold text-slate-500">⌘K</span>
                </button>
                
                 <button
                      onClick={() => openGlobalAvailabilityChecker({ mode: 'discovery' })}
                      className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                      title="Check Staff Availability"
                      aria-label="Check Staff Availability"
                    >
                      <QuestionMarkCircleIcon className="w-5 h-5" />
                </button>

                <div className="relative">
                    <button
                      onClick={() => setIsNotificationsOpen(prev => !prev)}
                      className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                      title="Notifications"
                      aria-label="Toggle notifications"
                    >
                      <BellIcon className="w-5 h-5" />
                       {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white dark:ring-slate-900 flex items-center justify-center">
                            {unreadCount}
                        </span>
                       )}
                    </button>
                    {isNotificationsOpen && <NotificationDropdown onClose={() => setIsNotificationsOpen(false)} />}
                </div>

                <button
                  onClick={cycleTheme}
                  className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                  title={`Change theme (current: ${theme})`}
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                >
                  <ThemeIcon theme={theme} />
                </button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;