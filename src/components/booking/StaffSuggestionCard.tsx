import React from 'react';
import { StaffSuggestion } from '../../hooks/useStaffSuggestions';
import { UserCircleIcon, StarIcon, ClockIcon, MapPinIcon } from '../ui/icons';

interface StaffSuggestionCardProps {
    suggestion: StaffSuggestion;
    isSelected: boolean;
    onSelect: () => void;
}

const StaffSuggestionCard: React.FC<StaffSuggestionCardProps> = ({ suggestion, isSelected, onSelect }) => {
    const { staff, reason, reasonType, jobsToday, travelTime } = suggestion;

    const getReasonColor = () => {
        switch (reasonType) {
            case 'positive': return 'text-tinedy-green';
            case 'warning': return 'text-amber-600 dark:text-amber-400';
            case 'neutral':
            default:
                return 'text-slate-600 dark:text-slate-400';
        }
    };

    return (
        <button
            onClick={onSelect}
            className={`w-full text-left p-3 border rounded-lg transition-colors duration-200 ${isSelected ? 'bg-slate-100 dark:bg-slate-700/50 border-slate-400 dark:border-slate-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{staff.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{staff.role}</p>
                </div>
                <p className={`text-sm font-semibold ${getReasonColor()}`}>{reason}</p>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 dark:text-slate-300">
                {staff.rating !== null && (
                    <div className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                        <StarIcon className="w-3 h-3" />
                        <span>{staff.rating.toFixed(1)}</span>
                    </div>
                )}
                 <div className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{jobsToday} job(s) today</span>
                </div>
                {travelTime && (
                    <div className="flex items-center gap-1">
                        <MapPinIcon className="w-3 h-3" />
                        <span>~{travelTime} min travel</span>
                    </div>
                )}
            </div>
        </button>
    );
};

export default StaffSuggestionCard;