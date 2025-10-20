import React, { useState } from 'react';
import { StarIcon } from './icons';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (newRating: number) => void;
  isEditable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, isEditable = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const starValue = hoverRating || rating;
        return (
          <button
            key={star}
            type="button"
            disabled={!isEditable}
            onClick={() => onRatingChange && onRatingChange(star)}
            onMouseEnter={() => isEditable && setHoverRating(star)}
            onMouseLeave={() => isEditable && setHoverRating(0)}
            className={`text-amber-400 ${!isEditable ? 'cursor-default' : 'cursor-pointer'}`}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <StarIcon
              className={`${sizeClasses[size]} transition-colors ${
                starValue >= star ? 'fill-current' : 'text-slate-300 dark:text-slate-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;