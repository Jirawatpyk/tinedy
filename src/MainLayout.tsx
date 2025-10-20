import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Booking, ToastNotification, ToastType, Customer, StaffMember, Package } from './types';
import Header from './components/layout/Header';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, XMarkIcon } from './components/ui/icons';
import { supabase } from './lib/supabaseClient';
import { sendSms } from './lib/smsService';
import { useAuthStore } from './store/authStore';
import { useNotificationStore } from './store/notificationStore';
import { useBookingStore } from './store/bookingStore';
import { useCustomerStore } from './store/customerStore';
import { usePackageStore } from './store/packageStore';
import { useStaffStore } from './store/staffStore';
import { useUiStore } from './store/uiStore';
import { useBookings } from './hooks/useBookings';
import { useCustomers } from './hooks/useCustomers';
import { usePackages } from './hooks/usePackages';
import { useStaff } from './hooks/useStaff';
import { useSendReminder } from './hooks/useBookings';
import ErrorBoundary from './components/ErrorBoundary';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import DashboardView from './views/DashboardView';
import BookingsView from './views/BookingsView';
import CustomersView from './views/CustomersView';
import StaffView from './views/StaffView';
import PackagesView from './views/PackagesView';
import ScheduleView from './views/ScheduleView';
import ReportsView from './views/ReportsView';
import AuditLogPage from './components/audit/AuditLogPage';
import ProfileView from './views/ProfileView';
import WorkloadView from './views/WorkloadView';
import SettingsView from './views/SettingsView';
import { Database } from './lib/supabaseClient';
import Skeleton from './components/ui/Skeleton';
import CommandPalette from './components/layout/CommandPalette';
import GlobalAvailabilityChecker from './components/schedule/GlobalAvailabilityChecker';
import Sidebar from './components/layout/Sidebar';
import { useTeams } from './hooks/useTeams';
import { useTeamStore } from './store/teamStore';
import TeamsView from './views/TeamsView';
import ChatView from './views/ChatView';

// --- CO-LOCATED COMPONENTS (DUE TO PLATFORM CONSTRAINTS) ---

