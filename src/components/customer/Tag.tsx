import React from 'react';
import { XMarkIcon } from '../ui/icons';

interface TagProps {
  text: string;
  onRemove?: () => void;
  color?: string; // e.g., 'blue', 'green', 'red'
}

const Tag: React.FC<TagProps> = ({ text, onRemove, color = 'gray' }) => {
  const colorClasses: Record<string, string> = {
    gray: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        colorClasses[color] || colorClasses.gray
      }`}
    >
      {text}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1.5 flex-shrink-0 p-0.5 rounded-full inline-flex items-center justify-center text-inherit hover:bg-black/10 focus:outline-none"
          aria-label={`Remove tag ${text}`}
        >
          <XMarkIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default Tag;