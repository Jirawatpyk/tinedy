import React, { useState } from 'react';
import { Booking, BookingStatus } from '../../types';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface ChangeStatusModalProps {
    booking: Booking | null;
    onClose: () => void;
    onUpdate: (bookingId: string, status: BookingStatus) => void;
}

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({ booking, onClose, onUpdate }) => {
    if (!booking) return null;
    const [status, setStatus] = useState(booking.status);
    const statusOptions = Object.values(BookingStatus).map(s => ({value: s, label: s}));
    
    const handleUpdate = () => {
        onUpdate(booking.id, status);
    };

    return (
        <Modal isOpen={!!booking} onClose={onClose} title="Change Booking Status" size="sm">
             <p className="mb-4 text-sm text-slate-600">Update status for booking for <strong>{booking.customer.name}</strong>.</p>
             <Select id="status-select" label="New Status" options={statusOptions} value={status} onChange={(v) => setStatus(v as BookingStatus)} />
             <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleUpdate}>Update Status</Button>
            </div>
        </Modal>
    );
};

export default ChangeStatusModal;