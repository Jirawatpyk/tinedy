import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useUiStore } from '../../store/uiStore';
import { useCommands, Command } from '../../hooks/useCommands';
import { useDebounce } from '../../hooks/useDebounce';
import { MagnifyingGlassIcon } from '../ui/icons';

const CommandPalette: React.FC = () => {
    const { isCommandPaletteOpen, closeAllModals } = useUiStore();
    const commands = useCommands();
    
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(0);
    const debouncedSearch = useDebounce(search, 100);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Focus input when palette opens
    useEffect(() => {
        if (isCommandPaletteOpen) {
            inputRef.current?.focus();
            setSelected(0);
            setSearch('');
        }
    }, [isCommandPaletteOpen]);

    const filteredCommands = useMemo(() => {
        if (!debouncedSearch) {
            return commands;
        }
        const lowerCaseSearch = debouncedSearch.toLowerCase();
        return commands.filter(cmd => 
            cmd.title.toLowerCase().includes(lowerCaseSearch) ||
            cmd.section.toLowerCase().includes(lowerCaseSearch) ||
            (cmd.subtitle && cmd.subtitle.toLowerCase().includes(lowerCaseSearch))
        );
    }, [debouncedSearch, commands]);

    const groupedCommands = useMemo(() => {
        return filteredCommands.reduce((acc, cmd) => {
            if (!acc[cmd.section]) {
                acc[cmd.section] = [];
            }
            acc[cmd.section].push(cmd);
            return acc;
        }, {} as Record<string, Command[]>);
    }, [filteredCommands]);

    const flatCommands = useMemo(() => Object.values(groupedCommands).flat(), [groupedCommands]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelected(prev => (prev + 1) % flatCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelected(prev => (prev - 1 + flatCommands.length) % flatCommands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (flatCommands[selected]) {
                    flatCommands[selected].action();
                }
            } else if (e.key === 'Escape') {
                closeAllModals();
            }
        };

        if (isCommandPaletteOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isCommandPaletteOpen, flatCommands, selected, closeAllModals]);

    // Scroll selected item into view
    useEffect(() => {
        const selectedElement = document.getElementById(`command-item-${selected}`);
        selectedElement?.scrollIntoView({ block: 'nearest' });
    }, [selected]);
    
    if (!isCommandPaletteOpen) {
        return null;
    }

    return createPortal(
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start pt-[20vh]"
            onClick={closeAllModals}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative border-b border-slate-200 dark:border-slate-700">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Type a command or search..."
                        className="w-full bg-transparent border-none p-4 pl-11 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-0"
                    />
                </div>
                <div ref={listRef} className="max-h-[40vh] overflow-y-auto p-2">
                    {flatCommands.length > 0 ? (
                        // FIX: Explicitly cast the result of Object.entries to fix the 'unknown' type error.
                        (Object.entries(groupedCommands) as [string, Command[]][]).map(([section, cmds]) => (
                            <div key={section} className="mb-2">
                                <h3 className="text-xs font-semibold text-slate-400 px-2 my-1">{section}</h3>
                                {cmds.map(cmd => {
                                    const currentIndex = flatCommands.findIndex(c => c.id === cmd.id);
                                    return (
                                        <button
                                            id={`command-item-${currentIndex}`}
                                            key={cmd.id}
                                            onClick={cmd.action}
                                            className={`w-full flex items-center gap-3 p-2 rounded-md text-left ${selected === currentIndex ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
                                        >
                                            <cmd.icon className="w-5 h-5 text-slate-500" />
                                            <div>
                                                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{cmd.title}</p>
                                                {cmd.subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{cmd.subtitle}</p>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-slate-500 py-8">No results found.</p>
                    )}
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 p-2 text-xs text-slate-500 flex justify-end gap-3">
                    <span><kbd className="font-sans bg-slate-200 dark:bg-slate-600 rounded p-1">↑↓</kbd> to navigate</span>
                    <span><kbd className="font-sans bg-slate-200 dark:bg-slate-600 rounded p-1">↵</kbd> to select</span>
                    <span><kbd className="font-sans bg-slate-200 dark:bg-slate-600 rounded p-1">esc</kbd> to close</span>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CommandPalette;