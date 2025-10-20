import React, { useMemo } from 'react';
import { StaffSuggestion } from '../../hooks/useStaffSuggestions';
import { Booking, BookingStatus, Package } from '../../types';
import { formatTime, calculateEndTime } from '../../lib/utils';
import { CheckCircleIcon, ExclamationTriangleIcon, BoltIcon, CalendarDaysIcon, StarIcon, ClockIcon } from '../ui/icons';
import Button from '../ui/Button';
import { useTeamStore } from '../../store/teamStore';

interface AvailabilityResultCardProps {
    suggestion: StaffSuggestion;
    allBookings: Booking[];
    packages: Package[];
    onSelect: () => void;
    buttonText: string;
    date: string;
    isCurrentlyAssigned?: boolean;
}

const AvailabilityResultCard: React.FC<AvailabilityResultCardProps> = ({ suggestion, allBookings, packages, onSelect, buttonText, date, isCurrentlyAssigned = false }) => {
    const { staffMember, isConflict, hasSkillMatch } = {
        staffMember: suggestion.staff,
        isConflict: suggestion.isConflict,
        hasSkillMatch: suggestion.hasSkillMatch,
    };
    
    const allTeams = useTeamStore(state => state.teams);

    const { jobsToday, scheduleText } = useMemo(() => {
        const staffTeamIds = allTeams
            .filter(team => team.members.some(member => member.id === staffMember.id))
            .map(team => team.id);

        const jobsOnDate = allBookings.filter(b => 
            b.bookingDate === date &&
            b.status !== BookingStatus.Cancelled &&
            (b.assignedStaffId === staffMember.id || (b.assignedTeamId && staffTeamIds.includes(b.assignedTeamId)))
        ).sort((a,b) => a.bookingTime.localeCompare(b.bookingTime));

        const jobsCount = jobsOnDate.length;
        
        const schedule = jobsOnDate.length > 0
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
        
        return { jobsToday: jobsCount, scheduleText: schedule };
    }, [date, staffMember, allBookings, allTeams, packages]);


    const AvailabilityStatus = () => (
        !isConflict ? (
            <span className="flex items-center justify-end gap-1.5 text-xs font-semibold text-tinedy-green">
                <CheckCircleIcon className="w-4 h-4" />
                Available
            </span>
        ) : (
            <span className="flex items-center justify-end gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <ExclamationTriangleIcon className="w-4 h-4" />
                Potential Conflict
            </span>
        )
    );

    return (
        <div className={`p-4 rounded-lg border ${isConflict && !isCurrentlyAssigned ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
            {/* Top Section: Name, Skill Match, Availability */}
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{staffMember.name}</p>
                    {hasSkillMatch && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-tinedy-green mt-1">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Skill Match</span>
                        </div>
                    )}
                </div>
                {!isCurrentlyAssigned && <AvailabilityStatus />}
            </div>

            {/* Separator */}
            <div className="my-3 border-t border-slate-200/80 dark:border-slate-700/60" />

            {/* Bottom Section: Details and Action Button */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                {/* Details (2 rows) */}
                <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    {/* Row 1 */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        {staffMember.rating != null && (
                            <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                                <StarIcon className="w-4 h-4" />
                                <span>{staffMember.rating.toFixed(1)} Rating</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                            <ClockIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <span>{jobsToday} job(s) today</span>
                        </div>
                    </div>
                    {/* Row 2 */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <div className="flex items-center gap-1.5">
                            <BoltIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                            <span className="font-medium text-slate-500 dark:text-slate-400 mr-1">Skills:</span>
                            {staffMember.skills?.length > 0 
                                ? <span className="font-semibold text-slate-700 dark:text-slate-200">{staffMember.skills.join(', ')}</span> 
                                : <span className="italic text-slate-500 dark:text-slate-400">Not listed</span>
                            }
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CalendarDaysIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <span className="font-medium text-slate-500 dark:text-slate-400 mr-1">Schedule:</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{scheduleText}</span>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
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
                            {isConflict ? (
                                <>
                                    <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                                    <span>Assign Anyway</span>
                                </>
                            ) : (
                                <span>{buttonText}</span>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AvailabilityResultCard;