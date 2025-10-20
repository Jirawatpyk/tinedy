import React, { useState, useEffect } from 'react';
import BottomNavBar, { StaffPortalView } from '../components/layouts/BottomNavBar';
import StaffDashboardView from '../views/staff/StaffDashboardView';
import { usePackageStore } from '../store/packageStore';
import { useStaffStore } from '../store/staffStore';
import { usePackages } from '../hooks/usePackages';
import { useStaff } from '../hooks/useStaff';
import Loader from '../components/ui/Loader';
import { Booking, BookingStatus, JobIssue, StaffUnavailability, Package, LeaveRequest } from '../types';
import JobDetailsModal from '../components/staff/JobDetailsModal';
import CompleteJobModal from '../components/staff/CompleteJobModal';
import ReportIssueModal from '../components/staff/ReportIssueModal';
import ManageAvailabilityModal from '../components/staff/ManageAvailabilityModal';
import RequestLeaveModal from '../components/staff/RequestLeaveModal';
import { usePatchBooking } from '../hooks/useBookings';
import { useCreateJobIssue } from '../hooks/useIssues';
import { useCreateUnavailability, useUpdateUnavailability, useDeleteUnavailability } from '../hooks/useAvailability';
import { useCreateLeaveRequest, useCancelLeaveRequest } from '../hooks/useLeave';
import { useAuthStore } from '../store/authStore';
import StaffScheduleView from '../views/staff/StaffScheduleView';
import { useStaffSchedule } from '../hooks/useStaffSchedule';
import StaffProfileView from '../views/staff/StaffProfileView';
import StaffChatView from '../views/staff/StaffChatView';
import { useStaffAppNotificationsSetup } from '../hooks/useStaffAppNotificationsSetup';
import { useTeams } from '../hooks/useTeams';
import { useTeamStore } from '../store/teamStore';
import { useBookingStore } from '../store/bookingStore';
import StaffNotificationsView from '../views/staff/StaffNotificationsView';


