import React from 'react';
import { Customer, Tag, ToastType } from '../../types';
import { useAddTagToCustomer, useRemoveTagFromCustomer } from '../../hooks/useTags';
import TagInput from './TagInput';

interface CustomerTagsProps {
    customer: Customer;
    addToast: (message: string, type: ToastType, title: string) => void;
}

const CustomerTags: React.FC<CustomerTagsProps> = ({ customer, addToast }) => {
    const { mutate: addTag } = useAddTagToCustomer({
        onSuccess: (newTag) => {
            addToast(`Tag "${newTag.name}" added.`, 'success', 'Tag Added');
        },
        onError: (error) => {
            addToast(error.message, 'error', 'Error Adding Tag');
        }
    });

    const { mutate: removeTag } = useRemoveTagFromCustomer({
        onSuccess: () => {
            addToast('Tag removed.', 'success', 'Tag Removed');
        },
        onError: (error) => {
            addToast(error.message, 'error', 'Error Removing Tag');
        }
    });
    
    const handleAddTag = (tagName: string) => {
        addTag({ customerId: customer.id, tagName });
    };
    
    const handleRemoveTag = (tag: Tag) => {
        removeTag({ customerId: customer.id, tagId: tag.id });
    };

    return (
        <TagInput
            tags={customer.tags || []}
            onTagAdd={handleAddTag}
            onTagRemove={handleRemoveTag}
        />
    );
};

export default CustomerTags;
