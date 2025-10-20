import React from 'react';
import { Booking } from '../../types';
import StarRating from '../ui/StarRating';
import { formatDate } from '../../lib/utils';

interface FeedbackCardProps {
    booking: Booking;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ booking }) => {
    // Logic to separate staff notes from customer feedback remains the same.
    const notePrefix = `[บันทึกการทำงาน -`;
    const noteIndex = booking.notes?.indexOf(notePrefix);
    
    let customerNotes = booking.notes || null;
    if (noteIndex !== -1 && noteIndex !== undefined) {
      customerNotes = noteIndex > 0 ? booking.notes?.substring(0, noteIndex).trim() : null;
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
            {/* Header: Customer Info & Rating */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-tinedy-green text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {booking.customer.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{booking.customer.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-rule">
                            {formatDate(booking.bookingDate, { day: 'numeric', month: 'long', year: 'numeric' }, 'th-TH')}
                        </p>
                    </div>
                </div>
                {booking.rating !== null && booking.rating !== undefined && (
                    <StarRating rating={booking.rating} />
                )}
            </div>

            {/* Content: Feedback with blockquote style */}
            {customerNotes && (
                <blockquote className="mt-4 border-l-4 border-slate-200 dark:border-slate-700 pl-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic font-rule">
                        {customerNotes}
                    </p>
                </blockquote>
            )}
        </div>
    );
};

export default FeedbackCard;
