import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { StaffMember, User } from '../../types';
import Button from './Button';
import { PaperAirplaneIcon } from './icons';

interface MentionTextareaProps {
    value: string;
    onChange: (value: string) => void;
    onPost: () => void;
    staffList: StaffMember[];
    isPosting: boolean;
    currentUser: User;
}

const MentionTextarea: React.FC<MentionTextareaProps> = ({ value, onChange, onPost, staffList, isPosting, currentUser }) => {
    const [mentionQuery, setMentionQuery] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mentionStartPosition = useRef<number | null>(null);

    // Auto-resize textarea height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    const filteredStaff = useMemo(() => {
        const lowerCaseQuery = mentionQuery.toLowerCase();
        return staffList.filter(s =>
            s.id !== currentUser.id &&
            s.name.toLowerCase().includes(lowerCaseQuery)
        );
    }, [mentionQuery, staffList, currentUser.id]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showMentions && filteredStaff.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % filteredStaff.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + filteredStaff.length) % filteredStaff.length);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                handleSelectMention(filteredStaff[activeIndex]);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowMentions(false);
            }
        } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onPost();
        }
    }, [showMentions, filteredStaff, activeIndex, onPost]);

    const handleSelectMention = (staff: StaffMember) => {
        if (mentionStartPosition.current === null) return;
        const textBefore = value.substring(0, mentionStartPosition.current);
        const textAfter = value.substring(textareaRef.current?.selectionStart || value.length);
        const newText = `${textBefore}@${staff.name} ${textAfter}`;
        onChange(newText);
        setShowMentions(false);
        setMentionQuery('');
        setTimeout(() => textareaRef.current?.focus(), 0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        onChange(text);

        const cursorPos = e.target.selectionStart;
        const textBeforeCursor = text.substring(0, cursorPos);
        const atMatch = textBeforeCursor.match(/@([\w\s]*)$/);

        if (atMatch) {
            setShowMentions(true);
            setMentionQuery(atMatch[1]);
            mentionStartPosition.current = cursorPos - atMatch[1].length - 1;
            setActiveIndex(0);
        } else {
            setShowMentions(false);
            setMentionQuery('');
        }
    };

    return (
        <div className="relative">
            {showMentions && filteredStaff.length > 0 && (
                <div className="absolute bottom-full mb-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredStaff.map((staff, index) => (
                        <button
                            key={staff.id}
                            type="button"
                            onClick={() => handleSelectMention(staff)}
                            className={`w-full text-left p-2 text-sm flex items-center gap-2 ${activeIndex === index ? 'bg-tinedy-blue/10' : ''}`}
                        >
                           <div className="w-6 h-6 rounded-full bg-tinedy-green text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                                {staff.name.charAt(0)}
                            </div>
                            <span>{staff.name}</span>
                        </button>
                    ))}
                </div>
            )}
            <div className="flex items-end gap-3">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a comment..."
                    className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-md border-transparent focus:ring-tinedy-blue focus:border-tinedy-blue focus:bg-white dark:focus:bg-slate-900 text-sm resize-none transition-colors max-h-40 overflow-y-auto"
                    rows={1}
                    disabled={isPosting}
                />
                <Button
                    type="button"
                    onClick={onPost}
                    isLoading={isPosting}
                    disabled={!value.trim() || isPosting}
                    aria-label="Post comment"
                    className="flex-shrink-0"
                >
                    <PaperAirplaneIcon className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
};

export default MentionTextarea;