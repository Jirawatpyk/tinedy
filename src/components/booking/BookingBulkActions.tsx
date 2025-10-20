import React from 'react';
import { BookingStatus, StaffMember } from '../../types';
import Button from '../ui/Button';
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu';
import { ClipboardDocumentCheckIcon, UserIcon, TrashIcon } from '../ui/icons';

interface BookingBulkActionsProps {
    selectedCount: number;
    staff: StaffMember[];
    onDelete: () => void;
    onUpdateStatus: (status: BookingStatus) => void;
    onAssignStaff: (staffId: string | null) => void;
}

const BookingBulkActions: React.FC<BookingBulkActionsProps> = ({ selectedCount, staff, onDelete, onUpdateStatus, onAssignStaff }) => {
    const statusOptions = Object.values(BookingStatus).map(s => ({value: s, label: `Set to ${s}`}));
    const staffOptions = [{value: 'unassigned', label: 'Unassign Staff'}, ...staff.map(s => ({value: s.id, label: `Assign ${s.name}`}))];
    
    return (
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4 flex justify-between items-center animate-fade-in-up">
            <p className="font-semibold text-slate-700 dark:text-slate-200">{selectedCount} booking{selectedCount > 1 ? 's' : ''} selected</p>
            <div className="flex items-center gap-2">
                <DropdownMenu trigger={<Button variant="secondary"><ClipboardDocumentCheckIcon className="w-4 h-4 mr-2"/> Change Status</Button>}>
                    {statusOptions.map(opt => (
                        <DropdownMenuItem key={opt.value} onClick={() => onUpdateStatus(opt.value as BookingStatus)}>{opt.label}</DropdownMenuItem>
                    ))}
                </DropdownMenu>
                 <DropdownMenu trigger={<Button variant="secondary"><UserIcon className="w-4 h-4 mr-2"/> Assign Staff</Button>}>
                    {staffOptions.map(opt => (
                        <DropdownMenuItem key={opt.value} onClick={() => onAssignStaff(opt.value === 'unassigned' ? null : opt.value)}>{opt.label}</DropdownMenuItem>
                    ))}
                </DropdownMenu>
                <Button onClick={onDelete} variant="danger">
                    <TrashIcon className="w-4 h-4 mr-2" /> Delete
                </Button>
            </div>
        </div>
    );
};

export default BookingBulkActions;