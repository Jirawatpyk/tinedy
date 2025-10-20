import React from 'react';
import { Team, TeamStatus } from '../../types';
import { TableRow, TableCell } from '../ui/Table';
import { PencilIcon, TrashIcon } from '../ui/icons';
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu';

interface TeamItemProps {
    team: Team;
    onEdit: (team: Team) => void;
    onDelete: (team: Team) => void;
    onViewDetails: (team: Team) => void;
}

const StatusBadge: React.FC<{ status: TeamStatus }> = ({ status }) => {
    const config = {
        'Active': { label: 'Active', color: 'bg-tinedy-green/20 text-tinedy-green' },
        'Inactive': { label: 'Inactive', color: 'bg-slate-100 text-slate-600' }
    };
    const { label, color } = config[status];
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
}

const TeamItem: React.FC<TeamItemProps> = ({ team, onEdit, onDelete, onViewDetails }) => {
    const lead = team.members.find(m => m.id === team.leadMemberId);

    return (
        <TableRow 
            className="group cursor-pointer"
            onClick={() => onViewDetails(team)}
        >
            <TableCell className="basis-4/12">
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{team.name}</p>
                    <p className="text-xs text-slate-500 truncate md:hidden">{team.members.length} members</p>
                </div>
            </TableCell>
            <TableCell className="basis-2/12 hidden md:block">
                <span className="text-sm text-slate-600 dark:text-slate-300">{lead?.name || 'N/A'}</span>
            </TableCell>
            <TableCell className="basis-2/12 hidden lg:block">
                <span className="text-sm text-slate-600 dark:text-slate-300">{team.members.length}</span>
            </TableCell>
            <TableCell className="basis-2/12 hidden lg:block">
                <StatusBadge status={team.status} />
            </TableCell>
            <TableCell 
                className="basis-[120px] justify-end flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
            >
                 <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuItem onClick={() => onEdit(team)}>
                            <PencilIcon className="w-4 h-4" /> Edit Team
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(team)} className="text-red-600">
                            <TrashIcon className="w-4 h-4" /> Delete Team
                        </DropdownMenuItem>
                    </DropdownMenu>
                </div>
            </TableCell>
        </TableRow>
    );
};

export default TeamItem;
