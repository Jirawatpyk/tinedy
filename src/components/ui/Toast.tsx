import React, { useEffect } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from './icons';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 7000); // Auto-dismiss after 7 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed top-5 right-5 z-50 w-full max-w-sm animate-fade-in-up"
      role="alert"
      aria-live="assertive"
    >
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg shadow-lg flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-grow">
          <p className="font-bold text-amber-800">Demo Mode Active</p>
          <p className="text-sm text-amber-700">{message}</p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1 text-amber-500 hover:bg-amber-200 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
