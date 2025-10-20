import React, { useRef } from 'react';
import { XMarkIcon } from './icons';

interface NativeDatePickerProps {
    id: string;
    label: React.ReactNode;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    className?: string;
    min?: string;
    disabled?: boolean;
}

const NativeDatePicker: React.FC<NativeDatePickerProps> = ({
    id,
    label,
    value,
    onChange,
    error,
    className,
    min,
    disabled = false,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.type = 'date';
        try {
            e.target.showPicker();
        } catch (err) {
            // Fails gracefully on browsers that don't support showPicker()
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (!e.target.value) {
            e.target.type = 'text';
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        if (inputRef.current) {
            inputRef.current.type = 'text';
        }
    };
    
    const baseClasses = "w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors";
    const errorClasses = "border-red-500 focus:border-red-500 ring-red-500/50";
    const normalClasses = "border-slate-300 focus:border-tinedy-blue ring-tinedy-blue/50";
    const disabledClasses = "bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed text-slate-500 dark:text-slate-400";

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    ref={inputRef}
                    id={id}
                    type={value ? 'date' : 'text'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    min={min}
                    placeholder="DD / MM / YYYY"
                    disabled={disabled}
                    className={`${baseClasses} ${error ? errorClasses : normalClasses} ${disabled ? disabledClasses : ''}`}
                />
                {value && !disabled && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="cursor-pointer text-slate-500 hover:text-slate-700"
                            aria-label="Clear date"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
};

export default NativeDatePicker;