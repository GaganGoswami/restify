# Data Model: REST API Testing Tool

**Feature**: 001-api-tester  
**Date**: 2025-11-12  
**Phase**: 1 - Design & Contracts

## Overview

This document defines the data models for the REST API testing tool. All data is stored in **IndexedDB** via Dexie.js for persistence across sessions. Entities are designed to support the 8 prioritized user stories with efficient querying and relationships.

---

## Storage Technology

**Primary Storage**: IndexedDB via Dexie.js  
**Supplementary Storage**: LocalStorage (UI preferences only)

**Rationale**: IndexedDB supports unlimited storage (user-permissioned), complex queries, and relationships—essential for storing 1000+ history entries and large collections. Dexie.js provides Promise-based API and TypeScript support.

---

## Entity Definitions

### 1. Request

**Purpose**: Represents an HTTP request configuration that can be executed, saved to collections, or restored from history.

**Schema**:

| Field             | Type                  | Required | Description                                    |
|-------------------|-----------------------|----------|------------------------------------------------|
| `id`              | `string` (UUID)       | Yes      | Unique identifier                              |
| `name`            | `string`              | Yes      | User-friendly name (e.g., "Get User by ID")    |
| `method`          | `HttpMethod`          | Yes      | GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS   |
| `url`             | `string`              | Yes      | Full URL with protocol (https://api.example.com/users) |
| `queryParams`     | `KeyValuePair[]`      | No       | Query parameters (key, value, enabled)         |
| `headers`         | `KeyValuePair[]`      | No       | Request headers (key, value, enabled)          |
| `body`            | `RequestBody \| null` | No       | Request body configuration                     |
| `authConfig`      | `AuthConfig \| null`  | No       | Authentication configuration                   |
| `testScript`      | `string \| null`      | No       | JavaScript test script (Chai-like syntax)      |
| `preRequestScript`| `string \| null`      | No       | Pre-request script for dynamic values          |
| `collectionId`    | `string \| null`      | No       | Parent collection ID (if saved to collection)  |
| `folderId`        | `string \| null`      | No       | Parent folder ID within collection             |
| `createdAt`       | `Date`                | Yes      | Timestamp when created                         |
| `updatedAt`       | `Date`                | Yes      | Timestamp when last modified                   |

**Indexes**: `id` (primary), `collectionId`, `folderId`, `updatedAt`

**Validation Rules**:
- `url` must be valid HTTP/HTTPS URL (FR-002)
- `method` must be one of 7 supported methods (FR-001)
- `queryParams` and `headers` keys cannot be empty strings
- `body` required for POST, PUT, PATCH methods (unless explicitly empty)

**Relationships**:
- Belongs to one `Collection` (optional, via `collectionId`)
- Belongs to one `Folder` (optional, via `folderId`)
- Generates multiple `HistoryEntry` records when executed

---

### 2. RequestBody

**Purpose**: Defines the body content and type for HTTP requests.

**Schema**:

| Field        | Type            | Required | Description                                    |
|--------------|-----------------|----------|------------------------------------------------|
| `type`       | `BodyType`      | Yes      | json, formData, urlencoded, raw, binary        |
| `content`    | `string \| FormData \| File` | Yes | Body content (JSON string, form data, etc.)    |
| `contentType`| `string \| null`| No       | MIME type (auto-set based on type if null)     |

**BodyType Enum**:
- `json`: JSON object (Content-Type: application/json)
- `formData`: Multipart form data (Content-Type: multipart/form-data)
- `urlencoded`: URL-encoded form data (Content-Type: application/x-www-form-urlencoded)
- `raw`: Plain text (Content-Type: text/plain)
- `binary`: File upload (Content-Type: application/octet-stream)

**Validation Rules**:
- `json` type: content must be valid JSON (FR-007)
- `formData` and `urlencoded`: content must be key-value pairs
- `binary`: content must be File object

---

### 3. AuthConfig

**Purpose**: Stores authentication configuration for requests.

**Schema**:

| Field            | Type            | Required | Description                                    |
|------------------|-----------------|----------|------------------------------------------------|
| `type`           | `AuthType`      | Yes      | bearer, basic, apiKey, oauth2                  |
| `bearer`         | `BearerAuth \| null` | No   | Bearer token configuration                     |
| `basic`          | `BasicAuth \| null`  | No   | Basic auth credentials                         |
| `apiKey`         | `ApiKeyAuth \| null` | No   | API key configuration                          |
| `oauth2`         | `OAuth2Config \| null` | No | OAuth 2.0 configuration                        |

**AuthType Enum**:
- `bearer`: Bearer token in Authorization header
- `basic`: Basic authentication (username/password)
- `apiKey`: API key in header or query parameter
- `oauth2`: OAuth 2.0 authorization flow

**Sub-types**:

```typescript
interface BearerAuth {
  token: string; // Encrypted in storage (FR-014)
}

interface BasicAuth {
  username: string;
  password: string; // Encrypted in storage (FR-014)
}

interface ApiKeyAuth {
  key: string;
  value: string; // Encrypted in storage (FR-014)
  addTo: 'header' | 'query'; // Where to add the API key
}

interface OAuth2Config {
  accessToken: string | null; // Encrypted (FR-014)
  refreshToken: string | null; // Encrypted (FR-014)
  clientId: string;
  clientSecret: string; // Encrypted (FR-014)
  authUrl: string;
  tokenUrl: string;
  scope: string;
  expiresAt: Date | null;
}
```

**Security Note**: All credential fields (token, password, value, clientSecret) are encrypted using Web Crypto API before storage (FR-014).

---

### 4. Collection

**Purpose**: Organizes related requests into logical groups with hierarchical folder structure.

**Schema**:

| Field        | Type            | Required | Description                                    |
|--------------|-----------------|----------|------------------------------------------------|
| `id`         | `string` (UUID) | Yes      | Unique identifier                              |
| `name`       | `string`        | Yes      | Collection name (e.g., "User API Tests")       |
| `description`| `string \| null`| No       | Optional description                           |
| `createdAt`  | `Date`          | Yes      | Timestamp when created                         |
| `updatedAt`  | `Date`          | Yes      | Timestamp when last modified                   |

**Indexes**: `id` (primary), `name`, `updatedAt`

**Validation Rules**:
- `name` cannot be empty string (min 1 character)
- `name` must be unique across collections

**Relationships**:
- Has many `Folder` (via `collectionId` foreign key)
- Has many `Request` (via `collectionId` foreign key)
- Has many `Variable` (collection-scoped variables)

---

### 5. Folder

**Purpose**: Provides hierarchical organization within collections (up to 3 levels of nesting per FR-027).

**Schema**:

| Field          | Type            | Required | Description                                    |
|----------------|-----------------|----------|------------------------------------------------|
| `id`           | `string` (UUID) | Yes      | Unique identifier                              |
| `name`         | `string`        | Yes      | Folder name (e.g., "Authentication Endpoints") |
| `collectionId` | `string`        | Yes      | Parent collection ID                           |
| `parentFolderId`| `string \| null`| No      | Parent folder ID (null if top-level)           |
| `order`        | `number`        | Yes      | Display order within parent (0-indexed)        |
| `createdAt`    | `Date`          | Yes      | Timestamp when created                         |
| `updatedAt`    | `Date`          | Yes      | Timestamp when last modified                   |

**Indexes**: `id` (primary), `collectionId`, `parentFolderId`

**Validation Rules**:
- `name` cannot be empty string
- Maximum nesting depth: 3 levels (FR-027)
- Cannot create circular references (parent cannot be descendant)

**Relationships**:
- Belongs to one `Collection`
- Optionally belongs to one parent `Folder`
- Has many child `Folder` (nested folders)
- Has many `Request` (via `folderId` foreign key)

---

### 6. Environment

**Purpose**: Defines named sets of variables for different deployment contexts (Local, Dev, Staging, Production).

**Schema**:

| Field        | Type            | Required | Description                                    |
|--------------|-----------------|----------|------------------------------------------------|
| `id`         | `string` (UUID) | Yes      | Unique identifier                              |
| `name`       | `string`        | Yes      | Environment name (e.g., "Production")          |
| `isActive`   | `boolean`       | Yes      | Whether this environment is currently selected |
| `createdAt`  | `Date`          | Yes      | Timestamp when created                         |
| `updatedAt`  | `Date`          | Yes      | Timestamp when last modified                   |

**Indexes**: `id` (primary), `name`, `isActive`

**Validation Rules**:
- `name` must be unique across environments
- Only one environment can have `isActive = true` at a time

**Relationships**:
- Has many `Variable` (environment-scoped variables)

**Special Behavior**:
- Switching environments updates `isActive` flag and resolves variables in all requests (FR-043: <100ms)

---

### 7. Variable

**Purpose**: Key-value pairs that can be referenced in requests using `{{variableName}}` syntax.

**Schema**:

| Field          | Type            | Required | Description                                    |
|----------------|-----------------|----------|------------------------------------------------|
| `id`           | `string` (UUID) | Yes      | Unique identifier                              |
| `key`          | `string`        | Yes      | Variable name (no spaces, alphanumeric + _)    |
| `value`        | `string`        | Yes      | Variable value                                 |
| `scope`        | `VariableScope` | Yes      | global, environment, collection                |
| `environmentId`| `string \| null`| No       | Environment ID (if scope = environment)        |
| `collectionId` | `string \| null`| No       | Collection ID (if scope = collection)          |
| `isSecret`     | `boolean`       | No       | If true, value is encrypted and masked in UI   |
| `createdAt`    | `Date`          | Yes      | Timestamp when created                         |
| `updatedAt`    | `Date`          | Yes      | Timestamp when last modified                   |

**Indexes**: `id` (primary), `key`, `scope`, `environmentId`, `collectionId`

**VariableScope Enum**:
- `global`: Available in all requests
- `environment`: Available only when parent environment is active
- `collection`: Available only in requests within parent collection

**Precedence** (FR-042): Collection > Environment > Global

**Validation Rules**:
- `key` must match regex: `^[a-zA-Z0-9_]+$` (no spaces or special chars except underscore)
- `key` must be unique within scope (can have same key in different scopes)
- If `scope = environment`, `environmentId` must not be null
- If `scope = collection`, `collectionId` must not be null

**Relationships**:
- Optionally belongs to one `Environment`
- Optionally belongs to one `Collection`

---

### 8. HistoryEntry

**Purpose**: Records all sent requests with full context for debugging and reproduction (FR-053-FR-059).

**Schema**:

| Field            | Type            | Required | Description                                    |
|------------------|-----------------|----------|------------------------------------------------|
| `id`             | `string` (UUID) | Yes      | Unique identifier                              |
| `requestId`      | `string \| null`| No       | Original request ID (if saved to collection)   |
| `method`         | `HttpMethod`    | Yes      | HTTP method used                               |
| `url`            | `string`        | Yes      | Full URL that was called                       |
| `requestHeaders` | `Record<string, string>` | Yes | Headers sent (after variable resolution)       |
| `requestBody`    | `string \| null`| No       | Body content sent (after variable resolution)  |
| `statusCode`     | `number`        | Yes      | HTTP status code received (e.g., 200, 404)     |
| `statusText`     | `string`        | Yes      | Status text (e.g., "OK", "Not Found")          |
| `responseHeaders`| `Record<string, string>` | Yes | Response headers received                      |
| `responseBody`   | `string \| null`| No       | Response body (truncated if >10MB)             |
| `responseTime`   | `number`        | Yes      | Response time in milliseconds                  |
| `responseSize`   | `number`        | Yes      | Response size in bytes                         |
| `timestamp`      | `Date`          | Yes      | When request was sent                          |
| `testResults`    | `TestResult[] \| null` | No | Test execution results (if tests present)      |

**Indexes**: `id` (primary), `method`, `statusCode`, `timestamp`, `requestId`

**Validation Rules**:
- Must store minimum 1000 entries (FR-054)
- Implement LRU eviction when storage limit reached
- `responseBody` truncated to 10MB max (FR-019 allows up to 10MB rendering)

**Relationships**:
- Optionally references one `Request` (if from saved collection)

**Search/Filter Support** (FR-055-FR-056):
- Filter by `method` (GET, POST, etc.)
- Filter by `statusCode` range (2xx, 4xx, 5xx)
- Filter by `timestamp` date range
- Search by `url` pattern (LIKE query)
- Return results within 200ms (indexed fields)

---

### 9. TestResult

**Purpose**: Stores results from automated test script execution (FR-045-FR-051).

**Schema**:

| Field        | Type            | Required | Description                                    |
|--------------|-----------------|----------|------------------------------------------------|
| `id`         | `string` (UUID) | Yes      | Unique identifier                              |
| `name`       | `string`        | Yes      | Test name (from `pm.test("name", ...)`)        |
| `passed`     | `boolean`       | Yes      | Whether test passed or failed                  |
| `error`      | `string \| null`| No       | Error message if failed                        |
| `duration`   | `number`        | Yes      | Test execution time in milliseconds            |

**Validation Rules**:
- All tests must complete within 100ms total (FR-047)
- Individual test duration tracked for performance insights

**Embedded In**: `HistoryEntry.testResults` (not separate table, stored as JSON array)

---

### 10. WebSocketConnection

**Purpose**: Manages active WebSocket connections with message history (FR-066-FR-070).

**Schema**:

| Field           | Type            | Required | Description                                    |
|-----------------|-----------------|----------|------------------------------------------------|
| `id`            | `string` (UUID) | Yes      | Unique identifier                              |
| `url`           | `string`        | Yes      | WebSocket URL (wss:// or ws://)                |
| `status`        | `ConnectionStatus` | Yes   | connecting, connected, disconnected, error     |
| `messages`      | `WSMessage[]`   | Yes      | Message history (last 100 messages)            |
| `autoReconnect` | `boolean`       | Yes      | Whether to auto-reconnect on disconnect        |
| `connectedAt`   | `Date \| null`  | No       | When connection was established                |
| `disconnectedAt`| `Date \| null`  | No       | When connection was closed                     |

**Indexes**: `id` (primary), `url`, `status`

**ConnectionStatus Enum**:
- `connecting`: Connection attempt in progress
- `connected`: Successfully connected
- `disconnected`: Connection closed gracefully
- `error`: Connection failed or dropped unexpectedly

**Relationships**:
- Has many `WSMessage` (embedded, not separate table)

---

### 11. WSMessage

**Purpose**: Individual WebSocket message (sent or received).

**Schema**:

| Field        | Type            | Required | Description                                    |
|--------------|-----------------|----------|------------------------------------------------|
| `id`         | `string` (UUID) | Yes      | Unique identifier                              |
| `direction`  | `'sent' \| 'received'` | Yes | Message direction                              |
| `content`    | `string`        | Yes      | Message content                                |
| `timestamp`  | `Date`          | Yes      | When message was sent/received                 |
| `size`       | `number`        | Yes      | Message size in bytes                          |

**Validation Rules**:
- Display messages within 50ms of receipt (FR-069)
- Retain last 100 messages per connection (memory management)

**Embedded In**: `WebSocketConnection.messages` (JSON array, not separate table)

---

### 12. GraphQLQuery

**Purpose**: Stores GraphQL queries with schema and variables (FR-071-FR-075).

**Schema**:

| Field          | Type            | Required | Description                                    |
|----------------|-----------------|----------|------------------------------------------------|
| `id`           | `string` (UUID) | Yes      | Unique identifier                              |
| `name`         | `string`        | Yes      | Query name (e.g., "Get User Profile")          |
| `endpoint`     | `string`        | Yes      | GraphQL endpoint URL                           |
| `query`        | `string`        | Yes      | GraphQL query or mutation string               |
| `variables`    | `Record<string, any> \| null` | No | Query variables (JSON object)                  |
| `schema`       | `GraphQLSchema \| null` | No  | Parsed schema from introspection               |
| `createdAt`    | `Date`          | Yes      | Timestamp when created                         |
| `updatedAt`    | `Date`          | Yes      | Timestamp when last modified                   |

**Indexes**: `id` (primary), `endpoint`, `updatedAt`

**Validation Rules**:
- `query` must be valid GraphQL syntax
- `schema` populated via introspection query (FR-071)
- `variables` must be valid JSON object

**Relationships**:
- Can be saved to `Collection` (similar to REST requests, optional future feature)

---

## IndexedDB Schema (Dexie.js)

```typescript
import Dexie, { Table } from 'dexie';

class RestifyDatabase extends Dexie {
  requests!: Table<Request>;
  collections!: Table<Collection>;
  folders!: Table<Folder>;
  environments!: Table<Environment>;
  variables!: Table<Variable>;
  history!: Table<HistoryEntry>;
  websockets!: Table<WebSocketConnection>;
  graphqlQueries!: Table<GraphQLQuery>;

  constructor() {
    super('RestifyDB');
    
    this.version(1).stores({
      requests: 'id, collectionId, folderId, updatedAt',
      collections: 'id, name, updatedAt',
      folders: 'id, collectionId, parentFolderId',
      environments: 'id, name, isActive',
      variables: 'id, key, scope, environmentId, collectionId',
      history: 'id, method, statusCode, timestamp, requestId',
      websockets: 'id, url, status',
      graphqlQueries: 'id, endpoint, updatedAt'
    });
  }
}

export const db = new RestifyDatabase();
```

---

## Data Flow Examples

### Example 1: Sending a Request

1. User configures request in UI (URL, method, headers, body, auth)
2. Request data stored in `request-store` (Zustand)
3. User clicks "Send"
4. HTTP client:
   - Resolves variables from `Variable` table (based on active environment)
   - Applies auth from `AuthConfig`
   - Sends request via Fetch API
5. Response received:
   - Store in `HistoryEntry` table
   - Execute test scripts (if present)
   - Store `TestResult` in history entry
   - Display response in UI

### Example 2: Switching Environments

1. User selects "Production" from environment dropdown
2. Update `isActive = true` for Production, `false` for others in `Environment` table (FR-043: <100ms)
3. Re-resolve all variables in current request using new environment's `Variable` records
4. Update UI with resolved values (realtime, FR-039)

### Example 3: Importing Postman Collection

1. User uploads Postman JSON file
2. Parser (`lib/parsers/postman.ts`) converts to internal format
3. Create `Collection` record
4. Create `Folder` records (if present)
5. Create `Request` records with relationships
6. Create `Variable` records (collection-scoped)
7. Display in sidebar immediately (FR-034: <1s for 500+ requests)

---

## Performance Considerations

**Query Optimization**:
- All frequently queried fields are indexed (e.g., `timestamp`, `statusCode`, `method`)
- History search uses compound index: `[method+statusCode+timestamp]` for fast filtering
- Collection tree uses `collectionId + parentFolderId` index for efficient hierarchy traversal

**Storage Limits**:
- IndexedDB: Unlimited (user-permissioned), but implement 50MB soft limit with user notification
- LocalStorage: <10KB total for UI preferences (theme, sidebar state)
- LRU eviction for history when approaching limits

**Caching Strategy**:
- Collections/environments/variables: Keep in memory (Zustand store) after first load
- History: Query on-demand with pagination (load 50 entries at a time)
- Responses: Store compressed in IndexedDB, decompress on view

---

## Security & Encryption

**Sensitive Fields** (FR-014):
- `AuthConfig.bearer.token`
- `AuthConfig.basic.password`
- `AuthConfig.apiKey.value`
- `AuthConfig.oauth2.accessToken`
- `AuthConfig.oauth2.refreshToken`
- `AuthConfig.oauth2.clientSecret`
- `Variable.value` (if `isSecret = true`)

**Encryption Approach**:
- Use Web Crypto API (`crypto.subtle.encrypt`) with AES-GCM
- Derive encryption key from user's device (IndexedDB + deviceId, never transmitted)
- Encrypt before storing, decrypt on retrieval
- Implementation in `lib/utils/crypto.ts`

---

## Next Steps

1. Implement Dexie.js database initialization in `lib/storage/db.ts`
2. Create CRUD operations for each entity in `lib/storage/` modules
3. Define TypeScript interfaces in `types/` directory
4. Proceed to **contracts/storage-api.md** for API documentation
