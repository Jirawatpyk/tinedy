import React, { useState } from 'react';
import { Customer, ToastType } from '../../types';
import { useUpdateCustomerNotes } from '../../hooks/useCustomers';
import Button from '../ui/Button';

interface CustomerNotesProps {
    customer: Customer;
    addToast: (message: string, type: ToastType, title: string) => void;
}

const CustomerNotes: React.FC<CustomerNotesProps> = ({ customer, addToast }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [notes, setNotes] = useState(customer.notes || '');

    // FIX: Use `isPending` for loading state from TanStack Query v5 mutations and alias it to `isLoading`.
    const { mutate: updateNotes, isPending: isLoading } = useUpdateCustomerNotes({
        onSuccess: () => {
            addToast('Notes saved successfully.', 'success', 'Saved');
            setIsEditing(false);
        },
        onError: (error) => {
            addToast(error.message, 'error', 'Error');
        }
    });

    const handleSave = () => {
        updateNotes({ customerId: customer.id, notes: notes.trim() });
    };

    const handleCancel = () => {
        setNotes(customer.notes || '');
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="space-y-3">
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-32 p-2 border rounded-md text-sm transition-colors bg-white text-slate-900 placeholder-slate-400 border-slate-300 focus:outline-none focus:ring-2 focus:ring-tinedy-blue/50 focus:border-tinedy-blue dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500"
                    placeholder="Add notes about this customer..."
                />
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleSave} isLoading={isLoading}>Save Notes</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg min-h-[100px] group relative">
            {customer.notes ? (
                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{customer.notes}</p>
            ) : (
                <p className="text-sm text-slate-400 italic">No notes have been added for this customer.</p>
            )}
            <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1"
            >
                Edit
            </Button>
        </div>
    );
};

export default CustomerNotes;