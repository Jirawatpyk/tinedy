import React from 'react';
import { Team, TeamPerformanceData } from '../../types';
import Modal from '../ui/Modal';
import DetailItem from '../ui/DetailItem';
import { UserGroupIcon, UserCircleIcon, BriefcaseIcon } from '../ui/icons';
import TeamPerformanceMetrics from './TeamPerformanceMetrics';

interface TeamDetailsModalProps {
    team: Team | null;
    performanceData: TeamPerformanceData | undefined;
    onClose: () => void;
}

const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({ team, performanceData, onClose }) => {
    if (!team) return null;
    
    const lead = team.members.find(m => m.id === team.leadMemberId);

    return (
        <Modal isOpen={!!team} onClose={onClose} title="Team Details" size="2xl">
            <div className="space-y-6">
                <DetailItem label="Team Name" icon={<UserGroupIcon className="w-4 h-4" />}>
                    <p className="text-xl font-bold">{team.name}</p>
                </DetailItem>
                
                {team.description && (
                    <DetailItem label="Description">
                        <p className="text-sm leading-relaxed">{team.description}</p>
                    </DetailItem>
                )}

                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                    <TeamPerformanceMetrics data={performanceData} />
                </div>
                
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                    <DetailItem label="Team Lead" icon={<UserCircleIcon className="w-4 h-4" />}>
                        <p className="text-base font-semibold">{lead?.name || 'Not assigned'}</p>
                    </DetailItem>
                </div>
                
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                       <BriefcaseIcon className="w-4 h-4" />
                       <span>Members ({team.members.length})</span>
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {team.members.map(member => (
                            <div key={member.id} className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{member.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default TeamDetailsModal;