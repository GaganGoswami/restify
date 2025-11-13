import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Collection } from "@/types";
import {
  createCollection as createCollectionInDb,
  getAllCollections,
  updateCollection as updateCollectionInDb,
  deleteCollection as deleteCollectionFromDb,
} from "@/lib/storage/collections";

export function useCollections() {
  const queryClient = useQueryClient();

  // Fetch all collections
  const { data: collections = [], isLoading } = useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: getAllCollections,
  });

  // Create collection mutation
  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      return createCollectionInDb({ name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  // Update collection mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Collection> }) => {
      const collection = collections.find((c: Collection) => c.id === id);
      if (!collection) throw new Error("Collection not found");

      await updateCollectionInDb(id, updates);
      return { ...collection, ...updates, updatedAt: new Date() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  // Delete collection mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteCollectionFromDb(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  // Duplicate collection mutation
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const collection = collections.find((c: Collection) => c.id === id);
      if (!collection) throw new Error("Collection not found");

      return createCollectionInDb({
        name: `${collection.name} (Copy)`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  // Rename collection mutation
  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      return updateMutation.mutateAsync({ id, updates: { name } });
    },
  });

  return {
    collections,
    isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    duplicate: duplicateMutation.mutateAsync,
    rename: renameMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
  };
}
