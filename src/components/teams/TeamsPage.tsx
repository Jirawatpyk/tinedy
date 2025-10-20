import React, { useState, useMemo } from 'react';
import { Team } from '../../types';
import { UserGroupIcon, PlusIcon } from '../ui/icons';
import Modal from '../ui/Modal';
import ConfirmationModal from '../ui/ConfirmationModal';
import TeamForm from './TeamForm';
import TeamItem from './TeamItem';
import Button from '../ui/Button';
import { Table, TableHeaderCell } from '../ui/Table';
import { useUiStore } from '../../store/uiStore';
import { useCrudModals } from '../../hooks/useCrudModals';
import SearchInput from '../ui/SearchInput';
import Card from '../ui/Card';
import { useStaffStore } from '../../store/staffStore';

interface TeamsPageProps {
  teams: Team[];
  onAddTeam: (teamData: any) => void;
  onUpdateTeam: (teamData: Team) => void;
  onDeleteTeam: (id: string) => void;
  onViewDetails: (team: Team) => void;
}

const TeamsPage: React.FC<TeamsPageProps> = ({ teams, onAddTeam, onUpdateTeam, onDeleteTeam, onViewDetails }) => {
  const { isAddTeamModalOpen, openAddTeamModal, closeAllModals } = useUiStore();
  const [searchQuery, setSearchQuery] = useState('');

  const { editingItem: editingTeam, deletingItem: deletingTeam, handleOpenEditModal, handleOpenDeleteModal, handleCloseModals } = useCrudModals<Team>();
  const staff = useStaffStore(state => state.staff);

  const filteredTeams = useMemo(() => {
    const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));
    if (!searchQuery) return sortedTeams;
    return sortedTeams.filter(team => 
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [teams, searchQuery]);

  const handleSubmit = (teamData: any) => {
    if (editingTeam) {
      onUpdateTeam(teamData as Team);
      handleCloseModals();
    } else {
      onAddTeam(teamData);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingTeam) {
      onDeleteTeam(deletingTeam.id);
      handleCloseModals();
    }
  };
  
  const isFormModalOpen = isAddTeamModalOpen || !!editingTeam;
  const formModalTitle = editingTeam ? "Edit Team" : "Create New Team";

  return (
    <>
      <Card>
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                  <div className="bg-tinedy-blue/20 p-2 rounded-lg">
                     <UserGroupIcon className="w-6 h-6 text-tinedy-blue"/>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Teams</h2>
              </div>
              <div className="flex items-center gap-4">
                  <div className="w-full sm:w-auto sm:max-w-xs">
                      <SearchInput
                          placeholder="Search by name..."
                          value={searchQuery}
                          onChange={setSearchQuery}
                      />
                  </div>
                  <Button onClick={openAddTeamModal}>
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Team
                  </Button>
              </div>
          </div>
          
          <Table aria-label="Teams List">
              <Table.Header>
                  <TableHeaderCell className="basis-4/12">Team Name</TableHeaderCell>
                  <TableHeaderCell className="basis-2/12 hidden md:block">Team Lead</TableHeaderCell>
                  <TableHeaderCell className="basis-2/12 hidden lg:block">Members</TableHeaderCell>
                  <TableHeaderCell className="basis-2/12 hidden lg:block">Status</TableHeaderCell>
                  <TableHeaderCell className="basis-[120px] text-right">Actions</TableHeaderCell>
              </Table.Header>
              <Table.Body>
                  {filteredTeams.map(team => (
                      <TeamItem
                          key={team.id}
                          team={team}
                          onViewDetails={onViewDetails}
                          onEdit={handleOpenEditModal}
                          onDelete={handleOpenDeleteModal}
                      />
                  ))}
              </Table.Body>
          </Table>
          
          {filteredTeams.length === 0 && (
              <Table.EmptyState
                  icon={UserGroupIcon}
                  title={searchQuery ? `No teams found for "${searchQuery}"` : "No teams yet"}
                  message={searchQuery ? "Try a different search term." : "Get started by creating your first team."}
                  action={!searchQuery ? <Button onClick={openAddTeamModal}><PlusIcon className="w-5 h-5 mr-2" />Add Team</Button> : null}
              />
          )}
      </Card>
      
      <Modal isOpen={isFormModalOpen} onClose={editingTeam ? handleCloseModals : closeAllModals} title={formModalTitle} size="lg">
        <TeamForm 
            initialData={editingTeam} 
            onSubmit={handleSubmit} 
            onClose={editingTeam ? handleCloseModals : closeAllModals} 
            allStaff={staff} 
            allTeams={teams} 
        />
      </Modal>

      {deletingTeam && (
         <ConfirmationModal
            isOpen={!!deletingTeam}
            onClose={handleCloseModals}
            onConfirm={handleDeleteConfirm}
            title="Delete Team"
            message={<p>Are you sure you want to delete <strong>{deletingTeam.name}</strong>? This action cannot be undone.</p>}
            confirmButtonText="Delete"
            confirmButtonVariant="danger"
         />
      )}
    </>
  );
};

export default TeamsPage;
