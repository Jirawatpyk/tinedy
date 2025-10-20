import React from 'react';
import { TeamAvailabilitySuggestion } from '../../hooks/useTeamAvailability';
import { Booking, BookingStatus, Package } from '../../types';
import { formatTime, calculateEndTime } from '../../lib/utils';
import { CheckCircleIcon, ExclamationTriangleIcon, UserGroupIcon, UserCircleIcon, ClockIcon, CalendarDaysIcon } from '../ui/icons';
import Button from '../ui/Button';
import TeamConflictSuggestions from '../teams/TeamConflictSuggestions';

interface TeamAvailabilityResultCardProps {
    suggestion: TeamAvailabilitySuggestion;
    allBookings: Booking[];
    packages: Package[];
    date: string;
    onSelect: () => void;
    isCurrentlyAssigned?: boolean;
    onDateChange: (date: string) => void;
    buttonText: string;
}

const TeamAvailabilityResultCard: React.FC<TeamAvailabilityResultCardProps> = ({ suggestion, allBookings, packages, date, onSelect, isCurrentlyAssigned, onDateChange, buttonText }) => {
    const { team, isConflict, hasSkillMatch } = suggestion;
    const lead = team.members.find(m => m.id === team.leadMemberId);

    const teamMemberIds = new Set(team.members.map(m => m.id));
    const jobsOnDate = allBookings.filter(b => 
        b.bookingDate === date
        && b.assignedStaffId && teamMemberIds.has(b.assignedStaffId) 
        && b.status !== BookingStatus.Cancelled
    ).sort((a,b) => a.bookingTime.localeCompare(b.bookingTime));

    const jobsToday = jobsOnDate.length;

    const scheduleText = jobsOnDate.length > 0
        ? jobsOnDate.map(job => {
            const pkg = packages.find(p => p.id === job.packageId);
            if (pkg && pkg.duration) {
                const startTime = formatTime(job.bookingTime);
                const endTime = calculateEndTime(job.bookingTime, pkg.duration);
                return `${startTime} - ${endTime}`;
            }
            return formatTime(job.bookingTime);
        }).join(', ')
        : 'Free all day';

    return (
        <div className={`p-4 rounded-lg border ${isConflict ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{team.name}</p>
                    {hasSkillMatch && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-tinedy-green mt-1">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Team Match</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <UserCircleIcon className="w-4 h-4" />
                        <span>Lead: {lead?.name || 'N/A'}</span>
                    </div>
                </div>
                 <div className="text-right">
                    {isConflict ? (
                        <span className="flex items-center justify-end gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            Potential Conflict
                        </span>
                    ) : (
                        <span className="flex items-center justify-end gap-1.5 text-xs font-semibold text-tinedy-green">
                            <CheckCircleIcon className="w-4 h-4" />
                            Available
                        </span>
                    )}
                    <div className="flex items-center justify-end gap-1.5 text-xs mt-1 text-slate-500 dark:text-slate-400">
                        <UserGroupIcon className="w-4 h-4" />
                        <span className="font-medium">{team.members.length} Members</span>
                    </div>
                </div>
            </div>

            <div className="my-3 border-t border-slate-200/80 dark:border-slate-700/60" />

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 text-xs">
                        <ClockIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                        <span className="font-semibold">{jobsToday} job(s) today</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                        <CalendarDaysIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span className="font-medium text-slate-500 dark:text-slate-400 mr-1">Schedule:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{scheduleText}</span>
                    </div>
                </div>

                <div className="flex-shrink-0">
                     {isCurrentlyAssigned ? (
                        <div className="flex items-center justify-center gap-2 font-semibold text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-4 py-2.5 rounded-lg">
                            <CheckCircleIcon className="w-5 h-5" />
                            <span>Assigned</span>
                        </div>
                    ) : (
                        <Button 
                            onClick={onSelect}
                            variant={isConflict ? 'secondary' : 'primary'}
                            className={`font-semibold ${isConflict ? '!border-amber-500 !text-amber-600 hover:!bg-amber-100' : ''}`}
                        >
                            {isConflict ? 'Assign Anyway' : buttonText}
                        </Button>
                    )}
                </div>
            </div>
            
            {isConflict && <TeamConflictSuggestions suggestion={suggestion} onSelectDate={onDateChange} />}
        </div>
    );
};

export default TeamAvailabilityResultCard;