import { useState, useEffect, useMemo } from 'react';
import { Booking, StaffMember, BookingStatus, Service, Package, Team } from '../types';
import { getTravelTime } from '../lib/travelService';
import { MAX_DAILY_JOBS } from '../constants';
import { useTeamStore } from '../store/teamStore';

export interface StaffSuggestion {
    staff: StaffMember;
    reason: string;
    reasonType: 'positive' | 'neutral' | 'warning';
    score: number; // For ranking: higher is better
    jobsToday: number;
    travelTime?: number;
    isConflict: boolean;
    hasSkillMatch: boolean;
}

const SKILL_KEYWORDS: Record<Service, string[]> = {
    [Service.Training]: ['cardio', 'strength', 'yoga', 'pilates', 'crossfit', 'trainer', 'training'],
    [Service.Cleaning]: ['deep cleaning', 'eco-friendly', 'window', 'cleaner', 'cleaning'],
};


export const useStaffSuggestions = (
    targetBooking: Booking | null,
    allStaff: StaffMember[],
    allBookings: Booking[],
    allPackages: Package[],
    allTeams: Team[]
): { suggestions: StaffSuggestion[], isLoading: boolean } => {
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<StaffSuggestion[]>([]);

    useEffect(() => {
        if (!targetBooking) {
            setSuggestions([]);
            return;
        }

        const calculateSuggestions = async () => {
            setIsLoading(true);

            // Pre-calculate which teams each staff member belongs to for efficiency
            const staffToTeamsMap = new Map<string, string[]>();
            for (const team of allTeams) {
                for (const member of team.members) {
                    const teams = staffToTeamsMap.get(member.id) || [];
                    teams.push(team.id);
                    staffToTeamsMap.set(member.id, teams);
                }
            }

            const staffSuggestions: StaffSuggestion[] = [];
            const targetPackage = allPackages.find(p => p.id === targetBooking.packageId);

            for (const staff of allStaff) {
                const staffTeamIds = staffToTeamsMap.get(staff.id) || [];

                // A staff member is busy with a job on the target date if:
                // 1. The job is directly assigned to them.
                // 2. The job is assigned to a team they are a member of.
                const jobsOnSameDay = allBookings.filter(b =>
                    b.bookingDate === targetBooking.bookingDate &&
                    // b.id !== targetBooking.id && // This line is removed to ensure consistency
                    b.status !== BookingStatus.Cancelled &&
                    (b.assignedStaffId === staff.id || (b.assignedTeamId && staffTeamIds.includes(b.assignedTeamId)))
                );

                const jobsToday = jobsOnSameDay.filter(b => b.id !== targetBooking.id).length;
                let score = 100;
                let reason = '';
                let reasonType: 'positive' | 'neutral' | 'warning' = 'neutral';
                let isConflict = false;

                // --- Conflict Detection ---
                if (targetPackage) {
                    const targetStart = new Date(`${targetBooking.bookingDate}T${targetBooking.bookingTime}`);
                    const targetEnd = new Date(targetStart.getTime() + targetPackage.duration * 60000);

                    const hasTimeOverlap = jobsOnSameDay.some(job => {
                        const jobPackage = allPackages.find(p => p.id === job.packageId);
                        if (!jobPackage) return false;
                        const jobStart = new Date(`${job.bookingDate}T${job.bookingTime}`);
                        const jobEnd = new Date(jobStart.getTime() + jobPackage.duration * 60000);
                        // Make sure we are not comparing the booking with itself if it's already in the list
                        if (job.id === targetBooking.id) return false;
                        return jobStart < targetEnd && jobEnd > targetStart;
                    });
                    
                    if (hasTimeOverlap || jobsToday >= MAX_DAILY_JOBS) {
                        isConflict = true;
                    }
                }

                const isPreferred = targetBooking.customer.preferredStaffId === staff.id;
                
                let hasSkillMatch = false;
                if (targetPackage && targetPackage.services.length > 0) {
                    hasSkillMatch = targetPackage.services.every(service => {
                        const keywords = SKILL_KEYWORDS[service] || [];
                        if (keywords.length === 0) return false;
                        if (!staff.skills || staff.skills.length === 0) return false;
                        return staff.skills.some(skill =>
                            keywords.some(keyword => skill.toLowerCase().includes(keyword))
                        );
                    });
                } else {
                    hasSkillMatch = true;
                }
                
                if (isConflict) {
                    reason = 'Scheduling Conflict';
                    reasonType = 'warning';
                    score -= 200;
                } else if (isPreferred) {
                    reason = 'Customer Preferred';
                    reasonType = 'positive';
                    score += 50;
                } else if (hasSkillMatch) {
                    reason = 'Skills Match';
                    reasonType = 'positive';
                    score += 40;
                } else if (jobsToday > 0) {
                    reason = `${jobsToday} other job(s) today`;
                    reasonType = 'neutral';
                    score -= jobsToday * 10;
                } else {
                    reason = 'Available';
                    reasonType = 'neutral';
                }

                // If this staff member is already assigned (directly or via team) to this booking, it's a conflict for assigning someone else
                // but for this card, we should just note they are assigned.
                const isAssignedToThisBooking = allBookings.some(b => 
                    b.id === targetBooking.id &&
                    (b.assignedStaffId === staff.id || (b.assignedTeamId && staffTeamIds.includes(b.assignedTeamId)))
                );
                
                if (isAssignedToThisBooking) {
                    isConflict = true; // The timeslot is taken, so it's a conflict for any other assignment
                }


                if (staff.rating && staff.rating > 4.5) score += 15;
                const travelTime = await getTravelTime('Office', targetBooking.address);
                if (travelTime > 60) score -= 20;
                else if (travelTime > 30) score -= 10;
                

                staffSuggestions.push({
                    staff,
                    reason,
                    reasonType,
                    score,
                    jobsToday,
                    travelTime,
                    isConflict,
                    hasSkillMatch,
                });
            }

            staffSuggestions.sort((a, b) => {
                if (a.hasSkillMatch && !b.hasSkillMatch) return -1;
                if (!a.hasSkillMatch && b.hasSkillMatch) return 1;

                if (!a.isConflict && b.isConflict) return -1;
                if (a.isConflict && !b.isConflict) return 1;

                return b.score - a.score;
            });
            
            setSuggestions(staffSuggestions);
            setIsLoading(false);
        };

        calculateSuggestions();

    }, [targetBooking, allStaff, allBookings, allPackages, allTeams]);

    return { suggestions, isLoading };
};