const StaffPortalLayout: React.FC = () => {
    const [activeView, setActiveView] = useState<StaffPortalView>('dashboard');
    const user = useAuthStore(state => state.user);

    // Data population for stores
    const { data: packagesData, isLoading: packagesLoading } = usePackages();
    const { data: staffData, isLoading: staffLoading } = useStaff();
    
    // Fetch data specific to this layout
    const { data: staffBookings, isLoading: bookingsLoading } = useStaffSchedule();
    const { packages } = usePackageStore();

    // Populate stores with general data needed for notifications context
    const { data: teamsData } = useTeams();
    useEffect(() => { if (teamsData) useTeamStore.getState().setTeams(teamsData); }, [teamsData]);

    const { data: allBookingsData } = useStaffSchedule(); // Re-using for staff context
    useEffect(() => { if (allBookingsData) useBookingStore.getState().setBookings(allBookingsData); }, [allBookingsData]);

    // Setup real-time listeners for staff notifications
    useStaffAppNotificationsSetup();


    useEffect(() => { if (packagesData) usePackageStore.getState().setPackages(packagesData); }, [packagesData]);
    useEffect(() => { if (staffData) useStaffStore.getState().setStaff(staffData); }, [staffData]);

    const isLoading = bookingsLoading || packagesLoading || staffLoading;
    
    // --- Lifted State & Handlers ---
    const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
    const [completingBooking, setCompletingBooking] = useState<Booking | null>(null);
    const [reportingIssueFor, setReportingIssueFor] = useState<Booking | null>(null);
    
    // Availability State
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [editingUnavailability, setEditingUnavailability] = useState<StaffUnavailability | null>(null);
    const [preselectedDateForAvailability, setPreselectedDateForAvailability] = useState<Date | null>(null);

    // Leave Request State
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [preselectedDateForLeave, setPreselectedDateForLeave] = useState<Date | null>(null);


    const { mutate: patchBooking, isPending: isUpdatingStatus } = usePatchBooking({
        onSuccess: (updatedBooking) => {
            setCompletingBooking(null);
            setViewingBooking(updatedBooking);
        },
        onError: (err) => console.error("Failed to update status:", err)
    });

    const { mutate: createJobIssue, isPending: isReportingIssue } = useCreateJobIssue({
        onSuccess: () => setReportingIssueFor(null),
        onError: (err) => console.error("Failed to report issue:", err)
    });

    const { mutate: createUnavailability, isPending: isCreatingUnavailability } = useCreateUnavailability({
        onSuccess: () => setIsAvailabilityModalOpen(false),
    });
    const { mutate: updateUnavailability, isPending: isUpdatingUnavailability } = useUpdateUnavailability({
        onSuccess: () => {
            setEditingUnavailability(null);
            setIsAvailabilityModalOpen(false);
        }
    });
    const { mutate: deleteUnavailability, isPending: isDeletingUnavailability } = useDeleteUnavailability({});

    const { mutate: createLeaveRequest, isPending: isCreatingLeave } = useCreateLeaveRequest({
        onSuccess: () => setIsLeaveModalOpen(false),
    });

    const { mutate: cancelLeaveRequest } = useCancelLeaveRequest({});
    
    const handleOpenAvailabilityModal = (date?: Date) => {
        setEditingUnavailability(null);
        setPreselectedDateForAvailability(date || new Date());
        setIsAvailabilityModalOpen(true);
    };

    const handleEditUnavailability = (item: StaffUnavailability) => {
        setEditingUnavailability(item);
        setIsAvailabilityModalOpen(true);
    };

    const handleSaveUnavailability = (data: Omit<StaffUnavailability, 'id'|'createdAt'|'staffId'>) => {
        if (!user) return;
        const payload = { ...data, staffId: user.id };
        if (editingUnavailability) {
            updateUnavailability({ ...payload, id: editingUnavailability.id });
        } else {
            createUnavailability(payload);
        }
    };

    const handleOpenLeaveModal = (date: Date) => {
        setPreselectedDateForLeave(date);
        setIsLeaveModalOpen(true);
    };

    const handleSaveLeaveRequest = (data: Omit<LeaveRequest, 'id'|'createdAt'|'staffId'|'status'>) => {
        if (!user) return;
        createLeaveRequest({ ...data, staffId: user.id });
    };


    const handleStartJob = (bookingToStart: Booking) => {
        patchBooking({ id: bookingToStart.id, updateData: { status: BookingStatus.InProgress } });
    };

    const handleOpenCompleteJobModal = (booking: Booking) => {
        if(booking) {
            setCompletingBooking(booking);
            setViewingBooking(null);
        }
    };
    
    const handleConfirmCompletion = (completionNotes: string) => {
        if (!completingBooking) return;
        const note = `[บันทึกการทำงาน - ${new Date().toLocaleString('th-TH')}]:\n${completionNotes}`;
        const newNotes = completingBooking.notes ? `${completingBooking.notes}\n\n---\n\n${note}` : note;
        patchBooking({
            id: completingBooking.id,
            updateData: { status: BookingStatus.Completed, notes: newNotes }
        });
    };
    
    const handleCancelCompletion = () => {
        setViewingBooking(completingBooking);
        setCompletingBooking(null);
    };

    const handleOpenReportIssueModal = (booking: Booking) => {
        if(booking) {
            setReportingIssueFor(booking);
            setViewingBooking(null);
        }
    };
    
    const handleCancelReportIssue = () => {
        setViewingBooking(reportingIssueFor);
        setReportingIssueFor(null);
    };

    const handleConfirmReportIssue = (issueData: Omit<JobIssue, 'id' | 'createdAt' | 'reportedByStaffId' | 'status'>) => {
        if (!reportingIssueFor || !user) return;
        createJobIssue({
            ...issueData,
            bookingId: reportingIssueFor.id,
            reportedByStaffId: user.id,
        });
    };
    // --- End Lifted State & Handlers ---

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <StaffDashboardView onViewDetails={setViewingBooking} />;
            case 'schedule':
                return (
                    <StaffScheduleView 
                        bookings={staffBookings || []}
                        onViewDetails={setViewingBooking}
                        onManageAvailability={handleOpenAvailabilityModal}
                        onEditUnavailability={handleEditUnavailability}
                        onDeleteUnavailability={deleteUnavailability}
                        onOpenLeaveModal={handleOpenLeaveModal}
                        onCancelLeave={cancelLeaveRequest}
                    />
                );
            case 'chat':
                return <StaffChatView />;
            case 'notifications':
                return <StaffNotificationsView />;
            case 'profile':
                return <StaffProfileView />;
            default:
                return <StaffDashboardView onViewDetails={setViewingBooking} />;
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-tinedy-off-white dark:bg-slate-950">
                <Loader />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-tinedy-off-white dark:bg-slate-950 font-rule text-tinedy-dark dark:text-slate-300">
            <main className="flex-1 overflow-y-auto pb-20">
                {renderContent()}
            </main>
            <BottomNavBar activeView={activeView} setActiveView={setActiveView} />

             {/* Render all modals centrally */}
            <JobDetailsModal 
                booking={viewingBooking}
                onClose={() => setViewingBooking(null)}
                onStartJob={handleStartJob}
                onOpenCompleteJob={() => viewingBooking && handleOpenCompleteJobModal(viewingBooking)}
                onReportIssue={() => viewingBooking && handleOpenReportIssueModal(viewingBooking)}
                isUpdatingStatus={isUpdatingStatus}
            />
            <CompleteJobModal
                booking={completingBooking}
                onClose={handleCancelCompletion}
                onConfirm={handleConfirmCompletion}
                isCompleting={isUpdatingStatus}
            />
            <ReportIssueModal
                booking={reportingIssueFor}
                onClose={handleCancelReportIssue}
                onConfirm={handleConfirmReportIssue}
                isReporting={isReportingIssue}
            />
            <ManageAvailabilityModal
                isOpen={isAvailabilityModalOpen}
                onClose={() => {
                    setIsAvailabilityModalOpen(false);
                    setEditingUnavailability(null);
                }}
                onSave={handleSaveUnavailability}
                isSaving={isCreatingUnavailability || isUpdatingUnavailability}
                initialData={editingUnavailability}
                preselectedDate={preselectedDateForAvailability}
                bookings={staffBookings || []}
                packages={packages || []}
            />
            <RequestLeaveModal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                onSave={handleSaveLeaveRequest}
                isSaving={isCreatingLeave}
                preselectedDate={preselectedDateForLeave}
                bookings={staffBookings || []}
            />
        </div>
    );
};

export default StaffPortalLayout;