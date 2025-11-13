import Dexie, { type EntityTable } from "dexie";
import type {
  Request,
  Collection,
  Folder,
  Environment,
  HistoryEntry,
  WebSocketConnection,
  WebSocketMessage,
  GraphQLRequest,
  TestSuite,
  AppSettings,
} from "@/types";

// Database schema
export class RestifyDatabase extends Dexie {
  requests!: EntityTable<Request, "id">;
  collections!: EntityTable<Collection, "id">;
  folders!: EntityTable<Folder, "id">;
  environments!: EntityTable<Environment, "id">;
  history!: EntityTable<HistoryEntry, "id">;
  websocketConnections!: EntityTable<WebSocketConnection, "id">;
  websocketMessages!: EntityTable<WebSocketMessage, "id">;
  graphqlRequests!: EntityTable<GraphQLRequest, "id">;
  testSuites!: EntityTable<TestSuite, "id">;
  settings!: EntityTable<AppSettings & { id: string }, "id">;

  constructor() {
    super("RestifyDB");

    this.version(1).stores({
      requests:
        "id, name, method, collectionId, folderId, createdAt, updatedAt, [collectionId+folderId]",
      collections: "id, name, createdAt, updatedAt",
      folders: "id, name, collectionId, parentFolderId, createdAt, updatedAt",
      environments: "id, name, isActive, createdAt, updatedAt",
      history: "id, requestId, method, status, timestamp, [method+status], url",
      websocketConnections: "id, name, url, state, createdAt",
      websocketMessages: "id, connectionId, type, timestamp",
      graphqlRequests: "id, name, url, collectionId, createdAt, updatedAt",
      testSuites: "id, name, collectionId, createdAt, updatedAt",
      settings: "id",
    });
  }
}

// Export singleton instance
export const db = new RestifyDatabase();

// Helper to initialize with default settings
export async function initializeDatabase() {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      id: "default",
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
    });
  }
}

// Type-safe transaction helper
export async function transaction<T>(
  tables: Array<keyof RestifyDatabase>,
  callback: () => Promise<T>
): Promise<T> {
  return db.transaction(
    "rw",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tables.map((t) => db[t] as EntityTable<any, any>),
    callback
  );
}
