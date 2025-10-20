import React from 'react';
import { StaffMember } from '../../types';
import Modal from '../ui/Modal';
import DetailItem from '../ui/DetailItem';
import { UserCircleIcon, BriefcaseIcon, AtSymbolIcon, PhoneIcon } from '../ui/icons';

interface StaffDetailsModalProps {
    staffMember: StaffMember | null;
    onClose: () => void;
}

const StaffDetailsModal: React.FC<StaffDetailsModalProps> = ({ staffMember, onClose }) => {
    if (!staffMember) return null;

    return (
        <Modal 
            isOpen={!!staffMember} 
            onClose={onClose} 
            title={
                <div className="flex items-center gap-3">
                    <span>Staff Member Details</span>
                    {staffMember.staffNumber && (
                        <span className="text-sm font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-2 py-1 rounded-md">
                            {staffMember.staffNumber}
                        </span>
                    )}
                </div>
            }
        >
            <div className="space-y-6">
                <DetailItem label="Name" icon={<UserCircleIcon className="w-4 h-4" />}>
                    <p className="text-lg font-bold">{staffMember.name}</p>
                </DetailItem>
                
                <DetailItem label="Role" icon={<BriefcaseIcon className="w-4 h-4" />}>
                    <p className="text-base capitalize font-semibold">{staffMember.role}</p>
                </DetailItem>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                    <DetailItem label="Email" icon={<AtSymbolIcon className="w-4 h-4" />}>
                        <p className="text-base">{staffMember.email}</p>
                    </DetailItem>
                    <DetailItem label="Phone" icon={<PhoneIcon className="w-4 h-4" />}>
                        <p className="text-base">{staffMember.phone || 'N/A'}</p>
                    </DetailItem>
                </div>
            </div>
        </Modal>
    );
};

export default StaffDetailsModal;