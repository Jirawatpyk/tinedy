import React, { useMemo } from 'react';
import Modal from '../ui/Modal';
import { Booking, StaffMember, BookingStatus } from '../../types';
import { useBookingStore } from '../../store/bookingStore';
import { useStaffStore } from '../../store/staffStore';
import { usePackageStore } from '../../store/packageStore';
import { formatTime, calculateEndTime } from '../../lib/utils';
import { CheckCircleIcon, ExclamationTriangleIcon, PlusIcon } from '../ui/icons';
import Button from '../ui/Button';

interface AvailabilityCheckerModalProps {
    booking: Booking | null;
    onClose: () => void;
    onSelectStaff: (staffId: string) => void;
}

const AvailabilityCheckerModal: React.FC<AvailabilityCheckerModalProps> = ({ booking, onClose, onSelectStaff }) => {
    const { bookings: allBookings } = useBookingStore();
    const { staff: allStaff } = useStaffStore();
    const { packages } = usePackageStore();

    const dailySchedule = useMemo(() => {
        if (!booking) return [];

        const jobsOnDate = allBookings.filter(b => 
            b.bookingDate === booking.bookingDate && 
            b.status !== BookingStatus.Cancelled
        );
        
        const targetPackage = packages.find(p => p.id === booking.packageId);
        if (!targetPackage) return [];


        const scheduleByStaff = allStaff.map(staffMember => {
            const memberJobs = jobsOnDate
                .filter(j => j.assignedStaffId === staffMember.id)
                .sort((a, b) => a.bookingTime.localeCompare(b.bookingTime));
            
            const isAvailable = !memberJobs.some(job => {
                const jobPackage = packages.find(p => p.id === job.packageId);
                if (!jobPackage) return false;

                const jobStart = new Date(`${booking.bookingDate}T${job.bookingTime}`);
                const jobEnd = new Date(jobStart.getTime() + jobPackage.duration * 60000);
                
                const targetStart = new Date(`${booking.bookingDate}T${booking.bookingTime}`);
                const targetEnd = new Date(targetStart.getTime() + targetPackage.duration * 60000);

                // Time overlap check: (StartA < EndB) and (EndA > StartB)
                return jobStart < targetEnd && jobEnd > targetStart;
            });

            return {
                staffMember,
                jobs: memberJobs,
                isAvailable
            };
        }).sort((a,b) => {
            // Sort by availability first, then by name
            if (a.isAvailable && !b.isAvailable) return -1;
            if (!a.isAvailable && b.isAvailable) return 1;
            return a.staffMember.name.localeCompare(b.staffMember.name);
        });

        return scheduleByStaff;

    }, [booking, allBookings, allStaff, packages]);

    if (!booking) return null;

    return (
        <Modal 
            isOpen={!!booking} 
            onClose={onClose} 
            title={`Staff Schedule & Availability for ${booking.bookingDate}`}
            size="3xl"
        >
            <div className="max-h-[70vh] overflow-y-auto pr-2 -mr-4 space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 px-2">Select a staff member to assign them to this booking.</p>
                {dailySchedule.map(({ staffMember, jobs, isAvailable }) => (
                    <div key={staffMember.id} className={`p-4 rounded-lg border ${isAvailable ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}>
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-slate-800 dark:text-slate-100">{staffMember.name}</p>
                            {isAvailable ? (
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-tinedy-green">
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Likely Available
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                    Potential Conflict
                                </span>
                            )}
                        </div>
                        {jobs.length > 0 ? (
                            <div className="mt-2 space-y-1 border-t border-slate-200 dark:border-slate-600 pt-2">
                                {jobs.map(job => {
                                    const pkg = packages.find(p => p.id === job.packageId);
                                    const isTargetBooking = job.id === booking.id;
                                    return (
                                        <div key={job.id} className={`text-xs p-1 rounded ${isTargetBooking ? 'bg-tinedy-blue/20' : ''}`}>
                                            <span className="font-semibold">{formatTime(job.bookingTime)} - {calculateEndTime(job.bookingTime, pkg?.duration || 0)}:</span>
                                            <span className="text-slate-600 dark:text-slate-300 ml-2">{pkg?.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No jobs scheduled today.</p>
                        )}

                        {isAvailable && (
                            <div className="flex justify-end mt-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => onSelectStaff(staffMember.id)}
                                    className="font-semibold"
                                >
                                    Select {staffMember.name.split(' ')[0]}
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Modal>
    );
};

export default AvailabilityCheckerModal;