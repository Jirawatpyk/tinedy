import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { as?: 'input' };
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { as: 'textarea' };

type InputFieldProps = {
    id: string;
    label: React.ReactNode;
    error?: string;
    hasError?: boolean;
    className?: string;
    endAdornment?: React.ReactNode;
} & (InputProps | TextareaProps);


const InputField = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputFieldProps
>(({
    id,
    label,
    error,
    hasError,
    className,
    endAdornment,
    ...props
}, ref) => {
    const baseClasses = "w-full px-3 py-2 border rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors";
    const errorClasses = "border-red-500 focus:border-red-500 focus:ring-red-500/50";
    const normalClasses = "border-slate-300 focus:border-tinedy-blue focus:ring-tinedy-blue/50";
    
    const isDisabled = 'disabled' in props && props.disabled;

    let stateClasses = '';
    if (isDisabled) {
        stateClasses = 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed';
    } else if ('type' in props && props.type !== 'password' && props.value) {
        // This styling is specific to the login page's pre-filled email
        stateClasses = 'bg-slate-100 dark:bg-slate-700';
    } else {
        stateClasses = 'bg-white dark:bg-slate-800';
    }
      
    const finalClasses = `${baseClasses} ${(error || hasError) ? errorClasses : normalClasses} ${stateClasses} ${endAdornment ? 'pr-10' : ''} ${className || ''}`;
    
    const renderInput = () => {
        if (props.as === 'textarea') {
            const { as, ...rest } = props;
            return <textarea id={id} className={finalClasses} ref={ref as React.Ref<HTMLTextAreaElement>} {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />;
        }
        const { as, ...rest } = props;
        return <input id={id} className={finalClasses} ref={ref as React.Ref<HTMLInputElement>} {...(rest as React.InputHTMLAttributes<HTMLInputElement>)} />;
    };

    return (
        <div>
             <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1">
                {label}
            </label>
            <div className="relative">
                {renderInput()}
                {endAdornment && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {endAdornment}
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
});

export default InputField;