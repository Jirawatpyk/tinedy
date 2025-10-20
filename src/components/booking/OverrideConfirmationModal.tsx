import React, { useState, useEffect } from 'react';
import { StaffSuggestion } from '../../hooks/useStaffSuggestions';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import { ExclamationTriangleIcon } from '../ui/icons';

interface OverrideConfirmationModalProps {
    suggestion: StaffSuggestion | null;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

const OverrideConfirmationModal: React.FC<OverrideConfirmationModalProps> = ({ suggestion, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');

    useEffect(() => {
        // Reset reason when modal opens for a new suggestion
        if (suggestion) {
            setReason('');
        }
    }, [suggestion]);

    const handleConfirm = () => {
        if (reason.trim()) {
            onConfirm(reason.trim());
        }
    };
    
    if (!suggestion) {
        return null;
    }

    return (
        <Modal isOpen={!!suggestion} onClose={onClose} title="Assignment Conflict Detected" size="md">
            <div className="space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-400 rounded-r-md">
                    <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon className="w-6 h-6 text-amber-500 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-amber-800 dark:text-amber-200">Potential Conflict</h3>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                You are assigning <strong>{suggestion.staff.name}</strong>, who has a potential conflict: <strong>"{suggestion.reason}"</strong>.
                            </p>
                        </div>
                    </div>
                </div>

                <InputField
                    as="textarea"
                    id="override-reason"
                    label="Reason for Override"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Customer request, staff is nearby, emergency cover..."
                    rows={3}
                    required
                />
                 <p className="text-xs text-slate-500">
                    Please provide a reason to proceed with this assignment. This will be recorded in the audit log.
                </p>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleConfirm}
                        disabled={!reason.trim()}
                    >
                        Confirm Assignment
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default OverrideConfirmationModal;