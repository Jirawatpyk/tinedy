import React from 'react';
import { CustomerRelationship } from '../../types';
import Button from '../ui/Button';
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu';
import { StarIcon, TrashIcon } from '../ui/icons';

interface CustomerBulkActionsProps {
    selectedCount: number;
    onDelete: () => void;
    onUpdateRelationship: (relationship: CustomerRelationship) => void;
}

const CustomerBulkActions: React.FC<CustomerBulkActionsProps> = ({ selectedCount, onDelete, onUpdateRelationship }) => {
    const relationshipOptions = Object.values(CustomerRelationship).map(r => ({value: r, label: `Set to ${r}`}));

    return (
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4 flex justify-between items-center animate-fade-in-up">
            <p className="font-semibold text-slate-700 dark:text-slate-200">{selectedCount} customer{selectedCount > 1 ? 's' : ''} selected</p>
            <div className="flex items-center gap-2">
                <DropdownMenu trigger={<Button variant="secondary"><StarIcon className="w-4 h-4 mr-2"/> Change Relationship</Button>}>
                    {relationshipOptions.map(opt => (
                        <DropdownMenuItem key={opt.value} onClick={() => onUpdateRelationship(opt.value as CustomerRelationship)}>{opt.label}</DropdownMenuItem>
                    ))}
                </DropdownMenu>
                <Button onClick={onDelete} variant="danger">
                    <TrashIcon className="w-4 h-4 mr-2" /> Archive
                </Button>
            </div>
        </div>
    );
};

export default CustomerBulkActions;