// --- Toast Notification System ---
const NotificationToast: React.FC<{ notification: ToastNotification; onClose: () => void }> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons: Record<ToastType, React.ElementType> = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    info: ExclamationTriangleIcon,
  };
  const colors: Record<ToastType, { border: string; icon: string; bg: string }> = {
    success: { border: 'border-tinedy-green', icon: 'text-tinedy-green', bg: 'bg-green-50' },
    error: { border: 'border-red-500', icon: 'text-red-500', bg: 'bg-red-50' },
    info: { border: 'border-amber-500', icon: 'text-amber-500', bg: 'bg-amber-50' },
  };
  const Icon = icons[notification.type];
  const color = colors[notification.type];

  return (
    <div className={`w-full max-w-sm bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border-l-4 ${color.border} animate-fade-in-up`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color.icon}`} aria-hidden="true" />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-bold text-slate-900">{notification.title}</p>
            <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onClose}
              className="bg-white rounded-md inline-flex text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tinedy-blue"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationContainer: React.FC<{ notifications: ToastNotification[]; onRemove: (id: number) => void }> = ({ notifications, onRemove }) => (
  <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
    <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
      {notifications.map((notification) => (
        <NotificationToast key={notification.id} notification={notification} onClose={() => onRemove(notification.id)} />
      ))}
    </div>
  </div>
);

// --- Skeleton Loader for Initial App Load ---
const SkeletonLayout: React.FC = () => (
    <div className="h-screen flex bg-tinedy-off-white dark:bg-slate-900 overflow-hidden">
        {/* Skeleton Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
            <div className="w-64 flex flex-col">
                <Skeleton className="h-16 flex-shrink-0" />
                <div className="flex-grow p-4 space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-20 flex-shrink-0" />
            </div>
        </div>
        <div className="flex-1 flex flex-col min-w-0">
            {/* Skeleton Header */}
            <header className="bg-white/80 dark:bg-slate-900/80 shadow-sm dark:shadow-none border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-9 w-64 rounded-lg" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-9 w-24 rounded-lg" />
                            <Skeleton className="h-9 w-9 rounded-lg" />
                        </div>
                    </div>
                </div>
            </header>
            {/* Skeleton Content Area */}
            <main className="flex-grow overflow-y-auto">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-6">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </main>
        </div>
    </div>
);


// --- Data Loader Component ---
const DataLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const setBookings = useBookingStore(state => state.setBookings);
    const setCustomers = useCustomerStore(state => state.setCustomers);
    const setPackages = usePackageStore(state => state.setPackages);
    const setStaff = useStaffStore(state => state.setStaff);
    const setTeams = useTeamStore(state => state.setTeams);

    const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError } = useBookings();
    const { data: customersData, isLoading: customersLoading, error: customersError } = useCustomers();
    const { data: packagesData, isLoading: packagesLoading, error: packagesError } = usePackages();
    const { data: staffData, isLoading: staffLoading, error: staffError } = useStaff();
    const { data: teamsData, isLoading: teamsLoading, error: teamsError } = useTeams();

    useEffect(() => { if (bookingsData) setBookings(bookingsData); }, [bookingsData, setBookings]);
    useEffect(() => { if (customersData) setCustomers(customersData); }, [customersData, setCustomers]);
    useEffect(() => { if (packagesData) setPackages(packagesData); }, [packagesData, setPackages]);
    useEffect(() => { if (staffData) setStaff(staffData); }, [staffData, setStaff]);
    useEffect(() => { if (teamsData) setTeams(teamsData); }, [teamsData, setTeams]);

    const isLoading = bookingsLoading || customersLoading || packagesLoading || staffLoading || teamsLoading;
    const error = bookingsError || customersError || packagesError || staffError || teamsError;
    
    if (isLoading) {
        return <SkeletonLayout />;
    }
    if (error) {
        return <div className="text-center p-10 text-red-500 dark:text-red-400">Error: {error.message}</div>;
    }

    return <>{children}</>;
};

// --- Main Authenticated App Layout ---
const MainLayout: React.FC = () => {
  const {
      activeView,
      toggleCommandPalette,
      isGlobalAvailabilityCheckerOpen,
      onAvailabilityCheckerCancel,
      closeAllModals,
      setActiveView,
      openAddBookingModal,
  } = useUiStore();
  const remindersSentRef = useRef(false);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const addToast = (message: string, type: ToastType, title: string) => {
    const newToast = { id: Date.now(), message, type, title };
    setToasts(prev => [...prev, newToast]);
  };
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(n => n.id !== id));
  };
  
  const addNotification = useNotificationStore((state) => state.addNotification);
  const { mutate: sendReminderMutate } = useSendReminder();
  
  // Global key listener for Command Palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleCommandPalette]);

  useEffect(() => {
    const bookings = useBookingStore.getState().bookings;
    const packages = usePackageStore.getState().packages;
    
    const checkAndSendReminders = async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDateString = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

      const bookingsToSendRemindersFor = bookings.filter(b =>
        b.bookingDate === tomorrowDateString &&
        b.status === 'Confirmed' &&
        !b.reminderSent
      );

      if (bookingsToSendRemindersFor.length === 0) return;

      for (const booking of bookingsToSendRemindersFor) {
        const pkg = packages.find(p => p.id === booking.packageId);
        const customerPhone = booking.customer.phone;

        if (!customerPhone) continue;
        
        const message = `Hi ${booking.customer.name}, this is a reminder for your upcoming appointment with Tinedy Solutions for the "${pkg?.name || 'service'}" package tomorrow, ${booking.bookingDate} at ${booking.bookingTime}.`;

        try {
          const smsResult = await sendSms(customerPhone, message);
          if (smsResult.success) {
            sendReminderMutate(booking.id);
          }
        } catch (err) {
          console.error(`SMS Reminders Error for booking ${booking.id}:`, err);
        }
      }
    };
    if (bookings.length > 0 && packages.length > 0 && !remindersSentRef.current) {
        checkAndSendReminders();
        remindersSentRef.current = true;
    }
  }, [sendReminderMutate]);

  useEffect(() => {
    if (!supabase || !user) return;

    const handleBookingChange = (payload: RealtimePostgresChangesPayload<Database['public']['Tables']['bookings']['Row']>) => {
        // Use local state as the source of truth for "before" state, instead of unreliable payload.old
        const currentBookings = useBookingStore.getState().bookings;
        const customers = useCustomerStore.getState().customers;
        const teams = useTeamStore.getState().teams;

        const newPayload = payload.new as Database['public']['Tables']['bookings']['Row'];
        
        const getCustomerName = (customerId: string) => customers.find(c => c.id === customerId)?.name || 'a customer';

        if (payload.eventType === 'INSERT') {
            const customerName = getCustomerName(newPayload.customer_id);
            addNotification(`New booking for ${customerName} was created.`, 'NEW_BOOKING', { targetPage: 'bookings', targetId: newPayload.id });
        }
        
        if (payload.eventType === 'UPDATE') {
            const oldBooking = currentBookings.find(b => b.id === newPayload.id);
            if (!oldBooking) return; // Can't compare if we don't have the old state

            const customerName = getCustomerName(newPayload.customer_id);

            // Logic using reliable local state and new payload
            // Check for individual staff assignment change first
            if ('assigned_staff_id' in newPayload && oldBooking.assignedStaffId !== newPayload.assigned_staff_id) {
                if (newPayload.assigned_staff_id === user.id) {
                    const assignmentPref = user.notificationPreferences.ASSIGNMENT;
                    if (typeof assignmentPref === 'boolean' ? assignmentPref : assignmentPref.enabled) {
                        addNotification(`You have been assigned to a booking for ${customerName}.`, 'ASSIGNMENT', { targetPage: 'schedule', targetId: newPayload.id });
                    }
                }
            }
            // Then, check for team assignment changes
            else if ('assigned_team_id' in newPayload && oldBooking.assignedTeamId !== newPayload.assigned_team_id) {
                if (newPayload.assigned_team_id) {
                    const assignedTeam = teams.find(t => t.id === newPayload.assigned_team_id);
                    if (assignedTeam?.members.some(member => member.id === user.id)) {
                        const assignmentPref = user.notificationPreferences.ASSIGNMENT;
                        if (typeof assignmentPref === 'boolean' ? assignmentPref : assignmentPref.enabled) {
                            addNotification(`Your team, "${assignedTeam.name}", has been assigned to a booking for ${customerName}.`, 'ASSIGNMENT', { targetPage: 'bookings', targetId: newPayload.id });
                        }
                    }
                }
            }
            // Finally, check for status changes if no assignment changed
            else if ('status' in newPayload && oldBooking.status !== newPayload.status) {
                const statusChangePref = user.notificationPreferences.STATUS_CHANGE;
                let shouldNotify = false;

                if (typeof statusChangePref === 'boolean') {
                    shouldNotify = statusChangePref;
                } else if (typeof statusChangePref === 'object' && statusChangePref !== null) {
                    if (!statusChangePref.enabled) {
                        shouldNotify = false;
                    } else if (statusChangePref.assignedToMeOnly) {
                        const isDirectlyAssigned = user.id === newPayload.assigned_staff_id;
                        const isMemberOfAssignedTeam = newPayload.assigned_team_id ? (teams.find(t => t.id === newPayload.assigned_team_id)?.members.some(m => m.id === user.id) ?? false) : false;
                        if (isDirectlyAssigned || isMemberOfAssignedTeam) {
                            shouldNotify = true;
                        }
                    } else {
                        shouldNotify = true;
                    }
                }
                
                if (shouldNotify) {
                    const message = newPayload.status === 'Cancelled' ? `Booking for ${customerName} has been cancelled.` : `Booking for ${customerName} is now '${newPayload.status}'.`;
                    const type = newPayload.status === 'Cancelled' ? 'CANCELLATION' : 'STATUS_CHANGE';
                    addNotification(message, type, { targetPage: 'bookings', targetId: newPayload.id });
                }
            }
        }
        
        // Always invalidate to keep local state fresh
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
    };

    const bookingsChannel = supabase.channel('public:bookings-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, 
        handleBookingChange
    ).subscribe();

    const customersChannel = supabase.channel('public:customers-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
          }
      ).subscribe();
      
    const staffChannel = supabase.channel('public:staff-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' },
          () => queryClient.invalidateQueries({ queryKey: ['staff'] })
      ).subscribe();
        
    const packagesChannel = supabase.channel('public:packages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'packages' },
          () => queryClient.invalidateQueries({ queryKey: ['packages'] })
      ).subscribe();

    const teamsChannel = supabase.channel('public:teams-and-members-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' },
          () => queryClient.invalidateQueries({ queryKey: ['teams'] })
      ).on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' },
          () => queryClient.invalidateQueries({ queryKey: ['teams'] })
      ).subscribe();

    return () => {
        supabase.removeChannel(bookingsChannel);
        supabase.removeChannel(customersChannel);
        supabase.removeChannel(staffChannel);
        supabase.removeChannel(packagesChannel);
        supabase.removeChannel(teamsChannel);
    };
  }, [queryClient, addNotification, user]);
  
  const handleCheckerClose = () => {
      if (onAvailabilityCheckerCancel) {
          onAvailabilityCheckerCancel();
      }
      closeAllModals();
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'bookings': return <BookingsView addToast={addToast} />;
      case 'customers': return <CustomersView addToast={addToast} />;
      case 'staff': return <StaffView addToast={addToast} />;
      case 'teams': return <TeamsView addToast={addToast} />;
      case 'chat': return <ChatView />;
      case 'workload': return <WorkloadView />;
      case 'packages': return <PackagesView addToast={addToast} />;
      case 'schedule': return <ScheduleView addToast={addToast} />;
      case 'reports': return <ReportsView />;
      case 'audit': return <AuditLogPage />;
      case 'profile': return <ProfileView addToast={addToast} />;
      case 'settings': return <SettingsView addToast={addToast} />;
      default: return <DashboardView />;
    }
  };

  const viewWrapperClasses = "max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col";

  return (
    <div className="relative h-screen flex overflow-hidden bg-tinedy-off-white dark:bg-slate-900 font-sans text-tinedy-dark dark:text-slate-300">
        <NotificationContainer notifications={toasts} onRemove={removeToast} />
        <CommandPalette />
        <GlobalAvailabilityChecker
            isOpen={isGlobalAvailabilityCheckerOpen}
            onClose={handleCheckerClose}
            onSelectAndBook={(initialValues) => {
                closeAllModals();
                setActiveView('bookings');
                openAddBookingModal(null, initialValues);
            }}
            addToast={addToast}
        />

        {/* Sidebar for Mobile (overlay) */}
        <div className={`fixed inset-0 flex z-40 lg:hidden ${isMobileSidebarOpen ? '' : 'pointer-events-none'}`}>
            <div 
                className={`fixed inset-0 bg-black bg-opacity-60 transition-opacity ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-hidden="true"
            ></div>
            <div className={`relative flex-1 flex flex-col max-w-xs w-full transform transition-transform ease-in-out duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                 <Sidebar user={user} onNavLinkClick={() => setIsMobileSidebarOpen(false)} />
            </div>
        </div>

        {/* Sidebar for Desktop (static) */}
        <div className="hidden lg:flex lg:flex-shrink-0">
           <Sidebar user={user} />
        </div>

        <div className="relative flex flex-col w-0 flex-1 overflow-hidden isolate z-10">
            <Header onMobileNavOpen={() => setIsMobileSidebarOpen(true)} />
            <main className="flex-1 relative overflow-y-auto focus:outline-none">
                <div className={viewWrapperClasses}>
                    <ErrorBoundary>
                        {renderView()}
                    </ErrorBoundary>
                </div>
            </main>
        </div>
    </div>
  );
};


const MainLayoutWrapper: React.FC = () => (
    <DataLoader>
        <MainLayout />
    </DataLoader>
);

export default MainLayoutWrapper;