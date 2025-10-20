import React, { useState, useRef, useEffect, ReactNode, useContext } from 'react';
import { createPortal } from 'react-dom';
import { EllipsisVerticalIcon } from './icons';

// 1. Create a context to pass the onClose function down
const DropdownContext = React.createContext<{ onClose: () => void } | null>(null);

interface DropdownMenuProps {
  trigger?: ReactNode;
  children: ReactNode;
}

// Create a reusable item for the dropdown
interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    className?: string;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ children, className, ...props }) => {
    // 2. Consume the context to get the onClose function
    const context = useContext(DropdownContext);
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Run the original onClick passed in props
        if (props.onClick) {
            props.onClick(e);
        }
        // Always call onClose from the context afterwards to close the menu
        context?.onClose();
    };

    return (
        <button
            {...props}
            onClick={handleClick} // Use the new combined handler
            className={`w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
            role="menuitem"
        >
            {children}
        </button>
    );
};

const DropdownMenuContent: React.FC<{
    children: React.ReactNode;
    targetRect: DOMRect | null;
    onClose: () => void;
    triggerRef: React.RefObject<HTMLDivElement>;
}> = ({ children, targetRect, onClose, triggerRef }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    // Start with the menu completely hidden to prevent any layout shifts
    const [style, setStyle] = useState<React.CSSProperties>({
        opacity: 0,
        visibility: 'hidden',
        position: 'fixed',
    });

    // Effect for handling clicks outside the menu to close it
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

    // Effect for calculating the optimal position of the menu
    useEffect(() => {
        if (!menuRef.current || !targetRect) return;

        const menuDimensions = menuRef.current.getBoundingClientRect();
        // Use documentElement.client... to get viewport size excluding scrollbars, preventing jitter.
        const viewportHeight = document.documentElement.clientHeight;
        const viewportWidth = document.documentElement.clientWidth;
        const margin = 8;

        // --- Vertical Positioning ---
        let top = targetRect.bottom + 4;
        if (top + menuDimensions.height > viewportHeight - margin) {
            top = targetRect.top - menuDimensions.height - 4;
        }
        if (top < margin) {
            top = margin;
        }

        // --- Horizontal Positioning (No transform) ---
        let left = targetRect.right - menuDimensions.width; // Default: align right edges
        if (left < margin) {
            left = targetRect.left; // Switch to aligning left edges if overflowing
        }
        if (left + menuDimensions.width > viewportWidth - margin) {
            left = viewportWidth - menuDimensions.width - margin; // Clamp to right edge if still overflowing
        }
        
        // Defer the visual update to the next frame. This is the key to preventing the scrollbar flicker.
        requestAnimationFrame(() => {
            setStyle({
                position: 'fixed',
                top: `${top}px`,
                left: `${left}px`,
                zIndex: 30,
                opacity: 1,
                visibility: 'visible',
            });
        });

    }, [targetRect]);


    if (!targetRect) return null;

    // 3. Remove the old `childrenWithClickHandler` logic
    
    return createPortal(
        // 4. Wrap the menu content with the context provider
        <DropdownContext.Provider value={{ onClose }}>
            <div
              ref={menuRef}
              style={style}
              className="w-48 bg-white dark:bg-slate-800 rounded-md shadow-2xl ring-1 ring-black ring-opacity-5 dark:ring-white/10 z-50 animate-fade-in-up"
              role="menu"
            >
              <div className="py-1" role="menu" aria-orientation="vertical">
                {children}
              </div>
            </div>
        </DropdownContext.Provider>,
        document.body
    );
};


const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const triggerWrapperRef = useRef<HTMLDivElement>(null);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prevIsOpen => {
      if (!prevIsOpen && triggerWrapperRef.current) {
        setTargetRect(triggerWrapperRef.current.getBoundingClientRect());
      }
      return !prevIsOpen;
    });
  };

  const defaultTrigger = (
    <button
      className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-tinedy-blue focus:ring-offset-2"
      aria-haspopup="true"
      aria-expanded={isOpen}
      aria-label="Actions"
    >
      <EllipsisVerticalIcon className="w-5 h-5" />
    </button>
  );

  return (
    <div className="inline-block" ref={triggerWrapperRef}>
      {React.cloneElement(trigger ? (trigger as React.ReactElement) : defaultTrigger, { onClick: handleTriggerClick })}
      
      {isOpen && (
        <DropdownMenuContent
          children={children}
          targetRect={targetRect}
          onClose={() => setIsOpen(false)}
          triggerRef={triggerWrapperRef}
        />
      )}
    </div>
  );
};

export default DropdownMenu;