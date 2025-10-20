import React from 'react';
import { StaffMember } from '../../types';
import { TableRow, TableCell } from '../ui/Table';
import { PencilIcon, TrashIcon, StarIcon } from '../ui/icons';
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu';

interface StaffItemProps {
    member: StaffMember;
    onEdit: (member: StaffMember) => void;
    onDelete: (member: StaffMember) => void;
    onViewDetails: (member: StaffMember) => void;
}

const StaffItem: React.FC<StaffItemProps> = ({ member, onEdit, onDelete, onViewDetails }) => {
    return (
        <TableRow 
            className="group cursor-pointer"
            onClick={() => onViewDetails(member)}
        >
            <TableCell className="basis-3/12">
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{member.name}</p>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                            {member.staffNumber}
                        </span>
                    </div>
                     {/* Mobile only content */}
                    <div className="md:hidden mt-1">
                        <p className="text-sm text-slate-700 dark:text-slate-200">{member.email}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{member.phone || 'No phone number'}</p>
                    </div>
                    {/* Desktop-only skills */}
                     {member.skills && member.skills.length > 0 && (
                        <div className="hidden md:flex flex-wrap gap-1 mt-1">
                            {member.skills.slice(0, 2).map(skill => (
                                <span key={skill} className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-full">{skill}</span>
                            ))}
                        </div>
                    )}
                </div>
            </TableCell>
            <TableCell className="basis-3/12 hidden md:block">
                <div>
                    <p className="text-sm text-slate-700">{member.email}</p>
                    <p className="text-xs text-slate-500">{member.phone || 'No phone number'}</p>
                </div>
            </TableCell>
            <TableCell className="basis-2/12 hidden lg:block">
                <span className="text-sm capitalize text-slate-600 font-medium">{member.role}</span>
            </TableCell>
            <TableCell className="basis-2/12 hidden lg:block">
                {member.rating !== null && typeof member.rating !== 'undefined' ? (
                    <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                        <StarIcon className="w-4 h-4" />
                        <span>{member.rating.toFixed(1)}</span>
                    </div>
                ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">N/A</span>
                )}
            </TableCell>
            <TableCell 
                className="basis-[120px] justify-end flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
            >
                 <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuItem onClick={() => onEdit(member)}>
                            <PencilIcon className="w-4 h-4" /> Edit Member
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(member)} className="text-red-600">
                            <TrashIcon className="w-4 h-4" /> Delete Member
                        </DropdownMenuItem>
                    </DropdownMenu>
                </div>
            </TableCell>
        </TableRow>
    );
};

export default StaffItem;