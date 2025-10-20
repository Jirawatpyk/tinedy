import React from 'react';

const Spinner: React.FC<{ variant?: 'light' | 'dark' }> = ({ variant = 'light' }) => (
    <svg className={`animate-spin h-5 w-5 ${variant === 'light' ? 'text-white' : 'text-tinedy-blue'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className,
  ...props
}) => {
    const baseClasses = "inline-flex items-center justify-center font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:cursor-not-allowed relative";

    const variantClasses: Record<ButtonVariant, string> = {
        primary: 'bg-tinedy-blue text-white hover:bg-tinedy-blue/90 focus:ring-tinedy-blue disabled:bg-slate-400',
        secondary: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-tinedy-blue disabled:bg-slate-100 disabled:text-slate-400',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
        icon: 'text-slate-500 hover:text-tinedy-blue hover:bg-tinedy-blue/10 focus:ring-tinedy-blue rounded-full disabled:text-slate-300 disabled:bg-transparent',
    };
    
    const sizeClasses = variant === 'icon' ? 'p-2' : 'py-2 px-4 text-sm';
    const spinnerColor = (variant === 'secondary' || variant === 'icon') ? 'dark' : 'light';

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses} ${className || ''}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Spinner variant={spinnerColor} />
                </div>
            )}
            <span className={`flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>{children}</span>
        </button>
    );
};

export default Button;
