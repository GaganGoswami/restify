// Collection type definitions
export interface Collection {
  id: string;
  name: string;
  description?: string;
  folders: Folder[];
  requests: string[]; // Request IDs
  variables?: Variable[];
  auth?: import("./request").AuthConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  collectionId: string;
  parentFolderId?: string;
  requests: string[]; // Request IDs
  auth?: import("./request").AuthConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionExport {
  version: string;
  collection: Collection;
  folders: Folder[];
  requests: import("./request").Request[];
  environments?: Environment[];
}

// Environment types
export interface Environment {
  id: string;
  name: string;
  variables: Variable[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Variable {
  id: string;
  key: string;
  value: string;
  type: "default" | "secret";
  enabled: boolean;
  description?: string;
}

export interface VariableResolution {
  original: string;
  resolved: string;
  variables: Record<string, string>;
}
