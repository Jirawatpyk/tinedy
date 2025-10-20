import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, ChevronUpIcon } from './icons';

interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    id: string;
    label: React.ReactNode;
    options: SelectOption[];
    value: string | number;
    onChange: (value: string) => void;
    error?: string;
    hasError?: boolean;
    wrapperClassName?: string;
    icon?: React.ReactNode;
    placeholder?: string;
}

interface SelectMenuProps {
    options: SelectOption[];
    onSelect: (value: string | number) => void;
    selectedValue: string | number;
    targetRect: DOMRect | null;
    placeholder?: string;
    required?: boolean;
    onClose: () => void;
    triggerRef: React.RefObject<HTMLButtonElement>;
}


const SelectMenu: React.FC<SelectMenuProps> = ({ options, onSelect, selectedValue, targetRect, placeholder, required, onClose, triggerRef }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({
        opacity: 0, // Start invisible to calculate position without flicker
        position: 'fixed',
        zIndex: 50,
        width: targetRect ? `${targetRect.width}px` : 'auto',
    });

    // Effect to calculate and set the final position
    useEffect(() => {
        if (!menuRef.current || !targetRect) return;

        const menuRect = menuRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const margin = 8; // Small margin from viewport edges

        // Default position is below the trigger
        let top = targetRect.bottom + 4;
        const spaceBelow = viewportHeight - targetRect.bottom;
        const spaceAbove = targetRect.top;

        // If there's not enough space below AND there is more space above, flip it
        if (spaceBelow < (menuRect.height + margin) && spaceAbove > spaceBelow) {
            top = targetRect.top - menuRect.height - 4;
        }
        
        // Clamp to top of viewport if it's still too high
        if (top < margin) {
            top = margin;
        }

        // Defer style update to next animation frame to ensure correct dimensions are used
        requestAnimationFrame(() => {
            setStyle({
                position: 'fixed',
                top: `${top}px`,
                left: `${targetRect.left}px`,
                width: `${targetRect.width}px`,
                zIndex: 50,
                opacity: 1, // Make it visible
            });
        });

    }, [targetRect]);

    // Effect for handling clicks outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (triggerRef.current && triggerRef.current.contains(event.target as Node)) {
                return;
            }
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, triggerRef]);

    if (!targetRect) return null;

    return createPortal(
        <div
            ref={menuRef}
            // Add transition-opacity for a smoother fade-in
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg animate-fade-in-up transition-opacity"
            style={style}
            role="listbox"
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className="max-h-60 overflow-y-auto">
                {placeholder && !required && (
                    <div
                        onClick={() => onSelect('')}
                        className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:bg-tinedy-blue/10 dark:hover:bg-tinedy-blue/20 hover:text-tinedy-blue dark:hover:text-sky-300 cursor-pointer transition-colors duration-150"
                        role="option"
                        aria-selected={!selectedValue}
                    >
                        {placeholder}
                    </div>
                )}
                {options.map(option => (
                    <div
                        key={option.value}
                        onClick={() => onSelect(option.value)}
                        className={`px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-tinedy-blue/10 dark:hover:bg-tinedy-blue/20 hover:text-tinedy-blue dark:hover:text-sky-300 cursor-pointer transition-colors duration-150 ${selectedValue === option.value ? 'bg-tinedy-blue/10 dark:bg-tinedy-blue/20 font-semibold text-tinedy-blue dark:text-sky-300' : ''}`}
                        role="option"
                        aria-selected={selectedValue === option.value}
                    >
                        {option.label}
                    </div>
                ))}
            </div>
        </div>,
        document.body
    );
};


const Select: React.FC<SelectProps> = ({
    id,
    label,
    options,
    value,
    onChange,
    error,
    hasError,
    className,
    wrapperClassName,
    icon,
    placeholder,
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    
    const selectedOption = useMemo(() => options.find(opt => opt.value === value), [options, value]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    const toggleOpen = () => {
        setIsOpen(prevIsOpen => {
            if (!prevIsOpen && buttonRef.current) {
                setTargetRect(buttonRef.current.getBoundingClientRect());
            }
            return !prevIsOpen;
        });
    };
    
    const handleSelect = (optionValue: string | number) => {
        onChange(String(optionValue));
        handleClose();
    };

    const finalClasses = `w-full py-2 bg-white dark:bg-slate-800 border rounded-lg focus:outline-none focus:ring-2 transition-colors cursor-pointer flex items-center justify-between ${icon ? 'pl-10' : 'pl-3'} pr-3 ${className || ''}`;
    const stateClasses = (error || hasError) ? 'border-red-500 focus:border-red-500 ring-red-500/50' : 'border-slate-300 dark:border-slate-700 focus:border-tinedy-blue ring-tinedy-blue/50';

    return (
        <div className={wrapperClassName}>
            {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
            <div className="relative">
                {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">{icon}</div>}
                
                <button
                    ref={buttonRef}
                    type="button"
                    id={id}
                    className={`${finalClasses} ${stateClasses}`}
                    onClick={toggleOpen}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    {...(props as any)}
                >
                    <span className={selectedOption ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}>
                        {selectedOption?.label || placeholder || 'Select an option'}
                    </span>
                    {isOpen ? <ChevronUpIcon className="w-5 h-5 text-slate-400" /> : <ChevronDownIcon className="w-5 h-5 text-slate-400" />}
                </button>

                {isOpen && (
                    <SelectMenu
                        options={options}
                        onSelect={handleSelect}
                        selectedValue={value}
                        targetRect={targetRect}
                        placeholder={placeholder}
                        required={props.required}
                        onClose={handleClose}
                        triggerRef={buttonRef}
                    />
                )}
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
};

export default Select;