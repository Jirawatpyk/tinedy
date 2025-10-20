import React from 'react';
import { User, Page } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import {
    Squares2X2Icon, CalendarDaysIcon, ListBulletIcon, UsersIcon, BriefcaseIcon,
    ArchiveBoxIcon, ArrowRightStartOnRectangleIcon, QueueListIcon, ChartBarSquareIcon,
    UserCircleIcon, ChevronDownIcon, CogIcon, ChartBarIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, UserGroupIcon, ChatBubbleLeftEllipsisIcon
} from '../ui/icons';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/DropdownMenu';

interface SidebarProps {
  user: User | null;
  onNavLinkClick?: () => void;
}

interface SidebarLinkProps {
    onClick: () => void;
    isActive: boolean;
    isCollapsed: boolean;
    label: string;
    icon: React.ElementType;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ onClick, isActive, isCollapsed, label, icon: Icon }) => {
    const base = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors w-full text-left';
    const active = 'bg-white/10 text-white';
    const inactive = 'text-slate-300 hover:bg-white/10 hover:text-white';

    return (
        <button
            onClick={onClick}
            className={`${base} ${isActive ? active : inactive} ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? label : undefined}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>{label}</span>}
        </button>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ user, onNavLinkClick }) => {
    const { activeView, setActiveView, isSidebarCollapsed, toggleSidebar } = useUiStore();
    const logout = useAuthStore((state) => state.logout);

    const navLinks = [
        { id: 'dashboard', label: 'Dashboard', icon: Squares2X2Icon, roles: ['admin', 'manager', 'staff'] },
        { id: 'bookings', label: 'Bookings', icon: ListBulletIcon, roles: ['admin', 'manager', 'staff'] },
        { id: 'schedule', label: 'Schedule', icon: CalendarDaysIcon, roles: ['admin', 'manager', 'staff'] },
        { id: 'customers', label: 'Customers', icon: UsersIcon, roles: ['admin', 'manager'] },
        { id: 'staff', label: 'Staff', icon: BriefcaseIcon, roles: ['admin', 'manager'] },
        { id: 'teams', label: 'Teams', icon: UserGroupIcon, roles: ['admin', 'manager'] },
        { id: 'chat', label: 'Chat', icon: ChatBubbleLeftEllipsisIcon, roles: ['admin', 'manager'] },
        { id: 'workload', label: 'Workload', icon: ChartBarIcon, roles: ['admin', 'manager'] },
        { id: 'packages', label: 'Packages', icon: ArchiveBoxIcon, roles: ['admin', 'manager'] },
        { id: 'reports', label: 'Reports', icon: ChartBarSquareIcon, roles: ['admin', 'manager'] },
        { id: 'audit', label: 'Audit Log', icon: QueueListIcon, roles: ['admin', 'manager'] },
    ];

    const availableLinks = navLinks.filter(link => user?.role && link.roles.includes(user.role));
    
    const handleLinkClick = (page: Page) => {
        setActiveView(page);
        onNavLinkClick?.();
    };

    return (
        <aside className={`bg-tinedy-blue text-white flex flex-col h-full shadow-lg transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`flex items-center h-16 px-6 border-b border-white/20 flex-shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                {!isSidebarCollapsed && <h1 className="text-2xl font-bold text-white font-display tracking-wide">TINEDY</h1>}
            </div>
            <nav aria-label="Main navigation" className="flex-grow p-4 space-y-1 overflow-y-auto">
                {availableLinks.map(link => (
                    <SidebarLink
                        key={link.id}
                        onClick={() => handleLinkClick(link.id as Page)}
                        isActive={activeView === link.id}
                        isCollapsed={isSidebarCollapsed}
                        label={link.label}
                        icon={link.icon}
                    />
                ))}
            </nav>
            <div className="p-2 border-t border-white/20 flex-shrink-0">
                 <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        {isSidebarCollapsed ? (
                            <button className="w-full flex justify-center items-center rounded-lg hover:bg-white/10 p-2 text-slate-300">
                                <UserCircleIcon className="w-8 h-8" />
                            </button>
                        ) : (
                            <button className="w-full flex items-center gap-2 rounded-lg hover:bg-white/10 cursor-pointer p-2 text-left">
                                <UserCircleIcon className="w-10 h-10 text-slate-300 flex-shrink-0" />
                                <div className="flex-grow min-w-0">
                                    <p className="font-semibold text-sm text-white truncate">{user?.email}</p>
                                    <p className="text-xs text-slate-300 capitalize">{user?.role} Access</p>
                                </div>
                                <ChevronDownIcon className="w-4 h-4 text-slate-300 flex-shrink-0" />
                            </button>
                        )}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleLinkClick('profile')}>
                            <UserCircleIcon className="w-5 h-5 mr-2" /> My Profile
                        </DropdownMenuItem>
                        {user && (user.role === 'admin' || user.role === 'manager') && (
                            <DropdownMenuItem onClick={() => handleLinkClick('settings')}>
                                <CogIcon className="w-5 h-5 mr-2" /> Settings
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500">
                            <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-2" /> Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                <div className={`mt-2 flex ${isSidebarCollapsed ? 'justify-center' : 'justify-end'}`}>
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md text-slate-300 hover:bg-white/10 hover:text-white"
                        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isSidebarCollapsed ? <ChevronDoubleRightIcon className="w-5 h-5" /> : <ChevronDoubleLeftIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;