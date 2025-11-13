# Storage API Contracts

**Feature:** API Tester - Local Storage Contracts  
**Version:** 1.0.0  
**Status:** Draft  
**Last Updated:** 2025-01-12

## Overview

This document defines the CRUD API contracts for all local storage operations using IndexedDB via Dexie.js. All operations are client-side only with no backend communication.

### Technology Context
- **Storage**: IndexedDB via Dexie.js 3.x
- **Location**: `/lib/storage/*.ts` modules
- **Transaction Model**: Dexie automatic transaction management
- **Error Handling**: Custom StorageError types with context

### General Patterns

**Error Types:**
```typescript
enum StorageErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  TRANSACTION_ERROR = 'TRANSACTION_ERROR'
}

interface StorageError {
  code: StorageErrorCode;
  message: string;
  context?: Record<string, unknown>;
}
```

**Response Wrapper:**
```typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: StorageError };
```

---

## 1. Request Storage API

**Module:** `/lib/storage/requests.ts`

### 1.1 Create Request

**Purpose:** Store a new HTTP request configuration in a collection or folder

**Operation Signature:**
```typescript
async function createRequest(
  data: CreateRequestDTO
): Promise<Result<Request>>

interface CreateRequestDTO {
  name: string;              // 1-100 chars
  method: HttpMethod;
  url: string;               // Valid URL format
  queryParams?: QueryParam[];
  headers?: Header[];
  body?: RequestBody;
  authConfig?: AuthConfig;
  testScript?: string;       // Max 50KB
  preRequestScript?: string; // Max 50KB
  collectionId: string;      // UUID
  folderId?: string;         // UUID, optional
}
```

**Validation Rules:**
- `name`: Required, 1-100 characters
- `url`: Must pass URL validation regex
- `method`: Must be valid HttpMethod enum value
- `collectionId`: Must reference existing collection
- `folderId`: If provided, must exist and belong to specified collection
- `body`: Validate based on body type (JSON syntax, form-data structure)
- `authConfig`: Encrypt credentials before storage if present

**Returns:**
- Success: Full Request entity with generated UUID `id`, `createdAt`, `updatedAt`
- Error: `VALIDATION_ERROR` for invalid inputs, `NOT_FOUND` if collection/folder missing

**Dexie Query Example:**
```typescript
const request: Request = {
  id: crypto.randomUUID(),
  ...data,
  createdAt: Date.now(),
  updatedAt: Date.now()
};

// Encrypt auth credentials if present
if (request.authConfig) {
  request.authConfig = await encryptAuthConfig(request.authConfig);
}

await db.requests.add(request);
return { success: true, data: request };
```

---

### 1.2 Get Request by ID

**Purpose:** Retrieve a single request with decrypted credentials

**Operation Signature:**
```typescript
async function getRequest(id: string): Promise<Result<Request>>
```

**Returns:**
- Success: Request entity with decrypted `authConfig`
- Error: `NOT_FOUND` if ID doesn't exist

**Dexie Query Example:**
```typescript
const request = await db.requests.get(id);
if (!request) {
  return { success: false, error: { code: 'NOT_FOUND', message: `Request ${id} not found` } };
}

// Decrypt credentials
if (request.authConfig) {
  request.authConfig = await decryptAuthConfig(request.authConfig);
}

return { success: true, data: request };
```

---

### 1.3 List Requests by Collection

**Purpose:** Get all requests in a collection (including folder requests)

**Operation Signature:**
```typescript
async function listRequestsByCollection(
  collectionId: string,
  options?: ListOptions
): Promise<Result<Request[]>>

interface ListOptions {
  sortBy?: 'name' | 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
```

**Returns:**
- Success: Array of Request entities (decrypted), may be empty
- Error: `NOT_FOUND` if collection doesn't exist

**Dexie Query Example:**
```typescript
const collection = await db.collections.get(collectionId);
if (!collection) {
  return { success: false, error: { code: 'NOT_FOUND', message: `Collection ${collectionId} not found` } };
}

let query = db.requests.where('collectionId').equals(collectionId);

// Apply sorting
if (options?.sortBy) {
  query = query.sortBy(options.sortBy);
  if (options.sortOrder === 'desc') {
    query = query.reverse();
  }
}

const requests = await query
  .offset(options?.offset || 0)
  .limit(options?.limit || 1000)
  .toArray();

// Decrypt all auth configs
for (const req of requests) {
  if (req.authConfig) {
    req.authConfig = await decryptAuthConfig(req.authConfig);
  }
}

return { success: true, data: requests };
```

---

### 1.4 Update Request

**Purpose:** Modify existing request configuration

**Operation Signature:**
```typescript
async function updateRequest(
  id: string,
  updates: Partial<UpdateRequestDTO>
): Promise<Result<Request>>

type UpdateRequestDTO = Omit<CreateRequestDTO, 'collectionId'>;
```

