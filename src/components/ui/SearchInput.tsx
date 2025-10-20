import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from './icons';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, className, ...props }) => {
  return (
    <div className={`relative ${className || ''}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-300 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-tinedy-blue/50 focus:border-tinedy-blue transition-colors"
        {...props}
      />
      {value && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
