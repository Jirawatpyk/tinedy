import { useState } from 'react';

/**
 * A generic hook to manage modal states for CRUD actions on an EXISTING item.
 * The state for "add" modals is now handled globally in `uiStore` to allow
 * triggering from anywhere (e.g., Command Palette).
 */
export const useCrudModals = <T>() => {
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const [deletingItem, setDeletingItem] = useState<T | null>(null);
    const [viewingItem, setViewingItem] = useState<T | null>(null);

    const handleOpenEditModal = (item: T) => {
        setEditingItem(item);
    };

    const handleOpenDeleteModal = (item: T) => {
        setDeletingItem(item);
    };
    
    const handleOpenViewModal = (item: T) => {
        setViewingItem(item);
    };

    const handleCloseModals = () => {
        setEditingItem(null);
        setDeletingItem(null);
        setViewingItem(null);
    };

    return {
        editingItem,
        deletingItem,
        viewingItem,
        handleOpenEditModal,
        handleOpenDeleteModal,
        handleOpenViewModal,
        handleCloseModals,
    };
};