import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTags, addTagToCustomer, removeTagFromCustomer, createTag, updateTag, deleteTag } from '../dal/tags';
import { Tag } from '../types';

type MutationCallbacks<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

export const useTags = () => {
    return useQuery({
        queryKey: ['tags'],
        queryFn: getTags,
    });
};

export const useAddTagToCustomer = ({ onSuccess, onError }: MutationCallbacks<Tag> = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ customerId, tagName }: { customerId: string, tagName: string }) => addTagToCustomer(customerId, tagName),
        onSuccess: (newTag, { customerId }) => {
            // Invalidate customers to refetch them with the new tag association
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            // Invalidate the general tags list in case a new tag was created
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            onSuccess?.(newTag);
        },
        onError,
    });
};

export const useRemoveTagFromCustomer = ({ onSuccess, onError }: MutationCallbacks<void> = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ customerId, tagId }: { customerId: string, tagId: string }) => removeTagFromCustomer(customerId, tagId),
        onSuccess: (_, { customerId }) => {
            // Invalidate customers to refetch them with the updated tag list
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            onSuccess?.();
        },
        onError,
    });
};

export const useCreateTag = ({ onSuccess, onError }: MutationCallbacks<Tag> = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (tagName: string) => createTag(tagName),
        onSuccess: (newTag) => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            onSuccess?.(newTag);
        },
        onError,
    });
};

export const useUpdateTag = ({ onSuccess, onError }: MutationCallbacks<Tag> = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, name }: { id: string, name: string }) => updateTag(id, name),
        onSuccess: (updatedTag) => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            queryClient.invalidateQueries({ queryKey: ['customers'] }); // Customer tags will change
            onSuccess?.(updatedTag);
        },
        onError,
    });
};

export const useDeleteTag = ({ onSuccess, onError }: MutationCallbacks<Tag> = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (tag: Tag) => deleteTag(tag.id).then(() => tag), // pass tag through for onSuccess
        onSuccess: (deletedTag) => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            queryClient.invalidateQueries({ queryKey: ['customers'] }); // Customer tags will change
            onSuccess?.(deletedTag);
        },
        onError,
    });
};