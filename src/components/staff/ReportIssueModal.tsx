import React, { useState, useEffect, useMemo } from 'react';
import { Booking, JobIssue, IssueCategory, IssueSeverity } from '../../types';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import InputField from '../ui/InputField';

interface ReportIssueModalProps {
    booking: Booking | null;
    onClose: () => void;
    onConfirm: (issueData: Omit<JobIssue, 'id' | 'createdAt' | 'reportedByStaffId' | 'status'>) => void;
    isReporting: boolean;
}

interface ReportIssueFormState {
    category: IssueCategory | '';
    severity: IssueSeverity | '';
    description: string;
}

const validationSchema: ValidationSchema<ReportIssueFormState> = {
    category: { required: 'กรุณาเลือกประเภทปัญหา' },
    severity: { required: 'กรุณาเลือกระดับความรุนแรง' },
    description: { required: 'กรุณากรอกรายละเอียดปัญหา' },
};

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ booking, onClose, onConfirm, isReporting }) => {
    const initialFormState = useMemo(() => ({
        category: '' as '',
        severity: '' as '',
        description: '',
    }), []);
    
    const { values, errors, validate, handleValueChange, handleInputChange, resetForm } = useFormValidation(initialFormState, validationSchema);

    useEffect(() => {
        if (booking) {
            resetForm();
        }
    }, [booking, resetForm]);

    if (!booking) return null;

    const handleConfirm = () => {
        if (validate()) {
            onConfirm({
                bookingId: booking.id,
                category: values.category as IssueCategory,
                severity: values.severity as IssueSeverity,
                description: values.description,
            });
        }
    };
    
    const categoryOptions = Object.values(IssueCategory).map(c => ({ value: c, label: c }));
    const severityOptions = Object.values(IssueSeverity).map(s => ({ value: s, label: s }));

    return (
        <Modal 
            isOpen={!!booking} 
            onClose={onClose} 
            title="รายงานปัญหา"
            size="md"
        >
            <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    รายงานปัญหาที่พบสำหรับงานของ <strong>{booking.customer.name}</strong>
                </p>
                <Select
                    id="issue-category"
                    label="ประเภทปัญหา"
                    options={categoryOptions}
                    value={values.category}
                    onChange={(v) => handleValueChange('category', v as IssueCategory)}
                    error={errors.category}
                    placeholder="เลือกประเภท"
                    required
                />
                 <Select
                    id="issue-severity"
                    label="ระดับความรุนแรง"
                    options={severityOptions}
                    value={values.severity}
                    onChange={(v) => handleValueChange('severity', v as IssueSeverity)}
                    error={errors.severity}
                    placeholder="เลือกระดับความรุนแรง"
                    required
                />
                <InputField
                    as="textarea"
                    id="issue-description"
                    label="รายละเอียดปัญหา"
                    value={values.description}
                    onChange={handleInputChange('description')}
                    error={errors.description}
                    rows={4}
                    placeholder="กรุณาอธิบายปัญหาที่พบ..."
                    required
                />

                 <div className="flex justify-end gap-3 pt-4">
                    <Button variant="secondary" onClick={onClose} disabled={isReporting}>
                        ยกเลิก
                    </Button>
                    <Button onClick={handleConfirm} isLoading={isReporting}>
                        ส่งรายงาน
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ReportIssueModal;
