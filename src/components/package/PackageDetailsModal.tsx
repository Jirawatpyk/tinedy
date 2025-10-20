import React from 'react';
import { Package } from '../../types';
import Modal from '../ui/Modal';
import { SERVICES } from '../../constants';
import DetailItem from '../ui/DetailItem';
import { ArchiveBoxIcon, CurrencyDollarIcon, ClockIcon, CogIcon } from '../ui/icons';

interface PackageDetailsModalProps {
    pkg: Package | null;
    onClose: () => void;
}

const PackageDetailsModal: React.FC<PackageDetailsModalProps> = ({ pkg, onClose }) => {
    if (!pkg) return null;

    const serviceLabels = pkg.services
        .map(serviceValue => SERVICES.find(s => s.value === serviceValue)?.label)
        .filter(Boolean)
        .join(', ');

    return (
        <Modal isOpen={!!pkg} onClose={onClose} title="Package Details">
             <div className="space-y-6">
                <DetailItem label="Package Name" icon={<ArchiveBoxIcon className="w-4 h-4" />}>
                    <p className="text-lg font-bold">{pkg.name}</p>
                </DetailItem>
                
                {pkg.description && (
                    <DetailItem label="Description">
                        <p className="text-sm leading-relaxed">{pkg.description}</p>
                    </DetailItem>
                )}
                
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <DetailItem label="Price" icon={<CurrencyDollarIcon className="w-4 h-4" />}>
                        <p className="text-base font-semibold">฿{pkg.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </DetailItem>
                    <DetailItem label="Duration" icon={<ClockIcon className="w-4 h-4" />}>
                        <p className="text-base font-semibold">{pkg.duration} minutes</p>
                    </DetailItem>
                </div>
                
                <DetailItem label="Included Services" icon={<CogIcon className="w-4 h-4" />}>
                    <p className="text-sm">{serviceLabels}</p>
                </DetailItem>
            </div>
        </Modal>
    );
};

export default PackageDetailsModal;