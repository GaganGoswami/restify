import { QueryClient } from "@tanstack/react-query";

// Configure React Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Query keys factory
export const queryKeys = {
  requests: {
    all: ["requests"] as const,
    list: () => [...queryKeys.requests.all, "list"] as const,
    detail: (id: string) => [...queryKeys.requests.all, "detail", id] as const,
    byCollection: (collectionId: string) =>
      [...queryKeys.requests.all, "collection", collectionId] as const,
    byFolder: (folderId: string) => [...queryKeys.requests.all, "folder", folderId] as const,
  },
  collections: {
    all: ["collections"] as const,
    list: () => [...queryKeys.collections.all, "list"] as const,
    detail: (id: string) => [...queryKeys.collections.all, "detail", id] as const,
  },
  folders: {
    all: ["folders"] as const,
    byCollection: (collectionId: string) => [...queryKeys.folders.all, collectionId] as const,
  },
  environments: {
    all: ["environments"] as const,
    list: () => [...queryKeys.environments.all, "list"] as const,
    active: () => [...queryKeys.environments.all, "active"] as const,
    detail: (id: string) => [...queryKeys.environments.all, "detail", id] as const,
  },
  history: {
    all: ["history"] as const,
    list: (limit?: number) => [...queryKeys.history.all, "list", limit] as const,
    stats: () => [...queryKeys.history.all, "stats"] as const,
  },
};
