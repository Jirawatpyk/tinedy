import React, { useState, useMemo } from 'react';
// FIX: Import 'Booking' type to resolve 'Cannot find name' error.
import { Booking, Package, StaffMember, Team } from '../../types';
import { StaffWorkload, TeamWorkload } from '../../types';
import { useWorkloadData, DateRange } from '../../hooks/useWorkloadData';
import { useTableSort, SortConfig } from '../../hooks/useTableSort';
import { ChartBarIcon, ChevronDownIcon, ChevronUpIcon, ChevronUpDownIcon, UserGroupIcon } from '../ui/icons';
import Select from '../ui/Select';
import { Table, TableHeaderCell, TableRow, TableCell } from '../ui/Table';
import WorkloadBar from './WorkloadBar';

interface WorkloadPageProps {
    allBookings: Booking[];
    staff: StaffMember[];
    packages: Package[];
    allTeams: Team[];
}

const SortableHeader = <T,>({
  sortKey,
  sortConfig,
  onRequestSort,
  className,
  children,
}: {
  sortKey: keyof T;
  sortConfig: SortConfig<T> | null;
  onRequestSort: (key: keyof T) => void;
  className?: string;
  children: React.ReactNode;
}) => {
    const isSorted = sortConfig?.key === sortKey;
    const direction = isSorted ? sortConfig?.direction : undefined;
    
    return (
        <TableHeaderCell className={`cursor-pointer ${className}`} onClick={() => onRequestSort(sortKey)}>
            <div className="flex items-center gap-1.5 group hover:text-slate-800 dark:hover:text-slate-200">
                <span>{children}</span>
                {isSorted ? (
                    direction === 'asc' ? <ChevronUpIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" /> : <ChevronDownIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                ) : (
                    <ChevronUpDownIcon className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
            </div>
        </TableHeaderCell>
    );
};

const WorkloadPage: React.FC<WorkloadPageProps> = ({ allBookings, staff, packages, allTeams }) => {
    const [dateRange, setDateRange] = useState<DateRange>('this_week');
    const [activeView, setActiveView] = useState<'staff' | 'team'>('staff');
    const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

    const { staffWorkloadData, teamWorkloadData, overallAverageUtilization } = useWorkloadData(allBookings, staff, packages, allTeams, dateRange);

    const { sortedItems: sortedStaff, requestSort: requestStaffSort, sortConfig: staffSortConfig } = useTableSort<StaffWorkload>(staffWorkloadData, { key: 'utilization', direction: 'desc' });
    const { sortedItems: sortedTeams, requestSort: requestTeamSort, sortConfig: teamSortConfig } = useTableSort<TeamWorkload>(teamWorkloadData, { key: 'avgUtilization', direction: 'desc' });
    
    const dateRangeOptions = [
        { value: 'this_week', label: 'This Week' },
        { value: 'next_7_days', label: 'Next 7 Days' },
    ];
    
    const staffToTeamsMap = useMemo(() => {
        const map = new Map<string, Team[]>();
        allTeams.forEach(team => {
            team.members.forEach(member => {
                const teams = map.get(member.id) || [];
                map.set(member.id, [...teams, team]);
            });
        });
        return map;
    }, [allTeams]);

    const staffWorkloadMap = useMemo(() => 
        new Map<string, StaffWorkload>(staffWorkloadData.map(d => [d.staffMember.id, d])),
        [staffWorkloadData]
    );

    const toggleTeamExpansion = (teamId: string) => {
        setExpandedTeamId(prev => prev === teamId ? null : teamId);
    };

    return (
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg shadow-slate-200/40 dark:shadow-none dark:border dark:border-slate-800 flex flex-col flex-grow min-h-0">
            <div className="flex justify-between items-center mb-5 pb-5 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <ChartBarIcon className="w-8 h-8 text-slate-500 dark:text-slate-400"/>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Workload</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">View team and staff utilization to balance assignments.</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <Select
                        id="workload-range-filter"
                        label="Period"
                        value={dateRange}
                        onChange={(val) => setDateRange(val as DateRange)}
                        options={dateRangeOptions}
                        wrapperClassName="min-w-[180px]"
                    />
                 </div>
            </div>
            
            <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveView('staff')} className={`px-1 py-3 text-sm font-semibold border-b-2 ${activeView === 'staff' ? 'border-tinedy-blue text-tinedy-blue' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>By Staff</button>
                    <button onClick={() => setActiveView('team')} className={`px-1 py-3 text-sm font-semibold border-b-2 ${activeView === 'team' ? 'border-tinedy-blue text-tinedy-blue' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>By Team</button>
                </nav>
            </div>

            <div className="overflow-y-auto flex-grow -mx-6 px-6">
                {activeView === 'staff' && (
                    <>
                        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                Overall Staff Utilization: <span className="text-tinedy-blue font-bold text-base">{overallAverageUtilization.toFixed(1)}%</span>
                            </p>
                        </div>
                        <Table aria-label="Staff Workload">
                            <Table.Header isSticky>
                                <SortableHeader<StaffWorkload> sortKey="staffMember" sortConfig={staffSortConfig} onRequestSort={requestStaffSort} className="flex-1 md:basis-4/12 min-w-0">Staff Member</SortableHeader>
                                <SortableHeader<StaffWorkload> sortKey="totalJobs" sortConfig={staffSortConfig} onRequestSort={requestStaffSort} className="basis-2/12 hidden md:block grow-0">Jobs</SortableHeader>
                                <SortableHeader<StaffWorkload> sortKey="totalHours" sortConfig={staffSortConfig} onRequestSort={requestStaffSort} className="basis-2/12 hidden lg:block grow-0">Hours</SortableHeader>
                                <SortableHeader<StaffWorkload> sortKey="utilization" sortConfig={staffSortConfig} onRequestSort={requestStaffSort} className="basis-4/12 hidden md:block grow-0">Utilization</SortableHeader>
                            </Table.Header>
                            <Table.Body>
                                {sortedStaff.map(({ staffMember, totalJobs, totalHours, utilization }) => (
                                    <TableRow key={staffMember.id}>
                                        <TableCell className="flex-1 md:basis-4/12 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{staffMember.name}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{staffMember.role}</p>
                                                </div>
                                                {/* FIX: The 'title' prop is not valid on SVG components. Wrap in a span to provide a tooltip. */}
                                                {(staffToTeamsMap.get(staffMember.id)?.length ?? 0) > 0 && (
                                                    <span title={`Member of ${staffToTeamsMap.get(staffMember.id)?.length} team(s)`}>
                                                        <UserGroupIcon className="w-5 h-5 text-slate-400" />
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="basis-2/12 hidden md:block grow-0"><span className="font-semibold">{totalJobs}</span></TableCell>
                                        <TableCell className="basis-2/12 hidden lg:block grow-0"><span className="font-semibold">{totalHours.toFixed(1)}</span></TableCell>
                                        <TableCell className="basis-4/12 hidden md:block grow-0">
                                            <div className="flex items-center gap-3">
                                                <WorkloadBar utilization={utilization} />
                                                <span className="font-semibold text-sm w-16 text-right">{utilization.toFixed(1)}%</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </Table.Body>
                        </Table>
                    </>
                )}
                {activeView === 'team' && (
                     <Table aria-label="Team Workload">
                        <Table.Header isSticky>
                            <SortableHeader<TeamWorkload> sortKey="team" sortConfig={teamSortConfig} onRequestSort={requestTeamSort} className="flex-1 md:basis-4/12 min-w-0">Team</SortableHeader>
                            <SortableHeader<TeamWorkload> sortKey="team" sortConfig={teamSortConfig} onRequestSort={requestTeamSort} className="basis-2/12 hidden md:block grow-0">Members</SortableHeader>
                            <SortableHeader<TeamWorkload> sortKey="totalJobs" sortConfig={teamSortConfig} onRequestSort={requestTeamSort} className="basis-2/12 hidden lg:block grow-0">Jobs</SortableHeader>
                            <SortableHeader<TeamWorkload> sortKey="totalHours" sortConfig={teamSortConfig} onRequestSort={requestTeamSort} className="basis-2/12 hidden lg:block grow-0">Hours</SortableHeader>
                            <SortableHeader<TeamWorkload> sortKey="avgUtilization" sortConfig={teamSortConfig} onRequestSort={requestTeamSort} className="basis-4/12 hidden md:block grow-0">Avg. Utilization</SortableHeader>
                        </Table.Header>
                        <Table.Body>
                             {sortedTeams.map((teamData) => (
                                <React.Fragment key={teamData.team.id}>
                                    <TableRow onClick={() => toggleTeamExpansion(teamData.team.id)} className="cursor-pointer">
                                        <TableCell className="flex-1 md:basis-4/12 min-w-0">
                                            <div className="flex items-center gap-2">
                                                {expandedTeamId === teamData.team.id ? <ChevronUpIcon className="w-4 h-4 text-slate-500" /> : <ChevronDownIcon className="w-4 h-4 text-slate-500" />}
                                                <p className="font-semibold text-slate-800 dark:text-slate-100">{teamData.team.name}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="basis-2/12 hidden md:block grow-0"><span className="font-semibold">{teamData.team.members.length}</span></TableCell>
                                        <TableCell className="basis-2/12 hidden lg:block grow-0"><span className="font-semibold">{teamData.totalJobs}</span></TableCell>
                                        <TableCell className="basis-2/12 hidden lg:block grow-0"><span className="font-semibold">{teamData.totalHours.toFixed(1)}</span></TableCell>
                                        <TableCell className="basis-4/12 hidden md:block grow-0">
                                            <div className="flex items-center gap-3">
                                                <WorkloadBar utilization={teamData.avgUtilization} />
                                                <span className="font-semibold text-sm w-16 text-right">{teamData.avgUtilization.toFixed(1)}%</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    {expandedTeamId === teamData.team.id && (
                                        <TableRow className="!bg-slate-50 dark:!bg-slate-800/50">
                                            <TableCell colSpan={5} className="!py-2 !px-12">
                                                <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Member Workload</h4>
                                                <div className="space-y-2">
                                                    {teamData.team.members.map(member => {
                                                        const memberWorkload = staffWorkloadMap.get(member.id);
                                                        const utilization = memberWorkload?.utilization ?? 0;
                                                        return (
                                                            <div key={member.id} className="flex justify-between items-center text-sm">
                                                                <span className="font-medium text-slate-700 dark:text-slate-200">{member.name}</span>
                                                                <div className="flex items-center gap-3 w-1/2 md:w-1/3">
                                                                    <WorkloadBar utilization={utilization} />
                                                                    <span className="font-semibold w-14 text-right">{utilization.toFixed(1)}%</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                        </Table.Body>
                     </Table>
                )}
                 {(activeView === 'staff' && sortedStaff.length === 0) || (activeView === 'team' && sortedTeams.length === 0) && (
                    <Table.EmptyState
                        icon={ChartBarIcon}
                        title="No Data to Display"
                        message="There is no workload data for the selected period."
                    />
                )}
            </div>
        </div>
    );
};

export default WorkloadPage;