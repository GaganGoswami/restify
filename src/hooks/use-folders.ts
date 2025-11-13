import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Folder } from "@/types";
import {
  createFolder as createFolderInDb,
  getFoldersByCollection,
  updateFolder as updateFolderInDb,
  deleteFolder as deleteFolderFromDb,
  getFolderHierarchy,
} from "@/lib/storage/collections";

const MAX_NESTING_DEPTH = 3;

// Calculate folder depth by traversing parent chain
async function calculateFolderDepth(folderId: string, folders: Folder[]): Promise<number> {
  let depth = 1;
  let currentFolder = folders.find((f) => f.id === folderId);

  while (currentFolder?.parentFolderId && depth < MAX_NESTING_DEPTH) {
    currentFolder = folders.find((f) => f.id === currentFolder!.parentFolderId);
    depth++;
  }

  return depth;
}

export function useFolders(collectionId: string) {
  const queryClient = useQueryClient();

  // Fetch folders for collection
  const { data: folders = [], isLoading } = useQuery<Folder[]>({
    queryKey: ["folders", collectionId],
    queryFn: () => getFoldersByCollection(collectionId),
    enabled: !!collectionId,
  });

  // Fetch folder hierarchy
  const { data: hierarchy = [] } = useQuery<Folder[]>({
    queryKey: ["folders", collectionId, "hierarchy"],
    queryFn: () => getFolderHierarchy(collectionId),
    enabled: !!collectionId,
  });

  // Create folder mutation
  const createMutation = useMutation({
    mutationFn: async ({ name, parentFolderId }: { name: string; parentFolderId?: string }) => {
      // Validate nesting depth
      if (parentFolderId) {
        const depth = await calculateFolderDepth(parentFolderId, folders);
        if (depth >= MAX_NESTING_DEPTH) {
          throw new Error(`Maximum nesting depth of ${MAX_NESTING_DEPTH} levels reached`);
        }
      }

      return createFolderInDb({
        name,
        collectionId,
        parentFolderId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", collectionId] });
      queryClient.invalidateQueries({
        queryKey: ["folders", collectionId, "hierarchy"],
      });
    },
  });

  // Update folder mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Folder> }) => {
      // If moving folder, validate nesting depth
      if (updates.parentFolderId !== undefined) {
        const depth = await calculateFolderDepth(updates.parentFolderId, folders);
        if (depth >= MAX_NESTING_DEPTH) {
          throw new Error(`Maximum nesting depth of ${MAX_NESTING_DEPTH} levels reached`);
        }
      }

      await updateFolderInDb(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", collectionId] });
      queryClient.invalidateQueries({
        queryKey: ["folders", collectionId, "hierarchy"],
      });
    },
  });

  // Delete folder mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteFolderFromDb(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", collectionId] });
      queryClient.invalidateQueries({
        queryKey: ["folders", collectionId, "hierarchy"],
      });
    },
  });

  // Rename folder mutation
  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      return updateMutation.mutateAsync({ id, updates: { name } });
    },
  });

  return {
    folders,
    hierarchy,
    isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    rename: renameMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    maxDepth: MAX_NESTING_DEPTH,
  };
}
