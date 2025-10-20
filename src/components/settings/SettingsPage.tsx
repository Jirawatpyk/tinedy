import React, { useState, useMemo } from 'react';
import { Tag as TagType, Customer } from '../../types';
import { CogIcon, PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '../ui/icons';
import Card from '../ui/Card';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import ConfirmationModal from '../ui/ConfirmationModal';

interface SettingsPageProps {
    tags: TagType[];
    customers: Customer[];
    onCreateTag: (name: string) => void;
    onUpdateTag: (params: { id: string; name: string }) => void;
    onDeleteTag: (tag: TagType) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ tags, customers, onCreateTag, onUpdateTag, onDeleteTag }) => {
    const [newTagName, setNewTagName] = useState('');
    const [editingTag, setEditingTag] = useState<{ id: string; name: string } | null>(null);
    const [tagToDelete, setTagToDelete] = useState<TagType | null>(null);

    const tagUsageCount = useMemo(() => {
        const counts = new Map<string, number>();
        customers.forEach(customer => {
            customer.tags?.forEach(tag => {
                counts.set(tag.id, (counts.get(tag.id) || 0) + 1);
            });
        });
        return counts;
    }, [customers]);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = newTagName.trim();
        if (trimmedName) {
            onCreateTag(trimmedName);
            setNewTagName('');
        }
    };

    const handleUpdate = () => {
        if (editingTag && editingTag.name.trim()) {
            onUpdateTag({ id: editingTag.id, name: editingTag.name.trim() });
            setEditingTag(null);
        }
    };

    const handleDeleteConfirm = () => {
        if (tagToDelete) {
            onDeleteTag(tagToDelete);
            setTagToDelete(null);
        }
    };
    
    return (
        <>
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="bg-tinedy-blue/20 p-3 rounded-lg">
                       <CogIcon className="w-8 h-8 text-tinedy-blue"/>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage global application settings.</p>
                    </div>
                </div>

                <Card>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">Tag Management</h2>
                    
                    <form onSubmit={handleCreate} className="flex items-start gap-2 mb-6">
                        <InputField
                            id="new-tag"
                            label="Create New Tag"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="e.g., VIP, High-Value"
                        />
                        <Button type="submit" className="mt-7">
                            <PlusIcon className="w-5 h-5" />
                        </Button>
                    </form>

                    <div className="space-y-2">
                        {tags.map(tag => (
                            <div key={tag.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                {editingTag?.id === tag.id ? (
                                    <div className="flex-grow flex items-center gap-2">
                                        <InputField
                                            id={`edit-tag-${tag.id}`}
                                            label=""
                                            value={editingTag.name}
                                            onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                                            className="py-1"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                        />
                                        <Button variant="icon" onClick={handleUpdate} aria-label="Save"><CheckIcon className="w-5 h-5 text-green-500" /></Button>
                                        <Button variant="icon" onClick={() => setEditingTag(null)} aria-label="Cancel"><XMarkIcon className="w-5 h-5 text-red-500" /></Button>
                                    </div>
                                ) : (
                                    <div className="flex-grow flex items-center gap-4">
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">{tag.name}</span>
                                        <span className="text-xs font-medium text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                            {tagUsageCount.get(tag.id) || 0} customers
                                        </span>
                                    </div>
                                )}
                                
                                {editingTag?.id !== tag.id && (
                                    <div className="flex items-center gap-2">
                                        <Button variant="icon" onClick={() => setEditingTag({ id: tag.id, name: tag.name })} aria-label="Edit tag">
                                            <PencilIcon className="w-4 h-4" />
                                        </Button>
                                        <Button variant="icon" onClick={() => setTagToDelete(tag)} aria-label="Delete tag">
                                            <TrashIcon className="w-4 h-4 text-red-500/80 hover:text-red-500" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                         {tags.length === 0 && (
                            <p className="text-center text-sm text-slate-500 py-8">No tags have been created yet.</p>
                        )}
                    </div>
                </Card>
            </div>
            {tagToDelete && (
                <ConfirmationModal
                    isOpen={!!tagToDelete}
                    onClose={() => setTagToDelete(null)}
                    onConfirm={handleDeleteConfirm}
                    title="Delete Tag"
                    message={
                        <>
                           <p>Are you sure you want to delete the tag <strong>"{tagToDelete.name}"</strong>?</p>
                           <p className="mt-2 text-sm text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 p-2 rounded-md">
                               This will remove the tag from all <strong>{tagUsageCount.get(tagToDelete.id) || 0}</strong> associated customers. This action cannot be undone.
                           </p>
                        </>
                    }
                    confirmButtonText="Delete"
                    confirmButtonVariant="danger"
                />
            )}
        </>
    );
};

export default SettingsPage;