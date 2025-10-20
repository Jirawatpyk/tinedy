import React from 'react';
import { Booking, BookingStatus } from '../../types';
import { usePackageStore } from '../../store/packageStore';
import { formatTime, calculateEndTime } from '../../lib/utils';
import { XMarkIcon, UserIcon, PhoneIcon, MapPinIcon, ArchiveBoxIcon, ClockIcon, PencilIcon, ChevronRightIcon, FlagIcon } from '../ui/icons';
import Button from '../ui/Button';

interface JobDetailsModalProps {
    booking: Booking | null;
    onClose: () => void;
    onStartJob: (booking: Booking) => void;
    onOpenCompleteJob: (booking: Booking) => void;
    onReportIssue: (booking: Booking) => void;
    isUpdatingStatus: boolean;
}

const InfoRow: React.FC<{
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    action?: { label: string; href: string; }
}> = ({ icon: Icon, label, value, action }) => (
    <div className="flex items-start gap-4">
        <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-1 flex-shrink-0" />
        <div className="flex-grow">
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            {action ? (
                <a 
                    href={action.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between font-semibold text-tinedy-blue dark:text-sky-400 group"
                >
                    <span className="group-hover:underline">{value}</span>
                    <ChevronRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </a>
            ) : (
                <p className="font-semibold text-slate-800 dark:text-slate-100">{value}</p>
            )}
        </div>
    </div>
);

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ booking, onClose, onStartJob, onOpenCompleteJob, onReportIssue, isUpdatingStatus }) => {
    const pkg = usePackageStore(state => state.packages).find(p => p.id === booking?.packageId);

    if (!booking) return null;

    const durationText = pkg ? `${pkg.duration} นาที` : 'N/A';
    
    const renderActionButtons = () => {
        switch (booking.status) {
            case BookingStatus.Confirmed:
                return (
                    <Button onClick={() => onStartJob(booking)} isLoading={isUpdatingStatus} className="w-full">
                        เริ่มงาน
                    </Button>
                );
            case BookingStatus.InProgress:
                 return (
                    <Button onClick={() => onOpenCompleteJob(booking)} isLoading={isUpdatingStatus} className="w-full">
                        จบงาน
                    </Button>
                );
            case BookingStatus.Completed:
                return <Button disabled className="w-full">งานเสร็จสิ้นแล้ว</Button>;
            default:
                 return <Button disabled className="w-full">ไม่สามารถเริ่มงานได้</Button>;
        }
    }

    const canReportIssue = booking.status === BookingStatus.Confirmed || booking.status === BookingStatus.InProgress;

    return (
        // Full screen modal for mobile
        <div 
            className={`fixed inset-0 bg-slate-50 dark:bg-slate-950 z-40 flex flex-col transition-transform duration-300 ease-in-out ${booking ? 'translate-y-0' : 'translate-y-full'}`}
            role="dialog"
            aria-modal="true"
        >
            {/* Header */}
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="text-center flex-grow">
                    <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">{pkg?.name || 'รายละเอียดงาน'}</h2>
                    <p className="text-sm text-slate-500">{formatTime(booking.bookingTime, undefined, 'th-TH')}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full absolute right-2 top-2">
                    <XMarkIcon className="w-6 h-6 text-slate-500" />
                </button>
            </header>

            {/* Content */}
            <main className="flex-grow overflow-y-auto p-6 space-y-8">
                {/* Customer Info */}
                <section>
                    <h3 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-4">ข้อมูลลูกค้า</h3>
                    <div className="space-y-4">
                        <InfoRow icon={UserIcon} label="ชื่อลูกค้า" value={booking.customer.name} />
                        {booking.customer.phone && (
                            <InfoRow 
                                icon={PhoneIcon} 
                                label="เบอร์โทรศัพท์" 
                                value={booking.customer.phone} 
                                action={{ label: 'โทร', href: `tel:${booking.customer.phone}` }} 
                            />
                        )}
                        <InfoRow 
                            icon={MapPinIcon} 
                            label="ที่อยู่" 
                            value={booking.address}
                            action={{ label: 'นำทาง', href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}` }}
                        />
                    </div>
                </section>
                
                {/* Job Info */}
                 <section>
                    <h3 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-4">รายละเอียดงาน</h3>
                    <div className="space-y-4">
                        <InfoRow icon={ArchiveBoxIcon} label="แพ็คเกจ" value={pkg?.name || 'ไม่พบข้อมูล'} />
                        <InfoRow icon={ClockIcon} label="ระยะเวลา" value={durationText} />
                         {booking.notes && (
                            <InfoRow icon={PencilIcon} label="คำแนะนำพิเศษ" value={
                                <p className="text-sm font-normal whitespace-pre-wrap">{booking.notes}</p>
                            } />
                        )}
                    </div>
                </section>
            </main>

            {/* Footer Actions */}
            <footer className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                {renderActionButtons()}
                {canReportIssue && (
                    <Button variant="secondary" onClick={() => onReportIssue(booking)} className="w-full !font-semibold !text-amber-700 dark:!text-amber-300 !border-amber-400 hover:!bg-amber-50">
                        <FlagIcon className="w-5 h-5 mr-2" />
                        รายงานปัญหา
                    </Button>
                )}
            </footer>
        </div>
    );
};

export default JobDetailsModal;