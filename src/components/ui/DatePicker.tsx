import React from 'react';
import InputField from './InputField';
import { CalendarDaysIcon, XMarkIcon } from './icons';

interface DatePickerProps {
    id: string;
    label: React.ReactNode;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    className?: string;
    min?: string;
    placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
    id,
    label,
    value,
    onChange,
    error,
    className,
    min,
    placeholder = 'DD / MM / YYYY'
}) => {
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.type = 'date';
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (!e.target.value) {
            e.target.type = 'text';
        }
    };

    const adornment = value ? (
        <button
            type="button"
            onClick={() => onChange('')}
            className="cursor-pointer text-slate-500 hover:text-slate-700"
            aria-label="Clear date"
        >
            <XMarkIcon className="h-5 w-5" />
        </button>
    ) : null;

    return (
        <div className={className}>
            <InputField
                id={id}
                label={label}
                type={value ? 'date' : 'text'}
                value={value}
                onChange={(e) => onChange((e.target as HTMLInputElement).value)}
                error={error}
                min={min}
                placeholder={placeholder}
                onFocus={handleFocus}
                onBlur={handleBlur}
                endAdornment={adornment}
            />
        </div>
    );
};

export default DatePicker;