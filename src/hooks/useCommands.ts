import { useMemo, useCallback } from 'react';
import { useUiStore } from '../store/uiStore';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import {
    Squares2X2Icon, ListBulletIcon, CalendarDaysIcon, UsersIcon, BriefcaseIcon,
    ArchiveBoxIcon, ChartBarSquareIcon, QueueListIcon, PlusIcon, MoonIcon,
    SunIcon, ArrowRightStartOnRectangleIcon, QuestionMarkCircleIcon
} from '../components/ui/icons';
import { Page } from '../types';

export interface Command {
    id: string;
    section: 'Navigation' | 'Actions' | 'Theme' | 'General';
    title: string;
    subtitle?: string;
    icon: React.ElementType;
    action: () => void;
}

export const useCommands = (): Command[] => {
    const executeAndClose = useCallback((fn: () => void) => {
        // This function is the one that gets called when a command is executed.
        return () => {
            fn(); // Execute the specific command action
            useUiStore.getState().closeCommandPalette(); // Then close just the palette
        };
    }, []); // No dependencies are needed, making this function stable.

    // The list of commands is memoized once, as `executeAndClose` is stable.
    // Each action calls `getState()` at execution time to ensure it's always the latest version.
    const commands: Command[] = useMemo(() => [
        // Navigation
        { id: 'nav-dashboard', section: 'Navigation', title: 'Go to Dashboard', icon: Squares2X2Icon, action: executeAndClose(() => useUiStore.getState().setActiveView('dashboard')) },
        { id: 'nav-bookings', section: 'Navigation', title: 'Go to Bookings', icon: ListBulletIcon, action: executeAndClose(() => useUiStore.getState().setActiveView('bookings')) },
        { id: 'nav-schedule', section: 'Navigation', title: 'Go to Schedule', icon: CalendarDaysIcon, action: executeAndClose(() => useUiStore.getState().setActiveView('schedule')) },
        { id: 'nav-customers', section: 'Navigation', title: 'Go to Customers', icon: UsersIcon, action: executeAndClose(() => useUiStore.getState().setActiveView('customers')) },
        { id: 'nav-staff', section: 'Navigation', title: 'Go to Staff', icon: BriefcaseIcon, action: executeAndClose(() => useUiStore.getState().setActiveView('staff')) },
        { id: 'nav-packages', section: 'Navigation', title: 'Go to Packages', icon: ArchiveBoxIcon, action: executeAndClose(() => useUiStore.getState().setActiveView('packages')) },
        { id: 'nav-reports', section: 'Navigation', title: 'Go to Reports', icon: ChartBarSquareIcon, action: executeAndClose(() => useUiStore.getState().setActiveView('reports')) },
        { id: 'nav-audit', section: 'Navigation', title: 'Go to Audit Log', icon: QueueListIcon, action: executeAndClose(() => useUiStore.getState().setActiveView('audit')) },

        // Actions
        { id: 'action-new-booking', section: 'Actions', title: 'New Booking', subtitle: 'Create a new appointment', icon: PlusIcon, action: executeAndClose(() => {
            const { setActiveView, openAddBookingModal } = useUiStore.getState();
            setActiveView('bookings');
            openAddBookingModal();
        }) },
        { id: 'action-new-customer', section: 'Actions', title: 'New Customer', subtitle: 'Add a new customer profile', icon: PlusIcon, action: executeAndClose(() => {
            const { setActiveView, openAddCustomerModal } = useUiStore.getState();
            setActiveView('customers');
            openAddCustomerModal();
        }) },
        { id: 'action-new-staff', section: 'Actions', title: 'New Staff Member', subtitle: 'Add a new staff member', icon: PlusIcon, action: executeAndClose(() => {
            const { setActiveView, openAddStaffModal } = useUiStore.getState();
            setActiveView('staff');
            openAddStaffModal();
        }) },
        { id: 'action-new-package', section: 'Actions', title: 'New Package', subtitle: 'Create a new service package', icon: PlusIcon, action: executeAndClose(() => {
            const { setActiveView, openAddPackageModal } = useUiStore.getState();
            setActiveView('packages');
            openAddPackageModal();
        }) },
        { id: 'action-check-availability', section: 'Actions', title: 'Check Staff Availability', subtitle: 'Find available staff for a specific time', icon: QuestionMarkCircleIcon, action: executeAndClose(() => useUiStore.getState().openGlobalAvailabilityChecker({ mode: 'discovery' })) },

        // Theme
        { id: 'theme-toggle', section: 'Theme', title: 'Toggle Dark/Light Mode', icon: MoonIcon, action: executeAndClose(() => useThemeStore.getState().cycleTheme()) },
        { id: 'theme-light', section: 'Theme', title: 'Switch to Light Mode', icon: SunIcon, action: executeAndClose(() => useThemeStore.getState().setTheme('light')) },
        { id: 'theme-dark', section: 'Theme', title: 'Switch to Dark Mode', icon: MoonIcon, action: executeAndClose(() => useThemeStore.getState().setTheme('dark')) },

        // General
        { id: 'general-logout', section: 'General', title: 'Logout', subtitle: 'Sign out of your account', icon: ArrowRightStartOnRectangleIcon, action: executeAndClose(() => useAuthStore.getState().logout()) },
    ], [executeAndClose]);

    return commands;
};
