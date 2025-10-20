import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  offLabel: string;
  onLabel: string;
  id: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, offLabel, onLabel, id }) => {
  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm font-semibold transition-colors ${!checked ? 'text-tinedy-blue' : 'text-slate-500'}`}>{offLabel}</span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`${checked ? 'bg-tinedy-blue' : 'bg-slate-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-tinedy-blue focus:ring-offset-2`}
      >
        <span
          aria-hidden="true"
          className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
       <span className={`text-sm font-semibold transition-colors ${checked ? 'text-tinedy-blue' : 'text-slate-500'}`}>{onLabel}</span>
    </div>
  );
};

export default Switch;
