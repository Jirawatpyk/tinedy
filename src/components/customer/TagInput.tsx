import React, { useState, KeyboardEvent } from 'react';
import Tag from './Tag';
import { TagIcon } from '../ui/icons';
import { Tag as TagType } from '../../types';

interface TagInputProps {
  tags: TagType[];
  onTagAdd: (tagName: string) => void;
  onTagRemove: (tag: TagType) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onTagAdd,
  onTagRemove,
  placeholder = 'Add a tag...',
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    const newTagName = inputValue.trim();
    if (newTagName && !tags.some(t => t.name.toLowerCase() === newTagName.toLowerCase())) {
      onTagAdd(newTagName);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      onTagRemove(tags[tags.length - 1]);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-tinedy-blue/50 focus-within:border-tinedy-blue">
        <TagIcon className="w-4 h-4 text-slate-400 ml-1 flex-shrink-0" />
        {tags.map((tag) => (
          <Tag key={tag.id} text={tag.name} onRemove={() => onTagRemove(tag)} />
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-grow bg-transparent focus:outline-none text-sm p-1 min-w-[100px]"
        />
      </div>
    </div>
  );
};

export default TagInput;