import React from 'react';
import { CustomerRelationship } from '../../types';
import { CustomerWithStats } from '../../views/CustomersView';
import { TableRow, TableCell } from '../ui/Table';
import { PencilIcon, TrashIcon, ListBulletIcon, StarIcon } from '../ui/icons';
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu';
import Checkbox from '../ui/Checkbox';
import { RELATIONSHIP_CONFIG } from '../../constants';
import { formatDate } from '../../lib/utils';
import Tag from './Tag';

interface CustomerItemProps {
    customer: CustomerWithStats;
    onEdit: (customer: CustomerWithStats) => void;
    onDelete: (customer: CustomerWithStats) => void;
    onViewDetails: (customer: CustomerWithStats) => void;
    isSelected: boolean;
    onSelect: (customerId: string) => void;
}

const CustomerItem: React.FC<CustomerItemProps> = ({ customer, onEdit, onDelete, onViewDetails, isSelected, onSelect }) => {
    const relationshipConfig = RELATIONSHIP_CONFIG[customer.relationship];
    const tagsToShow = customer.tags?.slice(0, 3) || [];
    const remainingTags = customer.tags ? customer.tags.length - tagsToShow.length : 0;

    const renderDropdown = () => (
        <DropdownMenu>
            <DropdownMenuItem onClick={() => onEdit(customer)}>
                <PencilIcon className="w-4 h-4" /> Edit Customer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(customer)} className="text-red-600">
                <TrashIcon className="w-4 h-4" /> Archive Customer
            </DropdownMenuItem>
        </DropdownMenu>
    );
    
    return (
        <TableRow 
            className={`group even:bg-transparent dark:even:bg-slate-800/50 cursor-pointer ${isSelected ? 'bg-tinedy-blue/10 dark:bg-tinedy-blue/20' : ''}`}
            onClick={() => onViewDetails(customer)}
        >
            <TableCell 
                className="flex-none w-16"
                onClick={(e) => e.stopPropagation()}
            >
                <Checkbox
                  checked={isSelected}
                  onChange={() => onSelect(customer.id)}
                  aria-label={`Select customer ${customer.name}`}
                />
            </TableCell>

            {/* MAIN INFO CELL (RESPONSIVE) */}
            <TableCell className="flex-1 md:basis-4/12 min-w-0">
                {/* Mobile View Content (inside the cell) */}
                <div className="md:hidden space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{customer.name}</p>
                        {relationshipConfig && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${relationshipConfig.color}`}>
                                <StarIcon className="w-3 h-3 mr-1" />
                                {relationshipConfig.label}
                            </span>
                        )}
                        {/* Tags for mobile view */}
                        {customer.tags && customer.tags.length > 0 && (
                            tagsToShow.map(tag => (
                                <Tag key={tag.id} text={tag.name} />
                            ))
                        )}
                        {remainingTags > 0 && (
                            <span className="text-xs font-semibold text-slate-400 self-center">+ {remainingTags} more</span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{customer.email}</p>
                    <div className="flex items-center flex-wrap gap-x-4 text-xs text-slate-600 dark:text-slate-300 pt-0.5">
                        
                        {/* Making the date format more compact for mobile */}
                        <span>Last: <strong>{formatDate(customer.lastBookingDate?.toISOString() || '', { month: 'short', day: 'numeric' })}</strong></span>
                    </div>
                </div>
                {/* Desktop View Content (inside the cell) */}
                <div className="hidden md:block">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{customer.name}</p>
                        {customer.tags && customer.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {tagsToShow.map(tag => (
                                    <Tag key={tag.id} text={tag.name} />
                                ))}
                                {remainingTags > 0 && (
                                    <span className="text-xs font-semibold text-slate-400 self-center">+ {remainingTags} more</span>
                                )}
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{customer.email}</p>
                </div>
            </TableCell>
            
            {/* DESKTOP-ONLY DATA CELLS */}
            <TableCell className="basis-3/12 hidden md:block grow-0">
                {relationshipConfig && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${relationshipConfig.color}`}>
                        <StarIcon className="w-3 h-3 mr-1.5" />
                        {relationshipConfig.label}
                    </span>
                )}
            </TableCell>
            <TableCell className="basis-3/12 hidden lg:block grow-0">
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">฿{customer.lifetimeValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{customer.totalBookings} {customer.totalBookings === 1 ? 'booking' : 'bookings'}</p>
                </div>
            </TableCell>
            <TableCell className="basis-2/12 hidden lg:block grow-0">
                {customer.lastBookingDate ?
                    <p className="text-sm text-slate-600 dark:text-slate-300">{formatDate(customer.lastBookingDate.toISOString())}</p>
                    : <p className="text-sm text-slate-500 dark:text-slate-400">N/A</p>
                }
            </TableCell>

            {/* ACTIONS CELL (ALWAYS VISIBLE) */}
            <TableCell 
                className="basis-[120px] flex-shrink-0 justify-end grow-0"
                onClick={(e) => e.stopPropagation()}
            >
                 <div className="flex justify-end opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    {renderDropdown()}
                </div>
            </TableCell>
        </TableRow>
    );
};

export default CustomerItem;