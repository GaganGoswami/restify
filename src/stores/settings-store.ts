import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/types/settings";

interface SettingsStore extends AppSettings {
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (settings) =>
        set((state) => ({
          ...state,
          ...settings,
        })),

      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: "restify-settings",
    }
  )
);
