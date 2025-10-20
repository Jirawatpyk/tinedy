import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../ui/Modal';
// FIX: Import 'Team' type to resolve a 'Cannot find name' error.
import { StaffMember, Package, BookingStatus, Service, Booking, Customer, CustomerRelationship, Team, ToastType } from '../../types';
import { useStaffStore } from '../../store/staffStore';
import { usePackageStore } from '../../store/packageStore';
import { useBookingStore } from '../../store/bookingStore';
import { NewBookingData } from '../../dal/bookings';
import { useAssignStaffToBooking, useAssignTeamToBooking } from '../../hooks/useBookings';
import NativeDatePicker from '../ui/NativeDatePicker';
import InputField from '../ui/InputField';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { useUiStore } from '../../store/uiStore';
import SearchInput from '../ui/SearchInput';
import { useStaffSuggestions, StaffSuggestion } from '../../hooks/useStaffSuggestions';
import Loader from '../ui/Loader';
import OverrideConfirmationModal from '../booking/OverrideConfirmationModal';
import AvailabilityResultCard from './AvailabilityResultCard';
import { useTeamStore } from '../../store/teamStore';
import TeamAvailabilityResultCard from './TeamAvailabilityResultCard';
import { useTeamAvailability, TeamAvailabilitySuggestion } from '../../hooks/useTeamAvailability';


interface GlobalAvailabilityCheckerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectAndBook: (initialValues: Partial<NewBookingData>) => void;
    addToast: (message: string, type: ToastType, title: string) => void;
}