**Validation Rules:**
- Same as Create Request for provided fields
- Cannot change `collectionId` (immutable)
- `updatedAt` automatically set to current timestamp

**Returns:**
- Success: Updated Request entity
- Error: `NOT_FOUND` if ID doesn't exist, `VALIDATION_ERROR` for invalid data

**Dexie Query Example:**
```typescript
const existing = await db.requests.get(id);
if (!existing) {
  return { success: false, error: { code: 'NOT_FOUND', message: `Request ${id} not found` } };
}

// Encrypt auth if present in updates
if (updates.authConfig) {
  updates.authConfig = await encryptAuthConfig(updates.authConfig);
}

await db.requests.update(id, {
  ...updates,
  updatedAt: Date.now()
});

const updated = await db.requests.get(id);
return { success: true, data: updated! };
```

---

### 1.5 Delete Request

**Purpose:** Remove request from storage

**Operation Signature:**
```typescript
async function deleteRequest(id: string): Promise<Result<void>>
```

**Returns:**
- Success: void
- Error: `NOT_FOUND` if ID doesn't exist

**Dexie Query Example:**
```typescript
const count = await db.requests.where('id').equals(id).delete();
if (count === 0) {
  return { success: false, error: { code: 'NOT_FOUND', message: `Request ${id} not found` } };
}
return { success: true, data: undefined };
```

---

### 1.6 Duplicate Request

**Purpose:** Clone existing request with new name

**Operation Signature:**
```typescript
async function duplicateRequest(
  id: string,
  newName?: string
): Promise<Result<Request>>
```

**Behavior:**
- Copies all fields except `id`, `createdAt`, `updatedAt`
- Appends " (Copy)" to name if `newName` not provided
- Places in same collection/folder as original

**Returns:**
- Success: New Request entity
- Error: `NOT_FOUND` if source ID doesn't exist

**Dexie Query Example:**
```typescript
const source = await db.requests.get(id);
if (!source) {
  return { success: false, error: { code: 'NOT_FOUND', message: `Source request ${id} not found` } };
}

const duplicate: Request = {
  ...source,
  id: crypto.randomUUID(),
  name: newName || `${source.name} (Copy)`,
  createdAt: Date.now(),
  updatedAt: Date.now()
};

await db.requests.add(duplicate);
return { success: true, data: duplicate };
```

---

## 2. Collection Storage API

**Module:** `/lib/storage/collections.ts`

### 2.1 Create Collection

**Purpose:** Create new collection to organize requests

**Operation Signature:**
```typescript
async function createCollection(
  data: CreateCollectionDTO
): Promise<Result<Collection>>

interface CreateCollectionDTO {
  name: string;        // 1-100 chars, unique
  description?: string; // Max 500 chars
}
```

**Validation Rules:**
- `name`: Required, 1-100 characters, must be unique across collections
- `description`: Optional, max 500 characters

**Returns:**
- Success: Collection entity with UUID `id`, timestamps
- Error: `VALIDATION_ERROR` if name exists or invalid

**Dexie Query Example:**
```typescript
// Check uniqueness
const existing = await db.collections.where('name').equals(data.name).first();
if (existing) {
  return { success: false, error: { code: 'VALIDATION_ERROR', message: `Collection "${data.name}" already exists` } };
}

const collection: Collection = {
  id: crypto.randomUUID(),
  name: data.name,
  description: data.description,
  createdAt: Date.now(),
  updatedAt: Date.now()
};

await db.collections.add(collection);
return { success: true, data: collection };
```

---

### 2.2 Get Collection by ID

**Purpose:** Retrieve collection with metadata

**Operation Signature:**
```typescript
async function getCollection(id: string): Promise<Result<Collection>>
```

**Returns:**
- Success: Collection entity
- Error: `NOT_FOUND` if ID doesn't exist

**Dexie Query Example:**
```typescript
const collection = await db.collections.get(id);
if (!collection) {
  return { success: false, error: { code: 'NOT_FOUND', message: `Collection ${id} not found` } };
}
return { success: true, data: collection };
```

---

### 2.3 List All Collections

**Purpose:** Get all collections with optional sorting

**Operation Signature:**
```typescript
async function listCollections(
  options?: { sortBy?: 'name' | 'updatedAt'; sortOrder?: 'asc' | 'desc' }
): Promise<Result<Collection[]>>
```

**Returns:**
- Success: Array of Collections (may be empty)

**Dexie Query Example:**
```typescript
let collections = await db.collections.toArray();

// Sort in memory (small dataset)
if (options?.sortBy) {
  collections.sort((a, b) => {
    const aVal = a[options.sortBy!];
    const bVal = b[options.sortBy!];
    const order = options.sortOrder === 'desc' ? -1 : 1;
    return aVal > bVal ? order : -order;
  });
}

return { success: true, data: collections };
```

---

### 2.4 Update Collection

**Purpose:** Modify collection name/description

**Operation Signature:**
```typescript
async function updateCollection(
  id: string,
  updates: Partial<CreateCollectionDTO>
): Promise<Result<Collection>>
```

