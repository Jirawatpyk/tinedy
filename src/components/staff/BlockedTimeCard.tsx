import React from 'react';
import { StaffUnavailability } from '../../types';
import { LockClosedIcon, PencilIcon, TrashIcon, ArrowPathIcon } from '../ui/icons';

interface BlockedTimeCardProps {
    item: StaffUnavailability;
    onEdit: (item: StaffUnavailability) => void;
    onDelete: (id: string) => void;
}

const formatTimeForDisplay = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
};

const BlockedTimeCard: React.FC<BlockedTimeCardProps> = ({ item, onEdit, onDelete }) => {
    
    const timeDisplay = item.allDay 
        ? "ตลอดวัน"
        : `${formatTimeForDisplay(item.startTime)} - ${formatTimeForDisplay(item.endTime)}`;

    return (
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4 flex items-center gap-4 group">
            <div className="flex-shrink-0 bg-slate-200 dark:bg-slate-700 p-3 rounded-full">
                <LockClosedIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 dark:text-slate-100 font-rule">{item.reason}</p>
                    {item.recurrenceRule && (
                        <span title="รายการนี้เกิดซ้ำ">
                            <ArrowPathIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </span>
                    )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-rule">{timeDisplay}</p>
                {item.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate font-rule">บันทึก: {item.notes}</p>}
            </div>
            <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(item)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="แก้ไข">
                    <PencilIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
                <button onClick={() => onDelete(item.id)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="ลบ">
                    <TrashIcon className="w-5 h-5 text-red-500" />
                </button>
            </div>
        </div>
    );
};

export default BlockedTimeCard;