const GlobalAvailabilityChecker: React.FC<GlobalAvailabilityCheckerProps> = ({ isOpen, onClose, onSelectAndBook, addToast }) => {
    const { availabilityCheckerContext, onAvailabilityCheckerSuccess } = useUiStore();
    
    const isDiscoveryMode = availabilityCheckerContext?.mode === 'discovery';
    const isFormAssistMode = availabilityCheckerContext?.mode === 'form-assist';
    const isDirectAssignMode = availabilityCheckerContext?.mode === 'direct-assign';

    const contextBooking = availabilityCheckerContext?.booking;
    const contextFormData = availabilityCheckerContext?.formData;

    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);
    const [time, setTime] = useState('09:00');
    const [packageId, setPackageId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [staffToOverride, setStaffToOverride] = useState<StaffSuggestion | null>(null);
    const [teamToOverride, setTeamToOverride] = useState<TeamAvailabilitySuggestion | null>(null);
    const [activeTab, setActiveTab] = useState<'staff' | 'teams'>('staff');
    
    const { bookings: allBookings } = useBookingStore();
    const { staff: allStaff } = useStaffStore();
    const { packages } = usePackageStore();
    const { teams: allTeams } = useTeamStore();

    const mockBooking = useMemo(() => {
        if (!date || !time || !packageId) return null;
        if (isDirectAssignMode && contextBooking) return contextBooking;
        
        const mockCustomer: Customer = { id: 'temp-customer', name: 'New Customer', email: '', phone: '', createdAt: new Date().toISOString(), relationship: CustomerRelationship.New, notes: null };
        return { id: 'temp-booking', bookingDate: date, bookingTime: time, packageId: packageId, address: contextFormData?.address || 'Default Address', customer: contextBooking?.customer || mockCustomer, customerId: contextBooking?.customerId || 'temp-customer', status: BookingStatus.Pending, reminderSent: false } as Booking;
    }, [date, time, packageId, isDirectAssignMode, contextBooking, contextFormData]);
    
    const targetBookingForSuggestions = isDirectAssignMode ? contextBooking || null : mockBooking;
    
    const { suggestions: staffSuggestions, isLoading: staffSuggestionsLoading } = useStaffSuggestions(targetBookingForSuggestions, allStaff, allBookings, packages, allTeams);
    const { suggestions: teamSuggestions, isLoading: teamSuggestionsLoading } = useTeamAvailability(targetBookingForSuggestions, allTeams, allStaff, allBookings, packages);
    
    useEffect(() => {
        if (isOpen) {
            const context = availabilityCheckerContext;
            
            if (context?.mode === 'direct-assign' && context.booking) {
                setDate(context.booking.bookingDate);
                setTime(context.booking.bookingTime);
                setPackageId(context.booking.packageId);
                setActiveTab(context.defaultTab || (context.booking.assignedTeamId ? 'teams' : 'staff'));
            } else if (context?.mode === 'form-assist') {
                const bookingForContext = context.booking; // This is the 'editingItem'
                setDate(context.formData?.bookingDate || bookingForContext?.bookingDate || today);
                setTime(context.formData?.bookingTime || bookingForContext?.bookingTime || '09:00');
                setPackageId(context.formData?.packageId || bookingForContext?.packageId || '');
                setActiveTab(context.defaultTab || 'staff');
            } else { // discovery mode
                setDate(today);
                setTime('09:00');
                setPackageId(packages.length > 0 ? packages[0].id : '');
                setActiveTab('staff');
            }
            setSearchQuery('');
            setStaffToOverride(null);
            setTeamToOverride(null);
        }
    }, [isOpen, availabilityCheckerContext, today, packages]);
    
    const packageOptions = useMemo(() => packages.map(p => ({ value: p.id, label: p.name })), [packages]);

    const { mutate: assignStaff } = useAssignStaffToBooking({
        onSuccess: (updatedBooking) => {
            const staffName = allStaff.find(s => s.id === updatedBooking.assignedStaffId)?.name || 'unassigned';
            addToast(`Assigned ${staffName} to booking for ${updatedBooking.customer.name}.`, 'success', 'Assignment Updated');
            onClose();
        },
        onError: (error) => {
            addToast(error.message, 'error', 'Assignment Failed');
        },
    });

    const { mutate: assignTeam } = useAssignTeamToBooking({
        onSuccess: (updatedBooking) => {
            const teamName = allTeams.find(t => t.id === updatedBooking.assignedTeamId)?.name || 'unassigned';
            addToast(`Assigned team "${teamName}" to booking for ${updatedBooking.customer.name}.`, 'success', 'Assignment Updated');
            onClose();
        },
        onError: (error) => {
            addToast(error.message, 'error', 'Assignment Failed');
        },
    });
    
    const filteredStaffSuggestions = useMemo(() => staffSuggestions.filter(s => s.staff.name.toLowerCase().includes(searchQuery.toLowerCase())), [staffSuggestions, searchQuery]);
    const filteredTeamSuggestions = useMemo(() => teamSuggestions.filter(s => s.team.name.toLowerCase().includes(searchQuery.toLowerCase())), [teamSuggestions, searchQuery]);

    const handleSelectStaff = (staffMember: StaffMember) => {
        const result: Partial<NewBookingData> = { assignedStaffId: staffMember.id, assignedTeamId: null };
        if (isFormAssistMode && onAvailabilityCheckerSuccess) {
            onAvailabilityCheckerSuccess(result);
        } else if (isDiscoveryMode) {
            onSelectAndBook({ ...result, bookingDate: date, bookingTime: time, packageId });
        }
    };

    const handleSelectTeam = (team: Team) => {
        const result: Partial<NewBookingData> = { assignedTeamId: team.id, assignedStaffId: team.leadMemberId };
         if (isFormAssistMode && onAvailabilityCheckerSuccess) {
            onAvailabilityCheckerSuccess(result);
        } else if (isDiscoveryMode) {
            onSelectAndBook({ ...result, bookingDate: date, bookingTime: time, packageId });
        }
    };
    
    const handleSelectStaffForAssignment = (suggestion: StaffSuggestion) => {
        if (!contextBooking) return;
        if (suggestion.isConflict) setStaffToOverride(suggestion);
        else assignStaff({ bookingId: contextBooking.id, staffId: suggestion.staff.id });
    };

     const handleSelectTeamForAssignment = (suggestion: TeamAvailabilitySuggestion) => {
        if (!contextBooking) return;
        if (suggestion.isConflict) setTeamToOverride(suggestion);
        else assignTeam({ bookingId: contextBooking.id, teamId: suggestion.team.id, leadStaffId: suggestion.team.leadMemberId });
    };
    
    const handleUnassign = () => {
        if (isDirectAssignMode && contextBooking) {
            if (contextBooking.assignedTeamId) {
                assignTeam({ bookingId: contextBooking.id, teamId: null, leadStaffId: null });
            } else {
                assignStaff({ bookingId: contextBooking.id, staffId: null });
            }
        } else if (isFormAssistMode && onAvailabilityCheckerSuccess) {
             onAvailabilityCheckerSuccess({ assignedStaffId: null, assignedTeamId: null });
        }
    };
    
    const handleConfirmStaffOverride = (reason: string) => {
        if (staffToOverride && contextBooking) assignStaff({ bookingId: contextBooking.id, staffId: staffToOverride.staff.id, overrideReason: reason });
        setStaffToOverride(null);
    };

    const handleConfirmTeamOverride = (reason: string) => {
        if (teamToOverride && contextBooking) assignTeam({ bookingId: contextBooking.id, teamId: teamToOverride.team.id, leadStaffId: teamToOverride.team.leadMemberId, overrideReason: reason });
        setTeamToOverride(null);
    };

    const areInputsDisabled = isDirectAssignMode;

    const modalTitle = useMemo(() => {
        if (isDirectAssignMode) return "Manage Assignment";
        if (isDiscoveryMode) return "Create Booking";
        return "Check Availability";
    }, [isDirectAssignMode, isDiscoveryMode]);

    const buttonText = useMemo(() => {
        if (isDiscoveryMode) return "Create Booking";
        if (isDirectAssignMode) return "Assign";
        return "Select";
    }, [isDiscoveryMode, isDirectAssignMode]);
    
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="3xl">
                <div className="space-y-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <NativeDatePicker id="availability-date" label="Date" value={date} onChange={setDate} disabled={areInputsDisabled} />
                            <InputField id="availability-time" label="Time" type="time" value={time} onChange={e => setTime(e.target.value)} disabled={areInputsDisabled} />
                            <Select id="availability-package" label="Package" value={packageId} onChange={setPackageId} options={packageOptions} placeholder="Select a package" disabled={areInputsDisabled} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 mb-4">
                        <button onClick={() => setActiveTab('staff')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'staff' ? 'border-b-2 border-tinedy-blue text-tinedy-blue' : 'text-slate-500 hover:text-slate-700'}`}>Staff</button>
                        <button onClick={() => setActiveTab('teams')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'teams' ? 'border-b-2 border-tinedy-blue text-tinedy-blue' : 'text-slate-500 hover:text-slate-700'}`}>Teams</button>
                    </div>
                    
                    <SearchInput id="availability-search" placeholder={`Filter ${activeTab}...`} value={searchQuery} onChange={setSearchQuery} />
                    
                    <div className="max-h-[50vh] overflow-y-auto pr-2 -mr-4 space-y-3">
                        {activeTab === 'staff' && (staffSuggestionsLoading ? <Loader/> : (
                             filteredStaffSuggestions.map(suggestion => {
                                let isCurrentlyAssigned = false;
                                if (isDirectAssignMode && contextBooking) {
                                    const isDirectlyAssigned = contextBooking.assignedStaffId === suggestion.staff.id && !contextBooking.assignedTeamId;
                                    const isAssignedViaTeam = contextBooking.assignedTeamId 
                                        ? allTeams.find(t => t.id === contextBooking.assignedTeamId)?.members.some(m => m.id === suggestion.staff.id) ?? false
                                        : false;
                                    isCurrentlyAssigned = isDirectlyAssigned || isAssignedViaTeam;
                                }

                                return (
                                    <AvailabilityResultCard 
                                        key={suggestion.staff.id} 
                                        suggestion={suggestion} 
                                        allBookings={allBookings} 
                                        packages={packages}
                                        onSelect={isDirectAssignMode ? () => handleSelectStaffForAssignment(suggestion) : () => handleSelectStaff(suggestion.staff)}
                                        buttonText={buttonText}
                                        date={date} 
                                        isCurrentlyAssigned={isCurrentlyAssigned}
                                    />
                                );
                             })
                        ))}
                         {activeTab === 'teams' && (teamSuggestionsLoading ? <Loader/> : (
                            filteredTeamSuggestions.map(suggestion => (
                                <TeamAvailabilityResultCard 
                                    key={suggestion.team.id} 
                                    suggestion={suggestion}
                                    allBookings={allBookings}
                                    packages={packages}
                                    date={date}
                                    onSelect={isDirectAssignMode ? () => handleSelectTeamForAssignment(suggestion) : () => handleSelectTeam(suggestion.team)}
                                    isCurrentlyAssigned={contextBooking?.assignedTeamId === suggestion.team.id}
                                    onDateChange={setDate}
                                    buttonText={buttonText}
                                />
                            ))
                        ))}
                        {((activeTab === 'staff' && filteredStaffSuggestions.length === 0) || (activeTab === 'teams' && filteredTeamSuggestions.length === 0)) && !staffSuggestionsLoading && !teamSuggestionsLoading && (
                            <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg"><p className="text-sm text-slate-500">No results match your criteria.</p></div>
                        )}
                    </div>

                     <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div>
                            {(isDirectAssignMode && (contextBooking?.assignedStaffId || contextBooking?.assignedTeamId)) || isFormAssistMode ? (
                                <Button variant="danger" onClick={handleUnassign}>Unassign</Button>
                            ) : <div></div>}
                        </div>
                        <Button variant="secondary" onClick={onClose}>Close</Button>
                    </div>
                </div>
            </Modal>
            
            <OverrideConfirmationModal suggestion={staffToOverride} onClose={() => setStaffToOverride(null)} onConfirm={handleConfirmStaffOverride}/>
            <OverrideConfirmationModal suggestion={teamToOverride ? { staff: teamToOverride.conflictingMembers[0], reason: `${teamToOverride.conflictingMembers.length} member(s) have conflicts.` } as any : null} onClose={() => setTeamToOverride(null)} onConfirm={handleConfirmTeamOverride} />
        </>
    );
};

export default GlobalAvailabilityChecker;