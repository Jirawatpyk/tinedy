import React, { useState, useEffect, useMemo } from 'react';
import { StaffUnavailability, UnavailabilityReason, Booking, Package, BookingStatus } from '../../types';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';
import { expandRRule } from '../../lib/rrule';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import InputField from '../ui/InputField';
import NativeDatePicker from '../ui/NativeDatePicker';
import Switch from '../ui/Switch';
import { ExclamationTriangleIcon, CalendarDaysIcon, ClockIcon } from '../ui/icons';
import { formatTime } from '../../lib/utils';

interface ManageAvailabilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<StaffUnavailability, 'id' | 'createdAt' | 'staffId'>) => void;
    isSaving: boolean;
    initialData?: StaffUnavailability | null;
    preselectedDate?: Date | null;
    bookings: Booking[];
    packages: Package[];
}

interface FormState {
    date: string;
    startTime: string;
    endTime: string;
    reason: UnavailabilityReason | '';
    notes: string;
}

const validationSchema: ValidationSchema<FormState> = {
    date: { required: 'กรุณาเลือกวันที่' },
    reason: { required: 'กรุณาเลือกเหตุผล' },
};

const ManageAvailabilityModal: React.FC<ManageAvailabilityModalProps> = ({ isOpen, onClose, onSave, isSaving, initialData, preselectedDate, bookings, packages }) => {
    const [isAllDay, setIsAllDay] = useState(false);
    const [repeat, setRepeat] = useState('none');
    const [endDate, setEndDate] = useState('');
    const [conflictingBookings, setConflictingBookings] = useState<Booking[] | null>(null);

    const initialFormState = useMemo(() => {
        const date = initialData ? new Date(initialData.startTime) : (preselectedDate || new Date());
        
        return {
            date: date.toISOString().split('T')[0],
            startTime: initialData ? new Date(initialData.startTime).toTimeString().substring(0, 5) : '09:00',
            endTime: initialData ? new Date(initialData.endTime).toTimeString().substring(0, 5) : '17:00',
            reason: initialData?.reason || '',
            notes: initialData?.notes || '',
        };
    }, [initialData, preselectedDate]);
    
    const { values, errors, validate, handleValueChange, handleInputChange, resetForm } = useFormValidation(initialFormState, validationSchema);
    
    useEffect(() => {
        if(isOpen) {
            resetForm();
            setConflictingBookings(null);
            setIsAllDay(initialData?.allDay || false);
            if (initialData?.recurrenceRule) {
                if (initialData.recurrenceRule.includes('FREQ=DAILY')) setRepeat('daily');
                if (initialData.recurrenceRule.includes('FREQ=WEEKLY')) setRepeat('weekly');
                const untilMatch = initialData.recurrenceRule.match(/UNTIL=(\d{8})T/);
                if (untilMatch) {
                    const dateStr = untilMatch[1];
                    setEndDate(`${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`);
                }
            } else {
                setRepeat('none');
                setEndDate('');
            }
        }
    }, [isOpen, initialData, resetForm]);

    const buildUnavailabilityData = () => {
        const startDateTime = new Date(`${values.date}T${values.startTime}`);
        const endDateTime = new Date(`${values.date}T${values.endTime}`);

        if (!isAllDay && endDateTime <= startDateTime) {
            alert('เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น');
            return null;
        }

        let recurrenceRule: string | null = null;
        if (repeat !== 'none') {
            let rule = `FREQ=${repeat.toUpperCase()}`;
            if (repeat === 'weekly') {
                const dayIndex = new Date(values.date + 'T00:00:00Z').getUTCDay();
                const dayOfWeek = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][dayIndex];
                rule += `;BYDAY=${dayOfWeek}`;
            }
            if (endDate) {
                const untilDate = new Date(endDate);
                untilDate.setUTCHours(23, 59, 59);
                const untilString = untilDate.toISOString().replace(/[-:.]/g, '').replace('000Z', 'Z');
                rule += `;UNTIL=${untilString}`;
            }
            recurrenceRule = rule;
        }

        const finalStartTime = isAllDay ? new Date(`${values.date}T00:00:00`) : startDateTime;
        const finalEndTime = isAllDay ? new Date(`${values.date}T23:59:59`) : endDateTime;

        return {
            startTime: finalStartTime.toISOString(),
            endTime: finalEndTime.toISOString(),
            allDay: isAllDay,
            reason: values.reason as UnavailabilityReason,
            notes: values.notes,
            recurrenceRule,
        };
    }

    const handleSave = () => {
        if (!validate()) return;
        
        const data = buildUnavailabilityData();
        if (!data) return;

        const tempUnavailability: StaffUnavailability = { ...data, id: 'temp', createdAt: '', staffId: '' };

        // Expand all potential occurrences in the next 6 months to check for conflicts
        const viewStart = new Date();
        const viewEnd = new Date();
        viewEnd.setMonth(viewEnd.getMonth() + 6);
        const occurrences = expandRRule(tempUnavailability, viewStart, viewEnd);

        const conflicts = new Set<Booking>();

        for (const booking of bookings) {
            if (booking.status === BookingStatus.Cancelled) continue;
            const pkg = packages.find(p => p.id === booking.packageId);
            if (!pkg) continue;

            const bookingStart = new Date(`${booking.bookingDate}T${booking.bookingTime}`);
            const bookingEnd = new Date(bookingStart.getTime() + pkg.duration * 60000);

            for (const occ of occurrences) {
                const unavailableStart = new Date(occ.startTime);
                const unavailableEnd = new Date(occ.endTime);
                if ((unavailableStart < bookingEnd) && (unavailableEnd > bookingStart)) {
                    conflicts.add(booking);
                    break; 
                }
            }
        }

        if (conflicts.size > 0) {
            setConflictingBookings(Array.from(conflicts));
        } else {
            onSave(data);
        }
    };

    const handleForceSave = () => {
        const data = buildUnavailabilityData();
        if (data) {
            onSave(data);
        }
    }
    
    const reasonOptions = Object.values(UnavailabilityReason).map(r => ({ value: r, label: r }));
    const repeatOptions = [
        { value: 'none', label: 'ไม่ทำซ้ำ' },
        { value: 'daily', label: 'ทุกวัน' },
        { value: 'weekly', label: 'ทุกสัปดาห์' },
    ];
    
    const renderForm = () => (
         <div className="space-y-4 font-rule">
            <div className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <label htmlFor="all-day-switch" className="font-semibold text-slate-700 dark:text-slate-200">ตลอดวัน</label>
                <Switch
                    id="all-day-switch"
                    checked={isAllDay}
                    onChange={setIsAllDay}
                    offLabel="ระบุเวลา"
                    onLabel="ใช่"
                />
            </div>
            
            <NativeDatePicker id="unavailability-date" label="วันที่" value={values.date} onChange={(v) => handleValueChange('date', v)} error={errors.date} />

            {!isAllDay && (
                <div className="grid grid-cols-2 gap-4">
                    <InputField id="start-time" label="ตั้งแต่" type="time" value={values.startTime} onChange={handleInputChange('startTime')} />
                    <InputField id="end-time" label="ถึง" type="time" value={values.endTime} onChange={handleInputChange('endTime')} />
                </div>
            )}
            
            <Select id="reason" label="เหตุผล" options={reasonOptions} value={values.reason} onChange={(v) => handleValueChange('reason', v)} error={errors.reason} placeholder="เลือกเหตุผล" required />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select id="repeat" label="ทำซ้ำ" options={repeatOptions} value={repeat} onChange={setRepeat} />
                {repeat !== 'none' && (
                    <NativeDatePicker id="end-date" label="วันที่สิ้นสุด (ถ้ามี)" value={endDate} onChange={setEndDate} min={values.date} />
                )}
            </div>

            <InputField as="textarea" id="notes" label="บันทึกเพิ่มเติม (ถ้ามี)" value={values.notes} onChange={handleInputChange('notes')} rows={3} placeholder="รายละเอียดเพิ่มเติม..." />

             <div className="flex justify-end gap-3 pt-4">
                <Button variant="secondary" onClick={onClose} disabled={isSaving}>ยกเลิก</Button>
                <Button onClick={handleSave} isLoading={isSaving}>บันทึก</Button>
            </div>
        </div>
    );

    const renderConflictWarning = () => (
        <div className="space-y-4 font-rule">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-400 rounded-r-md">
                <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-6 h-6 text-amber-500 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-amber-800 dark:text-amber-200">คำเตือน: พบตารางงานทับซ้อน</h3>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            เวลาที่คุณเลือกทับซ้อนกับงานที่มีอยู่ {conflictingBookings?.length} รายการ
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {conflictingBookings?.map(booking => (
                    <div key={booking.id} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{booking.customer.name}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="flex items-center gap-1.5"><CalendarDaysIcon className="w-3 h-3" /> {booking.bookingDate}</span>
                            <span className="flex items-center gap-1.5"><ClockIcon className="w-3 h-3" /> {formatTime(booking.bookingTime)}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <p className="text-xs text-slate-500">
                การดำเนินการต่ออาจทำให้เกิดปัญหาในการจัดตารางงาน คุณต้องการยืนยันหรือไม่?
            </p>

            <div className="flex justify-end gap-3 pt-4">
                <Button variant="secondary" onClick={() => setConflictingBookings(null)} disabled={isSaving}>
                    ย้อนกลับ
                </Button>
                <Button
                    variant="danger"
                    onClick={handleForceSave}
                    isLoading={isSaving}
                >
                    ยืนยันและบันทึกทับ
                </Button>
            </div>
        </div>
    );

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={conflictingBookings ? "ตรวจสอบการทับซ้อน" : (initialData ? "แก้ไขเวลาที่ไม่สะดวก" : "เพิ่มเวลาที่ไม่สะดวก")}
            size="md"
        >
            {conflictingBookings ? renderConflictWarning() : renderForm()}
        </Modal>
    );
};

export default ManageAvailabilityModal;
