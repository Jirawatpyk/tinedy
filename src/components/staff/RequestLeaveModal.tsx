import React, { useState, useEffect, useMemo } from 'react';
import { Booking, LeaveRequest, LeaveType } from '../../types';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import InputField from '../ui/InputField';
import NativeDatePicker from '../ui/NativeDatePicker';
import { CalendarDaysIcon, ClockIcon, ExclamationTriangleIcon } from '../ui/icons';
import { formatTime } from '../../lib/utils';

interface RequestLeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<LeaveRequest, 'id' | 'createdAt' | 'staffId' | 'status'>) => void;
    isSaving: boolean;
    preselectedDate?: Date | null;
    bookings: Booking[];
}

interface FormState {
    startDate: string;
    endDate: string;
    leaveType: LeaveType | '';
    reason: string;
}

const validationSchema: ValidationSchema<FormState> = {
    startDate: { required: 'กรุณาเลือกวันที่เริ่ม' },
    endDate: { required: 'กรุณาเลือกวันที่สิ้นสุด' },
    leaveType: { required: 'กรุณาเลือกประเภทการลา' },
};

const RequestLeaveModal: React.FC<RequestLeaveModalProps> = ({ isOpen, onClose, onSave, isSaving, preselectedDate, bookings }) => {
    
    const initialFormState = useMemo(() => {
        const date = preselectedDate || new Date();
        const dateStr = date.toISOString().split('T')[0];
        return {
            startDate: dateStr,
            endDate: dateStr,
            leaveType: '' as '',
            reason: '',
        };
    }, [preselectedDate]);
    
    const { values, errors, validate, handleValueChange, handleInputChange, resetForm } = useFormValidation(initialFormState, validationSchema);
    
    useEffect(() => {
        if(isOpen) {
            resetForm();
        }
    }, [isOpen, resetForm]);

    const conflictingBookings = useMemo(() => {
        if (!values.startDate || !values.endDate) return [];
        return bookings.filter(booking => {
            return booking.bookingDate >= values.startDate && booking.bookingDate <= values.endDate;
        });
    }, [bookings, values.startDate, values.endDate]);

    const handleSave = () => {
        if (!validate()) return;
        
        const end = new Date(values.endDate);
        const start = new Date(values.startDate);
        if (end < start) {
            alert('วันที่สิ้นสุดต้องไม่มาก่อนวันที่เริ่มต้น');
            return;
        }

        onSave({
            startDate: values.startDate,
            endDate: values.endDate,
            leaveType: values.leaveType as LeaveType,
            reason: values.reason,
        });
    };
    
    const leaveTypeOptions = Object.values(LeaveType).map(r => ({ value: r, label: r }));
    
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="ยื่นเรื่องลา"
            size="md"
        >
            <div className="space-y-4 font-rule">
                <Select id="leave-type" label="ประเภทการลา" options={leaveTypeOptions} value={values.leaveType} onChange={(v) => handleValueChange('leaveType', v)} error={errors.leaveType} placeholder="เลือกประเภทการลา" required />
                <div className="grid grid-cols-2 gap-4">
                    <NativeDatePicker id="start-date" label="วันที่เริ่ม" value={values.startDate} onChange={(v) => handleValueChange('startDate', v)} error={errors.startDate} />
                    <NativeDatePicker id="end-date" label="วันที่สิ้นสุด" value={values.endDate} onChange={(v) => handleValueChange('endDate', v)} error={errors.endDate} min={values.startDate}/>
                </div>
                <InputField as="textarea" id="reason" label="เหตุผล (ถ้ามี)" value={values.reason} onChange={handleInputChange('reason')} rows={3} placeholder="รายละเอียดเพิ่มเติม..." />

                {conflictingBookings.length > 0 && (
                     <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-400 rounded-r-md">
                        <div className="flex items-start gap-3">
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-amber-800 dark:text-amber-200">มีงานที่ทับซ้อน</h3>
                                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                    ช่วงวันที่คุณลาทับซ้อนกับ {conflictingBookings.length} งานที่มีอยู่ โปรดติดต่อผู้จัดการของคุณ
                                </p>
                            </div>
                        </div>
                         <div className="mt-2 max-h-24 overflow-y-auto space-y-1 pr-2">
                            {conflictingBookings.map(booking => (
                                <div key={booking.id} className="text-xs text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 p-1.5 rounded">
                                    <span className="font-semibold">{booking.customer.name}</span> - {booking.bookingDate} @ {formatTime(booking.bookingTime)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="secondary" onClick={onClose} disabled={isSaving}>ยกเลิก</Button>
                    <Button onClick={handleSave} isLoading={isSaving}>ส่งคำขอ</Button>
                </div>
            </div>
        </Modal>
    );
};

export default RequestLeaveModal;