**Validation Rules:**
- `name` must be unique if changed
- `description` max 500 chars

**Returns:**
- Success: Updated Collection entity
- Error: `NOT_FOUND` or `VALIDATION_ERROR` if name conflict

**Dexie Query Example:**
```typescript
const existing = await db.collections.get(id);
if (!existing) {
  return { success: false, error: { code: 'NOT_FOUND', message: `Collection ${id} not found` } };
}

// Check name uniqueness if changing
if (updates.name && updates.name !== existing.name) {
  const conflict = await db.collections.where('name').equals(updates.name).first();
  if (conflict) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: `Collection "${updates.name}" already exists` } };
  }
}

await db.collections.update(id, {
  ...updates,
  updatedAt: Date.now()
});

const updated = await db.collections.get(id);
return { success: true, data: updated! };
```

---

### 2.5 Delete Collection

**Purpose:** Remove collection and all child requests/folders

**Operation Signature:**
```typescript
async function deleteCollection(id: string): Promise<Result<void>>
```

**Cascade Behavior:**
- Deletes all folders in collection
- Deletes all requests in collection (including folder requests)
- Deletes all collection-scoped variables
- Uses Dexie transaction for atomicity

**Returns:**
- Success: void
- Error: `NOT_FOUND` if ID doesn't exist

**Dexie Query Example:**
```typescript
await db.transaction('rw', [db.collections, db.folders, db.requests, db.variables], async () => {
  const collection = await db.collections.get(id);
  if (!collection) {
    throw new Error('NOT_FOUND');
  }

  // Delete child entities
  await db.folders.where('collectionId').equals(id).delete();
  await db.requests.where('collectionId').equals(id).delete();
  await db.variables.where('collectionId').equals(id).delete();
  
  // Delete collection
  await db.collections.delete(id);
});

return { success: true, data: undefined };
```

---

## 3. Folder Storage API

**Module:** `/lib/storage/folders.ts`

### 3.1 Create Folder

**Purpose:** Create folder for request organization within collection

**Operation Signature:**
```typescript
async function createFolder(
  data: CreateFolderDTO
): Promise<Result<Folder>>

interface CreateFolderDTO {
  name: string;         // 1-100 chars
  collectionId: string; // UUID
  parentFolderId?: string; // UUID, optional
  description?: string; // Max 500 chars
}
```

**Validation Rules:**
- `name`: Required, 1-100 chars
- `collectionId`: Must reference existing collection
- `parentFolderId`: If provided, must exist and belong to same collection
- Nesting depth limit: 3 levels (enforced by checking parent chain)

**Returns:**
- Success: Folder entity with UUID
- Error: `NOT_FOUND`, `VALIDATION_ERROR`, or `CONSTRAINT_VIOLATION` if nesting > 3

**Dexie Query Example:**
```typescript
// Validate collection exists
const collection = await db.collections.get(data.collectionId);
if (!collection) {
  return { success: false, error: { code: 'NOT_FOUND', message: `Collection ${data.collectionId} not found` } };
}

// Check nesting depth
if (data.parentFolderId) {
  const depth = await calculateFolderDepth(data.parentFolderId);
  if (depth >= 3) {
    return { success: false, error: { code: 'CONSTRAINT_VIOLATION', message: 'Folder nesting depth exceeds 3 levels' } };
  }
}

const folder: Folder = {
  id: crypto.randomUUID(),
  name: data.name,
  collectionId: data.collectionId,
  parentFolderId: data.parentFolderId,
  description: data.description,
  createdAt: Date.now(),
  updatedAt: Date.now()
};

await db.folders.add(folder);
return { success: true, data: folder };
```

---

### 3.2 List Folders by Collection

**Purpose:** Get all folders in collection with hierarchy

**Operation Signature:**
```typescript
async function listFoldersByCollection(
  collectionId: string
): Promise<Result<Folder[]>>
```

**Returns:**
- Success: Flat array of folders (client builds tree)
- Error: `NOT_FOUND` if collection doesn't exist

**Dexie Query Example:**
```typescript
const collection = await db.collections.get(collectionId);
if (!collection) {
  return { success: false, error: { code: 'NOT_FOUND', message: `Collection ${collectionId} not found` } };
}

const folders = await db.folders
  .where('collectionId')
  .equals(collectionId)
  .toArray();

return { success: true, data: folders };
```

---

### 3.3 Delete Folder

**Purpose:** Remove folder and optionally cascade to children

**Operation Signature:**
```typescript
async function deleteFolder(
  id: string,
  options?: { cascade: boolean } // Default: true
): Promise<Result<void>>
```

**Cascade Behavior (cascade: true):**
- Deletes all child folders recursively
- Deletes all requests in folder and child folders

**Non-Cascade Behavior (cascade: false):**
- Moves child folders to parent or root
- Moves requests to parent folder or root

**Returns:**
- Success: void
- Error: `NOT_FOUND` if ID doesn't exist

