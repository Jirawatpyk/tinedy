import React from 'react';
import { TeamAvailabilitySuggestion } from '../../hooks/useTeamAvailability';
import { CalendarDaysIcon, UserPlusIcon, ExclamationTriangleIcon } from '../ui/icons';
import Button from '../ui/Button';
import { formatDate } from '../../lib/utils';

interface TeamConflictSuggestionsProps {
    suggestion: TeamAvailabilitySuggestion;
    onSelectDate: (date: string) => void;
}

const TeamConflictSuggestions: React.FC<TeamConflictSuggestionsProps> = ({ suggestion, onSelectDate }) => {
    const { isFullyBooked, conflictingMembers, replacementSuggestions, alternativeDates } = suggestion;

    return (
        <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800 space-y-3">
            {isFullyBooked && alternativeDates.length > 0 && (
                <div>
                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-2">
                        <CalendarDaysIcon className="w-4 h-4" />
                        Alternative Dates
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {alternativeDates.map(date => (
                            <Button
                                key={date}
                                variant="secondary"
                                onClick={() => onSelectDate(date)}
                                className="text-xs font-semibold !py-1 !px-2.5"
                            >
                                {formatDate(date, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
            {!isFullyBooked && (
                <>
                    {conflictingMembers.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-1">
                                <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                                Unavailable Members
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">
                                {conflictingMembers.map(m => m.name).join(', ')}
                            </p>
                        </div>
                    )}
                    {replacementSuggestions.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-1">
                                <UserPlusIcon className="w-4 h-4" />
                                Suggested Replacements
                            </h4>
                             <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">
                                Consider temporarily swapping with: {replacementSuggestions.map(s => s.name).join(', ')}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TeamConflictSuggestions;
