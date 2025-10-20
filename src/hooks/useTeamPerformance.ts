import { useMemo } from 'react';
import { Booking, Package, Team, BookingStatus, TeamPerformanceData } from '../types';

/**
 * A custom hook to calculate performance metrics for each team.
 * @param bookings - All bookings in the system.
 * @param packages - All service packages available.
 * @param teams - All teams in the system.
 * @returns An array of performance data for each team.
 */
export const useTeamPerformance = (
    bookings: Booking[],
    packages: Package[],
    teams: Team[]
): TeamPerformanceData[] => {
    return useMemo(() => {
        if (!teams.length || !bookings.length || !packages.length) {
            return [];
        }

        const packagesById = new Map<string, Package>(packages.map(p => [p.id, p]));
        
        // Use a more detailed structure for calculation
        const performanceMap = new Map<string, Omit<TeamPerformanceData, 'averageRating'> & { totalRating: number; ratedBookingCount: number }>();

        // Initialize map for all teams
        teams.forEach(team => {
            performanceMap.set(team.id, {
                teamId: team.id,
                teamName: team.name,
                completedJobs: 0,
                totalRevenue: 0,
                totalHours: 0,
                totalRating: 0,
                ratedBookingCount: 0,
            });
        });

        // Process completed bookings assigned to teams
        bookings.forEach(booking => {
            if (booking.status === BookingStatus.Completed && booking.assignedTeamId) {
                const teamPerformance = performanceMap.get(booking.assignedTeamId);
                const pkg = packagesById.get(booking.packageId);

                if (teamPerformance && pkg) {
                    teamPerformance.completedJobs += 1;
                    teamPerformance.totalRevenue += pkg.price;
                    teamPerformance.totalHours += pkg.duration / 60; // Convert minutes to hours
                    if (booking.rating !== null && booking.rating !== undefined) {
                        teamPerformance.totalRating += booking.rating;
                        teamPerformance.ratedBookingCount += 1;
                    }
                }
            }
        });

        // Finalize calculation and create the result array
        return Array.from(performanceMap.values()).map(data => {
            const { totalRating, ratedBookingCount, ...rest } = data;
            return {
                ...rest,
                averageRating: ratedBookingCount > 0 ? totalRating / ratedBookingCount : 0,
            };
        });

    }, [bookings, packages, teams]);
};