**Dexie Query Example:**
```typescript
const folder = await db.folders.get(id);
if (!folder) {
  return { success: false, error: { code: 'NOT_FOUND', message: `Folder ${id} not found` } };
}

if (options?.cascade !== false) {
  // Cascade delete
  await db.transaction('rw', [db.folders, db.requests], async () => {
    const childIds = await getDescendantFolderIds(id);
    await db.folders.bulkDelete([id, ...childIds]);
    await db.requests.where('folderId').anyOf([id, ...childIds]).delete();
  });
} else {
  // Move children to parent
  await db.transaction('rw', [db.folders, db.requests], async () => {
    await db.folders.where('parentFolderId').equals(id).modify({ parentFolderId: folder.parentFolderId });
    await db.requests.where('folderId').equals(id).modify({ folderId: folder.parentFolderId });
    await db.folders.delete(id);
  });
}

return { success: true, data: undefined };
```

---

## 4. Environment Storage API

**Module:** `/lib/storage/environments.ts`

### 4.1 Create Environment

**Purpose:** Create named variable set for different deployment contexts

**Operation Signature:**
```typescript
async function createEnvironment(
  data: CreateEnvironmentDTO
): Promise<Result<Environment>>

interface CreateEnvironmentDTO {
  name: string;      // 1-50 chars, unique
  isActive?: boolean; // Default: false
}
```

**Validation Rules:**
- `name`: Required, unique across environments
- Only one environment can be active at a time
- If `isActive: true`, deactivates other environments atomically

**Returns:**
- Success: Environment entity
- Error: `VALIDATION_ERROR` if name exists

**Dexie Query Example:**
```typescript
// Check uniqueness
const existing = await db.environments.where('name').equals(data.name).first();
if (existing) {
  return { success: false, error: { code: 'VALIDATION_ERROR', message: `Environment "${data.name}" already exists` } };
}

await db.transaction('rw', db.environments, async () => {
  // Deactivate others if this is active
  if (data.isActive) {
    await db.environments.toCollection().modify({ isActive: false });
  }

  const env: Environment = {
    id: crypto.randomUUID(),
    name: data.name,
    isActive: data.isActive || false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await db.environments.add(env);
  return { success: true, data: env };
});
```

---

### 4.2 Set Active Environment

**Purpose:** Switch to different environment (activates its variables)

**Operation Signature:**
```typescript
async function setActiveEnvironment(id: string): Promise<Result<void>>
```

**Behavior:**
- Deactivates current active environment
- Activates specified environment
- Atomic transaction ensures single active environment

**Returns:**
- Success: void
- Error: `NOT_FOUND` if ID doesn't exist

**Dexie Query Example:**
```typescript
const env = await db.environments.get(id);
if (!env) {
  return { success: false, error: { code: 'NOT_FOUND', message: `Environment ${id} not found` } };
}

await db.transaction('rw', db.environments, async () => {
  await db.environments.toCollection().modify({ isActive: false });
  await db.environments.update(id, { isActive: true, updatedAt: Date.now() });
});

return { success: true, data: undefined };
```

---

### 4.3 Get Active Environment

**Purpose:** Retrieve currently active environment

**Operation Signature:**
```typescript
async function getActiveEnvironment(): Promise<Result<Environment | null>>
```

**Returns:**
- Success: Environment entity or null if none active

**Dexie Query Example:**
```typescript
const active = await db.environments.where('isActive').equals(1).first(); // Use 1 for true with index
return { success: true, data: active || null };
```

---

## 5. Variable Storage API

**Module:** `/lib/storage/variables.ts`

### 5.1 Create Variable

**Purpose:** Store key-value pair with scope

**Operation Signature:**
```typescript
async function createVariable(
  data: CreateVariableDTO
): Promise<Result<Variable>>

interface CreateVariableDTO {
  key: string;                      // 1-100 chars
  value: string;                    // Max 10KB
  scope: 'global' | 'environment' | 'collection';
  environmentId?: string;           // Required if scope='environment'
  collectionId?: string;            // Required if scope='collection'
  isSecret?: boolean;               // Default: false
}
```

**Validation Rules:**
- `key`: Required, 1-100 chars
- `scope` determines required foreign keys:
  - `environment` scope → `environmentId` required
  - `collection` scope → `collectionId` required
  - `global` scope → no foreign keys
- `value`: Encrypted if `isSecret: true`
- Unique constraint: (key, scope, environmentId, collectionId)

**Returns:**
- Success: Variable entity
- Error: `VALIDATION_ERROR` if constraints violated

