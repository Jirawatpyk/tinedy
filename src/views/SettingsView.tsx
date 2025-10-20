import React from 'react';
import { ToastType, Tag as TagType, Customer } from '../types';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '../hooks/useTags';
import { useCustomers } from '../hooks/useCustomers';
import SettingsPage from '../components/settings/SettingsPage';
import Loader from '../components/ui/Loader';

interface SettingsViewProps {
    addToast: (message: string, type: ToastType, title: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ addToast }) => {
    const { data: tags = [], isLoading: isLoadingTags } = useTags();
    const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers();

    const { mutate: createTag } = useCreateTag({
        onSuccess: (newTag) => addToast(`Tag "${newTag.name}" created.`, 'success', 'Tag Created'),
        onError: (error) => addToast(error.message, 'error', 'Creation Failed'),
    });

    const { mutate: updateTag } = useUpdateTag({
        onSuccess: (updatedTag) => addToast(`Tag "${updatedTag.name}" updated.`, 'success', 'Tag Updated'),
        onError: (error) => addToast(error.message, 'error', 'Update Failed'),
    });

    const { mutate: deleteTag } = useDeleteTag({
        onSuccess: (deletedTag) => addToast(`Tag "${deletedTag.name}" deleted.`, 'success', 'Tag Deleted'),
        onError: (error) => addToast(error.message, 'error', 'Deletion Failed'),
    });

    if (isLoadingTags || isLoadingCustomers) {
        return <Loader />;
    }

    const handleTypedDelete = (tag: TagType) => {
        deleteTag(tag);
    };

    return (
        <SettingsPage
            tags={tags}
            customers={customers}
            onCreateTag={createTag}
            onUpdateTag={updateTag}
            onDeleteTag={handleTypedDelete}
        />
    );
};

export default SettingsView;