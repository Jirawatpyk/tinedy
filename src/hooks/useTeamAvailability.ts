import { useState, useEffect } from 'react';
import { Booking, StaffMember, BookingStatus, Package, Team, Service } from '../types';
import { MAX_DAILY_JOBS } from '../constants';

export interface TeamAvailabilitySuggestion {
    team: Team;
    isConflict: boolean;
    isFullyBooked: boolean;
    conflictingMembers: StaffMember[];
    replacementSuggestions: StaffMember[];
    alternativeDates: string[]; // YYYY-MM-DD strings
    score: number;
    hasSkillMatch: boolean;
}

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDateToYMD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const SKILL_KEYWORDS: Record<Service, string[]> = {
    [Service.Training]: ['cardio', 'strength', 'yoga', 'pilates', 'crossfit', 'trainer', 'training'],
    [Service.Cleaning]: ['deep cleaning', 'eco-friendly', 'window', 'cleaner', 'cleaning'],
};


export const useTeamAvailability = (
    targetBooking: Booking | null,
    allTeams: Team[],
    allStaff: StaffMember[],
    allBookings: Booking[],
    allPackages: Package[]
): { suggestions: TeamAvailabilitySuggestion[], isLoading: boolean } => {
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<TeamAvailabilitySuggestion[]>([]);

    useEffect(() => {
        if (!targetBooking) {
            setSuggestions([]);
            return;
        }

        const calculateSuggestions = async () => {
            setIsLoading(true);

            const teamSuggestions: TeamAvailabilitySuggestion[] = [];
            const targetPackage = allPackages.find(p => p.id === targetBooking.packageId);

            for (const team of allTeams) {
                if (team.status === 'Inactive' || team.members.length === 0) continue;

                let score = 100;
                const conflictingMembers: StaffMember[] = [];
                let replacementSuggestions: StaffMember[] = [];
                let alternativeDates: string[] = [];
                
                let hasSkillMatch = false;
                if (targetPackage && targetPackage.services.length > 0) {
                    hasSkillMatch = targetPackage.services.every(service => {
                        const keywords = SKILL_KEYWORDS[service] || [];
                        if (keywords.length === 0) return false;
                        return team.members.some(member => {
                            if (!member.skills || member.skills.length === 0) return false;
                            return member.skills.some(skill =>
                                keywords.some(keyword => skill.toLowerCase().includes(keyword))
                            );
                        });
                    });
                } else {
                    hasSkillMatch = true;
                }

                if (hasSkillMatch) {
                    score += 30;
                }

                if (targetPackage) {
                    const targetStart = new Date(`${targetBooking.bookingDate}T${targetBooking.bookingTime}`);
                    const targetEnd = new Date(targetStart.getTime() + targetPackage.duration * 60000);

                    for (const member of team.members) {
                        const jobsOnSameDay = allBookings.filter(b =>
                            b.bookingDate === targetBooking.bookingDate &&
                            b.assignedStaffId === member.id &&
                            b.id !== targetBooking.id &&
                            b.status !== BookingStatus.Cancelled
                        );

                        if (jobsOnSameDay.length >= MAX_DAILY_JOBS) {
                            if (!conflictingMembers.find(cm => cm.id === member.id)) conflictingMembers.push(member);
                            continue;
                        }

                        const hasTimeOverlap = jobsOnSameDay.some(job => {
                            const jobPackage = allPackages.find(p => p.id === job.packageId);
                            if (!jobPackage) return false;
                            const jobStart = new Date(`${job.bookingDate}T${job.bookingTime}`);
                            const jobEnd = new Date(jobStart.getTime() + jobPackage.duration * 60000);
                            return jobStart < targetEnd && jobEnd > targetStart;
                        });

                        if (hasTimeOverlap) {
                             if (!conflictingMembers.find(cm => cm.id === member.id)) conflictingMembers.push(member);
                        }
                    }
                }
                
                const isConflict = conflictingMembers.length > 0;
                const isFullyBooked = conflictingMembers.length === team.members.length;
                score -= conflictingMembers.length * 50;

                if (isConflict && !isFullyBooked) {
                    // Find replacement suggestions
                    const teamMemberIds = new Set(team.members.map(m => m.id));
                    const potentialReplacements = allStaff.filter(s => !teamMemberIds.has(s.id));
                    
                    for (const staff of potentialReplacements) {
                        const jobsOnSameDay = allBookings.filter(b => b.bookingDate === targetBooking.bookingDate && b.assignedStaffId === staff.id && b.status !== BookingStatus.Cancelled);
                         if (jobsOnSameDay.length < MAX_DAILY_JOBS) {
                            replacementSuggestions.push(staff);
                         }
                    }
                    replacementSuggestions = replacementSuggestions.slice(0, 3); // Limit suggestions

                } else if (isFullyBooked && targetPackage) {
                    // Find alternative dates
                    let currentDate = new Date(targetBooking.bookingDate);
                    for (let i = 0; i < 30 && alternativeDates.length < 3; i++) {
                        currentDate = addDays(currentDate, 1);
                        const checkDateStr = formatDateToYMD(currentDate);
                        const checkStart = new Date(`${checkDateStr}T${targetBooking.bookingTime}`);
                        const checkEnd = new Date(checkStart.getTime() + targetPackage.duration * 60000);
                        
                        let teamIsAvailableOnThisDay = true;
                        for (const member of team.members) {
                            const memberJobs = allBookings.filter(b => b.bookingDate === checkDateStr && b.assignedStaffId === member.id && b.status !== BookingStatus.Cancelled);
                            if (memberJobs.length >= MAX_DAILY_JOBS) {
                                teamIsAvailableOnThisDay = false;
                                break;
                            }
                            const hasOverlap = memberJobs.some(job => {
                                const jobPackage = allPackages.find(p => p.id === job.packageId);
                                if (!jobPackage) return false;
                                const jobStart = new Date(`${checkDateStr}T${job.bookingTime}`);
                                const jobEnd = new Date(jobStart.getTime() + jobPackage.duration * 60000);
                                return jobStart < checkEnd && jobEnd > checkStart;
                            });
                            if (hasOverlap) {
                                teamIsAvailableOnThisDay = false;
                                break;
                            }
                        }
                        if (teamIsAvailableOnThisDay) {
                            alternativeDates.push(checkDateStr);
                        }
                    }
                }

                teamSuggestions.push({
                    team,
                    isConflict,
                    isFullyBooked,
                    conflictingMembers,
                    replacementSuggestions,
                    alternativeDates,
                    score,
                    hasSkillMatch,
                });
            }

            teamSuggestions.sort((a, b) => {
                if (a.hasSkillMatch && !b.hasSkillMatch) return -1;
                if (!a.hasSkillMatch && b.hasSkillMatch) return 1;

                if (a.isConflict && !b.isConflict) return 1;
                if (!a.isConflict && b.isConflict) return -1;
                
                return b.score - a.score;
            });
            
            setSuggestions(teamSuggestions);
            setIsLoading(false);
        };

        calculateSuggestions();

    }, [targetBooking, allTeams, allStaff, allBookings, allPackages]);

    return { suggestions, isLoading };
};