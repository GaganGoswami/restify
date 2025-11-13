// App settings and preferences
export interface AppSettings {
  theme: "light" | "dark" | "system";
  fontSize: number;
  requestTimeout: number;
  followRedirects: boolean;
  validateSSL: boolean;
  proxyEnabled: boolean;
  proxyUrl?: string;
  autoSave: boolean;
  autoSaveInterval: number;
  maxHistoryEntries: number;
  compactView: boolean;
  showLineNumbers: boolean;
  wordWrap: boolean;
  editorTheme: string;
}

export interface UIState {
  activeTab: "request" | "response" | "history" | "collections";
  sidebarOpen: boolean;
  sidebarWidth: number;
  activeRequestId?: string;
  activeCollectionId?: string;
  activeEnvironmentId?: string;
  selectedResponseTab: "body" | "headers" | "cookies" | "timeline";
}

export interface KeyboardShortcut {
  key: string;
  modifiers: Array<"ctrl" | "alt" | "shift" | "meta">;
  action: string;
  description: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  fontSize: 14,
  requestTimeout: 30000,
  followRedirects: true,
  validateSSL: true,
  proxyEnabled: false,
  autoSave: true,
  autoSaveInterval: 5000,
  maxHistoryEntries: 1000,
  compactView: false,
  showLineNumbers: true,
  wordWrap: true,
  editorTheme: "vs-dark",
};
