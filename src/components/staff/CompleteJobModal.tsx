import React, { useState, useEffect } from 'react';
import { Booking } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface CompleteJobModalProps {
    booking: Booking | null;
    onClose: () => void;
    onConfirm: (completionNotes: string) => void;
    isCompleting: boolean;
}

const CompleteJobModal: React.FC<CompleteJobModalProps> = ({ booking, onClose, onConfirm, isCompleting }) => {
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (booking) {
            setNotes(''); // Reset notes when a new booking is being completed
        }
    }, [booking]);

    if (!booking) return null;

    const handleConfirm = () => {
        if (notes.trim()) {
            onConfirm(notes.trim());
        } else {
            // Optionally, show an error if notes are required
            onConfirm("ไม่มีบันทึกเพิ่มเติม");
        }
    };

    return (
        <Modal 
            isOpen={!!booking} 
            onClose={onClose} 
            title="ยืนยันการจบงาน"
            size="md"
        >
            <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    โปรดเพิ่มบันทึกการทำงานสำหรับลูกค้า <strong>{booking.customer.name}</strong> ก่อนยืนยันจบงาน
                </p>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-32 p-2 border rounded-md text-sm transition-colors bg-white text-slate-900 placeholder-slate-400 border-slate-300 focus:outline-none focus:ring-2 focus:ring-tinedy-blue/50 focus:border-tinedy-blue dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500"
                    placeholder="เช่น: งานเสร็จเรียบร้อยดี ลูกค้าพอใจมาก"
                />
                 <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={onClose} disabled={isCompleting}>
                        ยกเลิก
                    </Button>
                    <Button onClick={handleConfirm} isLoading={isCompleting}>
                        ยืนยันจบงาน
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default CompleteJobModal;