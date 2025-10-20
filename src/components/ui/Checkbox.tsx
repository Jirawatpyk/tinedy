import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Can be extended with label, etc. in the future
}

const Checkbox: React.FC<CheckboxProps> = ({ className, ...props }) => {
  return (
    <input
      type="checkbox"
      className={`h-4 w-4 rounded border-slate-300 text-tinedy-blue focus:ring-tinedy-blue focus:ring-offset-0 focus:ring-2 ${className || ''}`}
      {...props}
    />
  );
};

export default Checkbox;
