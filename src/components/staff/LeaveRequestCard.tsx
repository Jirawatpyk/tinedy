import React, { useState } from 'react';
import { LeaveRequest, LeaveStatus } from '../../types';
import { CalendarDaysIcon, TrashIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '../ui/icons';
import ConfirmationModal from '../ui/ConfirmationModal';

interface LeaveRequestCardProps {
    item: LeaveRequest;
    onCancel: (id: string) => void;
}

const formatLeaveDate = (isoDate: string) => {
    return new Date(isoDate + 'T00:00:00').toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

const StatusInfo: React.FC<{ status: LeaveStatus }> = ({ status }) => {
    switch (status) {
        case LeaveStatus.Approved:
            return <span className="flex items-center gap-1.5 text-xs font-semibold text-tinedy-green"><CheckCircleIcon className="w-4 h-4" />อนุมัติ</span>;
        case LeaveStatus.Rejected:
            return <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500"><XCircleIcon className="w-4 h-4" />ไม่อนุมัติ</span>;
        case LeaveStatus.Pending:
        default:
            return <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600"><ClockIcon className="w-4 h-4" />รออนุมัติ</span>;
    }
};

const LeaveRequestCard: React.FC<LeaveRequestCardProps> = ({ item, onCancel }) => {
    const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
    
    const dateDisplay = item.startDate === item.endDate
        ? formatLeaveDate(item.startDate)
        : `${formatLeaveDate(item.startDate)} - ${formatLeaveDate(item.endDate)}`;

    return (
        <>
            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4 flex items-center gap-4 group">
                <div className="flex-shrink-0 bg-slate-200 dark:bg-slate-700 p-3 rounded-full">
                    <CalendarDaysIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100 font-rule">{item.leaveType}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300 font-rule">{dateDisplay}</p>
                        </div>
                        <StatusInfo status={item.status} />
                    </div>
                    {item.reason && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate font-rule">เหตุผล: {item.reason}</p>}
                </div>
                {item.status === LeaveStatus.Pending && (
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setIsConfirmingCancel(true)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="ยกเลิกใบลา">
                            <TrashIcon className="w-5 h-5 text-red-500" />
                        </button>
                    </div>
                )}
            </div>
            
            <ConfirmationModal
                isOpen={isConfirmingCancel}
                onClose={() => setIsConfirmingCancel(false)}
                onConfirm={() => {
                    onCancel(item.id);
                    setIsConfirmingCancel(false);
                }}
                title="ยืนยันการยกเลิก"
                message={<p>คุณแน่ใจหรือไม่ว่าต้องการยกเลิกใบลาสำหรับวันที่ <strong>{dateDisplay}</strong>?</p>}
                confirmButtonText="ใช่, ยกเลิก"
                confirmButtonVariant="danger"
            />
        </>
    );
};

export default LeaveRequestCard;