**Dexie Query Example:**
```typescript
// Validate scope dependencies
if (data.scope === 'environment' && !data.environmentId) {
  return { success: false, error: { code: 'VALIDATION_ERROR', message: 'environmentId required for environment scope' } };
}

// Check uniqueness
const existing = await db.variables
  .where('[key+scope+environmentId+collectionId]')
  .equals([data.key, data.scope, data.environmentId || '', data.collectionId || ''])
  .first();

if (existing) {
  return { success: false, error: { code: 'VALIDATION_ERROR', message: `Variable "${data.key}" already exists in this scope` } };
}

// Encrypt value if secret
let value = data.value;
if (data.isSecret) {
  value = await encryptValue(value);
}

const variable: Variable = {
  id: crypto.randomUUID(),
  key: data.key,
  value,
  scope: data.scope,
  environmentId: data.environmentId,
  collectionId: data.collectionId,
  isSecret: data.isSecret || false,
  createdAt: Date.now(),
  updatedAt: Date.now()
};

await db.variables.add(variable);
return { success: true, data: variable };
```

---

### 5.2 Resolve Variable Value

**Purpose:** Get variable value following precedence rules

**Operation Signature:**
```typescript
async function resolveVariable(
  key: string,
  context: { collectionId?: string; environmentId?: string }
): Promise<Result<string | null>>
```

**Precedence Rules (highest to lowest):**
1. Collection scope (if collectionId provided)
2. Environment scope (if environmentId provided)
3. Global scope

**Returns:**
- Success: Decrypted value string or null if not found

**Dexie Query Example:**
```typescript
// Try collection scope first
if (context.collectionId) {
  const collectionVar = await db.variables
    .where('[key+scope+collectionId]')
    .equals([key, 'collection', context.collectionId])
    .first();
  
  if (collectionVar) {
    const value = collectionVar.isSecret 
      ? await decryptValue(collectionVar.value)
      : collectionVar.value;
    return { success: true, data: value };
  }
}

// Try environment scope
if (context.environmentId) {
  const envVar = await db.variables
    .where('[key+scope+environmentId]')
    .equals([key, 'environment', context.environmentId])
    .first();
  
  if (envVar) {
    const value = envVar.isSecret 
      ? await decryptValue(envVar.value)
      : envVar.value;
    return { success: true, data: value };
  }
}

// Try global scope
const globalVar = await db.variables
  .where('[key+scope]')
  .equals([key, 'global'])
  .first();

if (globalVar) {
  const value = globalVar.isSecret 
    ? await decryptValue(globalVar.value)
    : globalVar.value;
  return { success: true, data: value };
}

return { success: true, data: null };
```

---

### 5.3 List Variables by Scope

**Purpose:** Get all variables for specific scope

**Operation Signature:**
```typescript
async function listVariablesByScope(
  scope: 'global' | 'environment' | 'collection',
  scopeId?: string // Required for environment/collection scopes
): Promise<Result<Variable[]>>
```

**Returns:**
- Success: Array of variables (secrets decrypted)
- Error: `VALIDATION_ERROR` if scopeId missing

**Dexie Query Example:**
```typescript
let variables: Variable[];

if (scope === 'global') {
  variables = await db.variables.where('scope').equals('global').toArray();
} else if (scope === 'environment') {
  if (!scopeId) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'environmentId required' } };
  }
  variables = await db.variables
    .where('[scope+environmentId]')
    .equals(['environment', scopeId])
    .toArray();
} else {
  if (!scopeId) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'collectionId required' } };
  }
  variables = await db.variables
    .where('[scope+collectionId]')
    .equals(['collection', scopeId])
    .toArray();
}

// Decrypt secrets
for (const v of variables) {
  if (v.isSecret) {
    v.value = await decryptValue(v.value);
  }
}

return { success: true, data: variables };
```

---

## 6. History Storage API

**Module:** `/lib/storage/history.ts`

### 6.1 Create History Entry

**Purpose:** Record sent request with full response

**Operation Signature:**
```typescript
async function createHistoryEntry(
  data: CreateHistoryEntryDTO
): Promise<Result<HistoryEntry>>

interface CreateHistoryEntryDTO {
  request: HistoricalRequest;       // Full request snapshot
  response: HistoricalResponse;     // Full response data
  testResults?: TestResult[];       // Test execution results
  collectionId?: string;            // Optional collection context
  environmentId?: string;           // Optional environment context
}

interface HistoricalRequest {
  method: HttpMethod;
  url: string;
  headers: Header[];
  body?: RequestBody;
  authConfig?: AuthConfig; // Stored encrypted
}

interface HistoricalResponse {
  status: number;
  statusText: string;
  headers: Header[];
  body: string;             // Raw body
  size: number;             // Bytes
  time: number;             // Milliseconds
}
```

**Behavior:**
- Encrypts sensitive auth data in request snapshot
- Enforces 1000-entry limit via LRU eviction (deletes oldest)
- Indexes on `sentAt` for fast retrieval

**Returns:**
- Success: HistoryEntry entity
- Error: `QUOTA_EXCEEDED` if storage full

