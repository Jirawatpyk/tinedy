import React from 'react';
import { Package } from '../../types';
import { SERVICES } from '../../constants';
import { TableRow, TableCell } from '../ui/Table';
import { PencilIcon, TrashIcon, ListBulletIcon } from '../ui/icons';
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu';

interface PackageItemProps {
    pkg: Package;
    onEdit: (pkg: Package) => void;
    onDelete: (pkg: Package) => void;
    onViewDetails: (pkg: Package) => void;
}

const PackageItem: React.FC<PackageItemProps> = ({ pkg, onEdit, onDelete, onViewDetails }) => {
    const serviceLabels = pkg.services
        .map(serviceValue => SERVICES.find(s => s.value === serviceValue)?.label)
        .filter(Boolean)
        .join(', ');

    return (
        <TableRow 
            className="group cursor-pointer"
            onClick={() => onViewDetails(pkg)}
        >
            <TableCell className="basis-4/12">
                <div>
                    <p className="font-semibold text-slate-800">{pkg.name}</p>
                    <p className="text-xs text-slate-500 truncate">{pkg.description || 'No description'}</p>
                </div>
            </TableCell>
            <TableCell className="basis-4/12 hidden md:block">
                <p className="text-sm text-slate-600">{serviceLabels}</p>
            </TableCell>
            <TableCell className="basis-2/12 hidden lg:block">
                <div>
                    <p className="text-sm font-semibold text-slate-700">฿{pkg.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-slate-500">{pkg.duration} minutes</p>
                </div>
            </TableCell>
            <TableCell 
                className="basis-[120px] justify-end flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuItem onClick={() => onEdit(pkg)}>
                            <PencilIcon className="w-4 h-4" /> Edit Package
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(pkg)} className="text-red-600">
                            <TrashIcon className="w-4 h-4" /> Delete Package
                        </DropdownMenuItem>
                    </DropdownMenu>
                </div>
            </TableCell>
        </TableRow>
    );
};

export default PackageItem;
