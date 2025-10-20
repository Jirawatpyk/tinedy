import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, ToastType } from '../../types';
import Modal from '../ui/Modal';
import DetailItem from '../ui/DetailItem';
import { usePackageStore } from '../../store/packageStore';
import { useStaffStore } from '../../store/staffStore';
import { useAuthStore } from '../../store/authStore';
import { CalendarDaysIcon, ClockIcon, ArchiveBoxIcon, CurrencyDollarIcon, UserIcon, MapPinIcon, PencilIcon, PhoneIcon, ClipboardDocumentCheckIcon, AtSymbolIcon, UserGroupIcon, StarIcon } from '../ui/icons';
import { formatDate, formatTime, calculateEndTime } from '../../lib/utils';
import StatusBadge from '../ui/StatusBadge';
import ActivityFeed from './ActivityFeed';
import { useTeamStore } from '../../store/teamStore';
import { useUpdateBookingRating } from '../../hooks/useBookings';
import StarRating from '../ui/StarRating';

interface BookingDetailsModalProps {
    booking: Booking | null;
    onClose: () => void;
    addToast: (message: string, type: ToastType, title: string) => void;
    onEdit: (booking: Booking) => void;
    onAssignStaff: (booking: Booking) => void;
    onChangeStatus: (booking: Booking) => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose, addToast, onEdit, onAssignStaff, onChangeStatus }) => {
    const { packages } = usePackageStore();
    const { staff } = useStaffStore();
    const { teams } = useTeamStore();
    const { user } = useAuthStore();
    
    const [displayRating, setDisplayRating] = useState(booking?.rating || 0);

    const { mutate: updateRating, isPending: isRatingSaving } = useUpdateBookingRating({
        onSuccess: () => addToast('Booking rating updated.', 'success', 'Rating Saved'),
        onError: (error) => {
            addToast(error.message, 'error', 'Save Failed');
            setDisplayRating(booking?.rating || 0); // Revert on error
        },
    });
    
    useEffect(() => {
        if (booking) {
            setDisplayRating(booking.rating || 0);
        }
    }, [booking]);

    if (!booking) return null;

    const pkg = packages.find(p => p.id === booking.packageId);
    const assignedStaff = staff.find(s => s.id === booking.assignedStaffId);
    const assignedTeam = teams.find(t => t.id === booking.assignedTeamId);

    const handleAction = (action: (booking: Booking) => void) => {
        onClose(); // Close this modal first
        action(booking); // Then open the new one
    };
    
    const handleRatingChange = (newRating: number) => {
        if (displayRating !== newRating) {
            setDisplayRating(newRating); // Optimistic UI update
            updateRating({ id: booking.id, rating: newRating });
        }
    };

    return (
        <Modal 
            isOpen={!!booking} 
            onClose={onClose} 
            title={
                <div className="flex items-center gap-3">
                    <span>Booking Details</span>
                    {booking.bookingNumber && (
                        <span className="text-sm font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-2 py-1 rounded-md">
                            {booking.bookingNumber}
                        </span>
                    )}
                </div>
            }
            size="4xl"
        >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 min-h-[70vh]">
                {/* Left Column: Booking Info */}
                <div className="lg:col-span-3 flex flex-col justify-between">
                    <div className="space-y-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{booking.customer.name}</h2>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {booking.customer.email && (
                                        <a href={`mailto:${booking.customer.email}`} className="flex items-center gap-2 hover:text-tinedy-blue">
                                            <AtSymbolIcon className="w-4 h-4" />
                                            <span>{booking.customer.email}</span>
                                        </a>
                                    )}
                                    {booking.customer.email && booking.customer.phone && (
                                         <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                                    )}
                                    {booking.customer.phone && (
                                        <a href={`tel:${booking.customer.phone}`} className="flex items-center gap-2 hover:text-tinedy-blue">
                                            <PhoneIcon className="w-4 h-4" />
                                            <span>{booking.customer.phone}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                            <StatusBadge status={booking.status} />
                        </div>

                        <div className="space-y-8">
                            {/* When & Where */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <DetailItem label="Date" icon={<CalendarDaysIcon className="w-5 h-5 text-slate-400" />}>
                                    <p className="text-lg font-bold">{formatDate(booking.bookingDate)}</p>
                                </DetailItem>
                                <DetailItem label="Time" icon={<ClockIcon className="w-5 h-5 text-slate-400" />}>
                                    <p className="text-lg font-bold">
                                        {pkg && pkg.duration
                                            ? `${formatTime(booking.bookingTime)} - ${calculateEndTime(booking.bookingTime, pkg.duration)}`
                                            : formatTime(booking.bookingTime)
                                        }
                                    </p>
                                </DetailItem>
                                <div className="md:col-span-2">
                                    <DetailItem label="Address" icon={<MapPinIcon className="w-5 h-5 text-slate-400" />}>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-base font-semibold whitespace-pre-line text-tinedy-blue dark:text-sky-400 hover:underline"
                                        >
                                            {booking.address}
                                        </a>
                                    </DetailItem>
                                </div>
                            </div>

                            {/* Service Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                <DetailItem label="Package" icon={<ArchiveBoxIcon className="w-5 h-5 text-slate-400" />}>
                                    <p className="text-lg font-bold">{pkg?.name || 'Unknown Package'}</p>
                                </DetailItem>
                                <DetailItem label="Price" icon={<CurrencyDollarIcon className="w-5 h-5 text-slate-400" />}>
                                    <p className="text-lg font-bold">฿{pkg?.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) || 'N/A'}</p>
                                </DetailItem>
                                {assignedTeam && (
                                    <DetailItem label="Assigned Team" icon={<UserGroupIcon className="w-5 h-5 text-slate-400" />}>
                                        <p className="text-lg font-bold">{assignedTeam.name}</p>
                                    </DetailItem>
                                )}
                                <DetailItem label={assignedTeam ? "Point of Contact" : "Assigned Staff"} icon={<UserIcon className="w-5 h-5 text-slate-400" />}>
                                    <p className="text-lg font-bold">{assignedStaff?.name || 'Unassigned'}</p>
                                </DetailItem>
                                 <DetailItem label="Rating" icon={<StarIcon className="w-5 h-5 text-slate-400" />}>
                                    <div className={isRatingSaving ? 'opacity-50 pointer-events-none' : ''}>
                                        <StarRating 
                                            rating={displayRating}
                                            isEditable={booking.status === BookingStatus.Completed}
                                            onRatingChange={handleRatingChange}
                                            size="lg"
                                        />
                                    </div>
                                    {booking.status !== BookingStatus.Completed && (
                                        <p className="text-xs text-slate-400 mt-1">Rating can be added once the job is completed.</p>
                                    )}
                                </DetailItem>
                            </div>
                            
                            {booking.notes && (
                                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                                    <DetailItem label="Notes" icon={<PencilIcon className="w-5 h-5 text-slate-400" />}>
                                        <p className="text-sm bg-slate-100 dark:bg-slate-700/50 p-4 rounded-md whitespace-pre-wrap">{booking.notes}</p>
                                    </DetailItem>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => handleAction(onEdit)}
                                className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 transition-colors text-center"
                            >
                                <PencilIcon className="w-6 h-6 text-tinedy-blue mb-1" />
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Edit Booking</span>
                            </button>
                            <button
                                onClick={() => handleAction(onAssignStaff)}
                                className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 transition-colors text-center"
                            >
                                <UserIcon className="w-6 h-6 text-tinedy-blue mb-1" />
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Assign</span>
                            </button>
                            <button
                                onClick={() => handleAction(onChangeStatus)}
                                className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 transition-colors text-center"
                            >
                                <ClipboardDocumentCheckIcon className="w-6 h-6 text-tinedy-blue mb-1" />
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Change Status</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Activity Feed */}
                <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg relative">
                    {user && (
                        <ActivityFeed 
                            booking={booking}
                            currentUser={user}
                            staff={staff}
                            addToast={addToast}
                        />
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default BookingDetailsModal;