**Dexie Query Example:**
```typescript
// Enforce limit
const count = await db.history.count();
if (count >= 1000) {
  const oldest = await db.history.orderBy('sentAt').first();
  if (oldest) {
    await db.history.delete(oldest.id);
  }
}

// Encrypt auth in request snapshot
if (data.request.authConfig) {
  data.request.authConfig = await encryptAuthConfig(data.request.authConfig);
}

const entry: HistoryEntry = {
  id: crypto.randomUUID(),
  request: data.request,
  response: data.response,
  testResults: data.testResults,
  collectionId: data.collectionId,
  environmentId: data.environmentId,
  sentAt: Date.now()
};

await db.history.add(entry);
return { success: true, data: entry };
```

---

### 6.2 List History

**Purpose:** Get history entries with filtering and pagination

**Operation Signature:**
```typescript
async function listHistory(
  options?: ListHistoryOptions
): Promise<Result<HistoryEntry[]>>

interface ListHistoryOptions {
  collectionId?: string;
  environmentId?: string;
  method?: HttpMethod;
  urlContains?: string;
  limit?: number;           // Default: 50
  offset?: number;          // Default: 0
  sortOrder?: 'asc' | 'desc'; // Default: 'desc'
}
```

**Returns:**
- Success: Array of history entries (most recent first by default)

**Dexie Query Example:**
```typescript
let query = db.history.orderBy('sentAt');

// Apply filters
if (options?.collectionId) {
  query = query.and(h => h.collectionId === options.collectionId);
}
if (options?.environmentId) {
  query = query.and(h => h.environmentId === options.environmentId);
}
if (options?.method) {
  query = query.and(h => h.request.method === options.method);
}
if (options?.urlContains) {
  query = query.and(h => h.request.url.includes(options.urlContains!));
}

// Reverse for desc order
if (options?.sortOrder !== 'asc') {
  query = query.reverse();
}

const entries = await query
  .offset(options?.offset || 0)
  .limit(options?.limit || 50)
  .toArray();

// Decrypt auth configs
for (const entry of entries) {
  if (entry.request.authConfig) {
    entry.request.authConfig = await decryptAuthConfig(entry.request.authConfig);
  }
}

return { success: true, data: entries };
```

---

### 6.3 Clear History

**Purpose:** Delete all or filtered history entries

**Operation Signature:**
```typescript
async function clearHistory(
  options?: { olderThan?: number } // Unix timestamp
): Promise<Result<number>> // Returns count deleted
```

**Returns:**
- Success: Number of entries deleted

**Dexie Query Example:**
```typescript
let count: number;

if (options?.olderThan) {
  count = await db.history.where('sentAt').below(options.olderThan).delete();
} else {
  count = await db.history.clear();
}

return { success: true, data: count };
```

---

## 7. WebSocket Storage API

**Module:** `/lib/storage/websockets.ts`

### 7.1 Create WebSocket Connection

**Purpose:** Store active WebSocket connection state

**Operation Signature:**
```typescript
async function createWSConnection(
  data: CreateWSConnectionDTO
): Promise<Result<WebSocketConnection>>

interface CreateWSConnectionDTO {
  url: string;              // WebSocket URL (ws:// or wss://)
  protocols?: string[];     // Subprotocols
  headers?: Header[];       // Connection headers
  collectionId?: string;
}
```

**Returns:**
- Success: WebSocketConnection entity with `status: 'connecting'`

**Dexie Query Example:**
```typescript
const connection: WebSocketConnection = {
  id: crypto.randomUUID(),
  url: data.url,
  protocols: data.protocols,
  headers: data.headers,
  status: 'connecting',
  collectionId: data.collectionId,
  connectedAt: null,
  disconnectedAt: null,
  createdAt: Date.now()
};

await db.wsConnections.add(connection);
return { success: true, data: connection };
```

---

### 7.2 Update Connection Status

**Purpose:** Update WebSocket connection state

**Operation Signature:**
```typescript
async function updateWSStatus(
  id: string,
  status: 'connected' | 'disconnected' | 'error',
  error?: string
): Promise<Result<void>>
```

**Dexie Query Example:**
```typescript
const updates: Partial<WebSocketConnection> = { status };

if (status === 'connected') {
  updates.connectedAt = Date.now();
} else if (status === 'disconnected' || status === 'error') {
  updates.disconnectedAt = Date.now();
  if (error) {
    updates.error = error;
  }
}

await db.wsConnections.update(id, updates);
return { success: true, data: undefined };
```

---

### 7.3 Add WebSocket Message

**Purpose:** Store sent/received WebSocket message

**Operation Signature:**
```typescript
async function addWSMessage(
  data: CreateWSMessageDTO
): Promise<Result<WSMessage>>

interface CreateWSMessageDTO {
  connectionId: string;
  direction: 'sent' | 'received';
  payload: string;          // Message content
  timestamp: number;        // Unix timestamp
}
```

**Returns:**
- Success: WSMessage entity

**Dexie Query Example:**
```typescript
const message: WSMessage = {
  id: crypto.randomUUID(),
  connectionId: data.connectionId,
  direction: data.direction,
  payload: data.payload,
  timestamp: data.timestamp
};

await db.wsMessages.add(message);
return { success: true, data: message };
```

