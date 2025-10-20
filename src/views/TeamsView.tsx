import React from 'react';
import { Team, ToastType } from '../../types';
import TeamsPage from '../components/teams/TeamsPage';
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam } from '../hooks/useTeams';
import { useCrudModals } from '../hooks/useCrudModals';
import { useUiStore } from '../store/uiStore';
import TeamDetailsModal from '../components/teams/TeamDetailsModal';
import { useTeamPerformance } from '../hooks/useTeamPerformance';
import { useBookingStore } from '../store/bookingStore';
import { usePackageStore } from '../store/packageStore';

interface TeamsViewProps {
    addToast: (message: string, type: ToastType, title: string) => void;
}

const TeamsView: React.FC<TeamsViewProps> = ({ addToast }) => {
    const { data: teams = [] } = useTeams();
    const { viewingItem, handleOpenViewModal, handleCloseModals } = useCrudModals<Team>();
    const { closeAllModals } = useUiStore();
    
    const bookings = useBookingStore(state => state.bookings);
    const packages = usePackageStore(state => state.packages);
    const performanceData = useTeamPerformance(bookings, packages, teams);
    const performanceDataMap = new Map(performanceData.map(d => [d.teamId, d]));

    const { mutate: createTeam } = useCreateTeam({
        onSuccess: (newTeam) => {
            addToast(`Team "${newTeam.name}" created successfully.`, 'success', 'Team Added');
            closeAllModals();
        },
        onError: (error) => addToast(error.message, 'error', 'Error'),
    });

    const { mutate: updateTeam } = useUpdateTeam({
        onSuccess: (updatedTeam) => addToast(`Team "${updatedTeam.name}" updated successfully.`, 'success', 'Team Updated'),
        onError: (error) => addToast(error.message, 'error', 'Error'),
    });
    
    const { mutate: deleteTeam } = useDeleteTeam({
        onSuccess: (deletedTeam) => addToast(`Team "${deletedTeam.name}" deleted.`, 'success', 'Team Deleted'),
        onError: (error) => addToast(error.message, 'error', 'Error'),
    });

    const handleDelete = (id: string) => {
        const teamToDelete = teams.find(t => t.id === id);
        if (teamToDelete) {
            deleteTeam(teamToDelete);
        }
    };

    return (
        <>
            <TeamsPage
                teams={teams}
                onAddTeam={createTeam}
                onUpdateTeam={updateTeam}
                onDeleteTeam={handleDelete}
                onViewDetails={handleOpenViewModal}
            />
            <TeamDetailsModal 
                team={viewingItem} 
                performanceData={viewingItem ? performanceDataMap.get(viewingItem.id) : undefined}
                onClose={handleCloseModals} 
            />
        </>
    );
};

export default TeamsView;