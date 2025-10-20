import { useMemo } from 'react';
import { Booking, StaffMember, Package, BookingStatus, Team } from '../types';
import { StaffWorkload, TeamWorkload } from '../types';

export type DateRange = 'this_week' | 'next_7_days';

const WORK_HOURS_PER_DAY = 8;

const isWeekday = (date: Date) => {
  const day = date.getDay();
  return day >= 1 && day <= 5; // Monday to Friday
};

const getDateRange = (range: DateRange): [Date, Date] => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  if (range === 'this_week') {
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    start.setDate(diff);
  }

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return [start, end];
};

export const useWorkloadData = (
    allBookings: Booking[],
    staff: StaffMember[],
    packages: Package[],
    allTeams: Team[],
    dateRange: DateRange
): { 
    staffWorkloadData: StaffWorkload[], 
    teamWorkloadData: TeamWorkload[],
    overallAverageUtilization: number
} => {
    return useMemo(() => {
        const [startDate, endDate] = getDateRange(dateRange);

        let workDays = 0;
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            if (isWeekday(currentDate)) {
                workDays++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        const personCapacityHours = workDays * WORK_HOURS_PER_DAY;

        const bookingsInPeriod = allBookings.filter(b => {
            const bookingDate = new Date(b.bookingDate);
            return bookingDate >= startDate && bookingDate <= endDate && b.status !== BookingStatus.Cancelled;
        });
        
        const packagesById = new Map<string, Package>(packages.map(p => [p.id, p]));

        const staffToTeamsMap = new Map<string, string[]>();
        allTeams.forEach(team => {
            team.members.forEach(member => {
                const teams = staffToTeamsMap.get(member.id) || [];
                staffToTeamsMap.set(member.id, [...teams, team.id]);
            });
        });

        const staffWorkloadData: StaffWorkload[] = staff.map(staffMember => {
            const memberTeamIds = staffToTeamsMap.get(staffMember.id) || [];
            
            const memberBookings = bookingsInPeriod.filter(b => 
                b.assignedStaffId === staffMember.id || 
                (b.assignedTeamId && memberTeamIds.includes(b.assignedTeamId))
            );
            
            const totalJobs = memberBookings.length;
            const totalMinutes = memberBookings.reduce((sum, b) => {
                const pkg = packagesById.get(b.packageId);
                return sum + (pkg?.duration || 0);
            }, 0);
            
            const totalHours = totalMinutes / 60;
            const utilization = personCapacityHours > 0 ? (totalHours / personCapacityHours) * 100 : 0;

            return {
                staffMember,
                totalJobs,
                totalHours,
                utilization,
                workDays,
            };
        });
        
        const teamWorkloadData: TeamWorkload[] = allTeams.map(team => {
            const teamBookings = bookingsInPeriod.filter(b => b.assignedTeamId === team.id);
            const totalJobs = teamBookings.length;
            const totalMinutes = teamBookings.reduce((sum, b) => {
                const pkg = packagesById.get(b.packageId);
                return sum + (pkg?.duration || 0);
            }, 0);
            const totalHours = totalMinutes / 60;
            
            const teamCapacityHours = team.members.length * personCapacityHours;
            const avgUtilization = teamCapacityHours > 0 ? (totalHours / teamCapacityHours) * 100 : 0;
            
            return {
                team,
                totalJobs,
                totalHours,
                avgUtilization,
            };
        });

        const totalUtilization = staffWorkloadData.reduce((sum, data) => sum + data.utilization, 0);
        const overallAverageUtilization = staff.length > 0 ? totalUtilization / staff.length : 0;

        return { staffWorkloadData, teamWorkloadData, overallAverageUtilization };

    }, [allBookings, staff, packages, allTeams, dateRange]);
};