---

### 7.4 List WebSocket Messages

**Purpose:** Get message history for connection

**Operation Signature:**
```typescript
async function listWSMessages(
  connectionId: string,
  options?: { limit?: number; offset?: number }
): Promise<Result<WSMessage[]>>
```

**Returns:**
- Success: Array of messages (chronological order)

**Dexie Query Example:**
```typescript
const messages = await db.wsMessages
  .where('connectionId')
  .equals(connectionId)
  .sortBy('timestamp');

const paginated = messages.slice(
  options?.offset || 0,
  (options?.offset || 0) + (options?.limit || 100)
);

return { success: true, data: paginated };
```

---

## 8. GraphQL Storage API

**Module:** `/lib/storage/graphql.ts`

### 8.1 Create GraphQL Query

**Purpose:** Store GraphQL query with schema context

**Operation Signature:**
```typescript
async function createGraphQLQuery(
  data: CreateGraphQLQueryDTO
): Promise<Result<GraphQLQuery>>

interface CreateGraphQLQueryDTO {
  name: string;             // 1-100 chars
  endpoint: string;         // GraphQL endpoint URL
  query: string;            // GraphQL query string
  variables?: Record<string, any>; // Query variables (JSON)
  headers?: Header[];       // Request headers
  schema?: string;          // Introspection schema (JSON)
  collectionId?: string;
}
```

**Validation Rules:**
- `query`: Must be valid GraphQL syntax
- `schema`: If provided, validate query against schema

**Returns:**
- Success: GraphQLQuery entity

**Dexie Query Example:**
```typescript
const graphqlQuery: GraphQLQuery = {
  id: crypto.randomUUID(),
  name: data.name,
  endpoint: data.endpoint,
  query: data.query,
  variables: data.variables,
  headers: data.headers,
  schema: data.schema,
  collectionId: data.collectionId,
  createdAt: Date.now(),
  updatedAt: Date.now()
};

await db.graphqlQueries.add(graphqlQuery);
return { success: true, data: graphqlQuery };
```

---

### 8.2 Update GraphQL Schema

**Purpose:** Store introspection result for endpoint

**Operation Signature:**
```typescript
async function updateGraphQLSchema(
  id: string,
  schema: string
): Promise<Result<void>>
```

**Dexie Query Example:**
```typescript
await db.graphqlQueries.update(id, {
  schema,
  updatedAt: Date.now()
});

return { success: true, data: undefined };
```

---

## 9. Transaction Patterns

### 9.1 Bulk Import (Postman Collection)

**Purpose:** Atomically import collection with all nested entities

**Transaction Scope:**
- collections, folders, requests, variables (read-write)

**Pattern:**
```typescript
async function importPostmanCollection(data: PostmanCollection): Promise<Result<Collection>> {
  return await db.transaction('rw', [db.collections, db.folders, db.requests, db.variables], async () => {
    // 1. Create collection
    const collection = await createCollection({ name: data.info.name });
    
    // 2. Create folders (maintain hierarchy)
    const folderMap = new Map<string, string>(); // oldId -> newId
    for (const folder of data.item.filter(i => i.item)) {
      const created = await createFolder({
        name: folder.name,
        collectionId: collection.data.id
      });
      folderMap.set(folder._postman_id, created.data.id);
    }
    
    // 3. Create requests
    for (const item of data.item) {
      if (item.request) {
        await createRequest({
          name: item.name,
          method: item.request.method,
          url: item.request.url.raw,
          collectionId: collection.data.id,
          folderId: item.parentId ? folderMap.get(item.parentId) : undefined
        });
      }
    }
    
    // 4. Create variables
    for (const variable of data.variable || []) {
      await createVariable({
        key: variable.key,
        value: variable.value,
        scope: 'collection',
        collectionId: collection.data.id
      });
    }
    
    return collection;
  });
}
```

---

### 9.2 Request Execution with History

**Purpose:** Send request and record history in single transaction

**Transaction Scope:**
- history, requests (read-write)

**Pattern:**
```typescript
async function executeAndRecord(requestId: string, context: ExecutionContext): Promise<Result<HistoryEntry>> {
  return await db.transaction('rw', [db.requests, db.history], async () => {
    // 1. Get request config
    const request = await getRequest(requestId);
    
    // 2. Execute HTTP request (outside transaction)
    const response = await fetch(request.data.url, {
      method: request.data.method,
      headers: buildHeaders(request.data),
      body: buildBody(request.data.body)
    });
    
    // 3. Record history
    const entry = await createHistoryEntry({
      request: {
        method: request.data.method,
        url: request.data.url,
        headers: request.data.headers || [],
        body: request.data.body,
        authConfig: request.data.authConfig
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Array.from(response.headers.entries()).map(([k, v]) => ({ key: k, value: v })),
        body: await response.text(),
        size: parseInt(response.headers.get('content-length') || '0'),
        time: performance.now() - startTime
      },
      collectionId: request.data.collectionId,
      environmentId: context.environmentId
    });
    
    return entry;
  });
}
```

