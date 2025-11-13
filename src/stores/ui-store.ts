import { create } from "zustand";
import type { UIState } from "@/types";

interface UIStore extends UIState {
  setActiveTab: (tab: UIState["activeTab"]) => void;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  setActiveRequest: (id: string | undefined) => void;
  setActiveCollection: (id: string | undefined) => void;
  setActiveEnvironment: (id: string | undefined) => void;
  setSelectedResponseTab: (tab: UIState["selectedResponseTab"]) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  activeTab: "request",
  sidebarOpen: true,
  sidebarWidth: 280,
  activeRequestId: undefined,
  activeCollectionId: undefined,
  activeEnvironmentId: undefined,
  selectedResponseTab: "body",

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
  setActiveRequest: (id) => set({ activeRequestId: id }),
  setActiveCollection: (id) => set({ activeCollectionId: id }),
  setActiveEnvironment: (id) => set({ activeEnvironmentId: id }),
  setSelectedResponseTab: (tab) => set({ selectedResponseTab: tab }),
}));