---

## 10. Error Handling

### Common Error Scenarios

**NOT_FOUND:**
```typescript
// Entity doesn't exist
{ code: 'NOT_FOUND', message: 'Request abc-123 not found' }
```

**VALIDATION_ERROR:**
```typescript
// Invalid input data
{ code: 'VALIDATION_ERROR', message: 'URL must be valid format', context: { url: 'invalid' } }
```

**CONSTRAINT_VIOLATION:**
```typescript
// Business rule violation
{ code: 'CONSTRAINT_VIOLATION', message: 'Folder nesting depth exceeds 3 levels' }
```

**ENCRYPTION_ERROR:**
```typescript
// Crypto operation failed
{ code: 'ENCRYPTION_ERROR', message: 'Failed to encrypt credentials' }
```

**QUOTA_EXCEEDED:**
```typescript
// Storage limit reached
{ code: 'QUOTA_EXCEEDED', message: 'IndexedDB quota exceeded (50MB limit)' }
```

**TRANSACTION_ERROR:**
```typescript
// Transaction rolled back
{ code: 'TRANSACTION_ERROR', message: 'Failed to import collection', context: { reason: 'duplicate names' } }
```

---

## 11. Performance Characteristics

### Index Usage

**Fast Lookups (O(log n)):**
- Get by ID: All entities indexed on `id` (primary key)
- Collection requests: `requests.collectionId` index
- Folder contents: `folders.collectionId`, `requests.folderId` indexes
- Environment variables: Compound index `[key+scope+environmentId]`
- History search: `history.sentAt` index for time-range queries

**Slow Operations (Full Scans):**
- Search history by URL substring (no index on URL)
- Filter requests by header values (not indexed)

### Query Timing Goals

- Get by ID: < 5ms
- List collection requests: < 50ms for 500 requests
- History search: < 200ms for 1000 entries
- Variable resolution: < 10ms (3 index lookups max)

### Storage Limits

- IndexedDB quota: ~50MB (varies by browser)
- Single request body: Max 10MB
- History entries: 1000 max (LRU eviction)
- Collection requests: 500+ supported (no hard limit)

---

## Appendix A: Helper Functions

### Encryption Utilities

```typescript
// lib/storage/crypto.ts

async function encryptValue(plaintext: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  const key = await getEncryptionKey(); // Derived from master key
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  // Return base64(iv + ciphertext)
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

async function decryptValue(ciphertext: string): Promise<string> {
  const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  
  const key = await getEncryptionKey();
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
```

### Folder Depth Calculation

```typescript
// lib/storage/folders.ts

async function calculateFolderDepth(folderId: string): Promise<number> {
  let depth = 1;
  let currentId: string | undefined = folderId;
  
  while (currentId) {
    const folder = await db.folders.get(currentId);
    if (!folder || !folder.parentFolderId) break;
    
    currentId = folder.parentFolderId;
    depth++;
  }
  
  return depth;
}

async function getDescendantFolderIds(folderId: string): Promise<string[]> {
  const descendants: string[] = [];
  const queue: string[] = [folderId];
  
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = await db.folders.where('parentFolderId').equals(currentId).toArray();
    
    for (const child of children) {
      descendants.push(child.id);
      queue.push(child.id);
    }
  }
  
  return descendants;
}
```

---

## Appendix B: Dexie.js Schema Definition

```typescript
// lib/db/schema.ts

import Dexie, { Table } from 'dexie';

export class RestifyDB extends Dexie {
  requests!: Table<Request>;
  collections!: Table<Collection>;
  folders!: Table<Folder>;
  environments!: Table<Environment>;
  variables!: Table<Variable>;
  history!: Table<HistoryEntry>;
  wsConnections!: Table<WebSocketConnection>;
  wsMessages!: Table<WSMessage>;
  graphqlQueries!: Table<GraphQLQuery>;

  constructor() {
    super('restify');
    
    this.version(1).stores({
      requests: 'id, collectionId, folderId, updatedAt',
      collections: 'id, name, updatedAt',
      folders: 'id, collectionId, parentFolderId',
      environments: 'id, name, isActive',
      variables: 'id, [key+scope], [key+scope+environmentId], [key+scope+collectionId], [key+scope+environmentId+collectionId]',
      history: 'id, sentAt, collectionId, environmentId',
      wsConnections: 'id, collectionId, createdAt',
      wsMessages: 'id, connectionId, timestamp',
      graphqlQueries: 'id, collectionId, updatedAt'
    });
  }
}

export const db = new RestifyDB();
```

---

**Document Status:** Draft - Ready for implementation  
**Next Steps:**
1. Implement `/lib/storage/*.ts` modules using these contracts
2. Create unit tests for each API operation
3. Validate encryption/decryption performance
4. Load test with 1000+ history entries
