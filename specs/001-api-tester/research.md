# Research: REST API Testing Tool

**Feature**: 001-api-tester  
**Date**: 2025-11-12  
**Phase**: 0 - Outline & Research

## Purpose

This document consolidates research findings for architectural decisions, technology choices, and best practices for building the REST API testing tool. All decisions are guided by the project constitution and feature requirements.

---

## 1. State Management Strategy

### Decision

Use **dual state management approach**:
- **Zustand** for synchronous, client-side global state (UI state, current request configuration, active environment)
- **TanStack Query (React Query)** for asynchronous server state (HTTP requests, response caching)

### Rationale

- **Zustand**: Lightweight (~1KB), minimal boilerplate, excellent TypeScript support, perfect for UI state and form data that doesn't involve server communication
- **React Query**: Purpose-built for async data fetching with automatic caching, refetching, and request deduplication—essential for managing HTTP requests and responses efficiently
- **Separation of concerns**: Zustand handles "what the user is typing/configuring", React Query handles "what responses we've received"
- **Constitution compliance**: Principle II mandates Zustand + React Query specifically

### Alternatives Considered

- **Redux Toolkit**: More boilerplate, larger bundle size (~10KB+), overkill for this use case
- **Jotai/Recoil**: Atomic state management adds complexity without clear benefits for our use case
- **Zustand-only**: Would require manual implementation of caching, request deduplication, and background refetching that React Query provides out-of-the-box

---

## 2. IndexedDB vs LocalStorage for Persistence

### Decision

Use **Dexie.js (IndexedDB wrapper)** for primary storage with LocalStorage as fallback for preferences.

**Storage breakdown**:
- **IndexedDB (via Dexie.js)**: Collections, requests, history entries, environment configurations (structured data, large volumes)
- **LocalStorage**: Theme preference, sidebar collapsed state, last selected environment (simple key-value, <10KB total)

### Rationale

- **Capacity**: IndexedDB supports unlimited storage (user-permissioned), LocalStorage limited to 5-10MB
- **Performance**: IndexedDB is asynchronous and indexed, critical for searching 1000+ history entries (FR-054)
- **Structure**: IndexedDB supports complex queries and relationships (collections → folders → requests)
- **Dexie.js benefits**: Provides Promise-based API, TypeScript support, and automatic schema migrations
- **LocalStorage for simple data**: Synchronous access appropriate for theme/UI preferences that need immediate availability

### Alternatives Considered

- **LocalStorage-only**: 5MB limit insufficient for 1000 requests × ~10KB each = 10MB+ requirement
- **Raw IndexedDB API**: Verbose callback-based API increases development time and error potential
- **PouchDB/RxDB**: Offline-first sync capabilities unnecessary (no backend), adds ~100KB+ bundle size
- **Server-side storage**: Violates constitution Principle IV (client-side execution, local storage default)

---

## 3. Code Editor Component Selection

### Decision

Use **Monaco Editor** (VS Code's editor) for JSON body editor and test script editor.

### Rationale

- **Best-in-class experience**: Monaco Editor powers VS Code—developers already familiar with keybindings and features
- **Built-in features**: Syntax highlighting, IntelliSense, error detection, multi-cursor editing, find/replace
- **JSON support**: Native JSON language support with schema validation
- **TypeScript support**: Required for test script editor (Chai-like assertions)
- **Performance**: Efficiently handles large JSON payloads (FR-019: 10MB+ responses)
- **Bundle size**: ~1.5MB gzipped, but lazy-loaded only when editor is used (amortized across usage)

### Alternatives Considered

- **CodeMirror 6**: Smaller bundle (~300KB), but less feature-complete than Monaco, requires more configuration
- **Textarea + Prism.js**: Syntax highlighting only (no IntelliSense, error detection), poor UX for developers
- **Ace Editor**: Older, less maintained, inferior TypeScript support
- **Custom-built editor**: Would take 2-3 months to reach feature parity, not viable

---

## 4. HTTP Client Implementation

### Decision

Use **native Fetch API** with custom wrapper for interceptors and request/response processing.

### Rationale

- **Browser native**: Zero bundle size impact, universally supported in target browsers
- **Modern API**: Promise-based, clean async/await syntax
- **Sufficient features**: Supports all HTTP methods, headers, body types, streaming responses
- **Custom wrapper needs**: 
  - Variable interpolation (resolve `{{variableName}}` before sending)
  - Auth header injection
  - Request/response interceptors for history logging
  - Timeout handling
  - Progress tracking for large uploads
- **Constitution alignment**: Principle IV mandates client-side execution—Fetch runs entirely in browser

### Alternatives Considered

- **Axios**: Popular but adds ~14KB gzipped, features (interceptors, automatic JSON parsing) can be replicated in thin wrapper
- **ky/got**: Smaller than Axios (~5KB) but still unnecessary dependency when Fetch + wrapper suffices
- **XMLHttpRequest**: Legacy API, callback-based, poor developer experience

**Implementation approach**: Create `lib/http/client.ts` with:
```typescript
class HttpClient {
  async send(config: RequestConfig): Promise<RequestResponse> {
    // 1. Resolve variables in URL, headers, body
    // 2. Apply auth headers
    // 3. Execute fetch with AbortController for timeout
    // 4. Track timing metrics
    // 5. Save to history
    // 6. Return formatted response
  }
}
```

---

## 5. Test Script Execution Environment

### Decision

Use **isolated JavaScript VM context** via `new Function()` with sandboxed `pm` object (Postman-compatible test API).

### Rationale

- **Security**: `new Function()` safer than `eval()`, still isolated from global scope
- **Postman compatibility**: FR-045 implies Chai-like syntax; Postman uses `pm.test()`, `pm.expect()`, `pm.response`
- **No dependencies**: Avoids adding VM libraries, keeps bundle small
- **Sufficient isolation**: User test scripts can't access application state or make unauthorized network calls

**Test API interface**:
```typescript
interface TestAPI {
  test(name: string, fn: () => void): void;
  expect(value: any): ChaiAssertions;
  response: {
    status: number;
    json(): any;
    text(): string;
    headers: Record<string, string>;
    responseTime: number;
  };
}
```

### Alternatives Considered

- **vm2 library**: Node.js-specific, doesn't work in browser
- **iframe sandbox**: Overly complex, communication overhead, potential CORS issues
- **Web Workers**: Cannot access DOM or main thread state synchronously, complicates test result reporting
- **Disable test scripts**: Fails FR-045-FR-051 requirements

**Safety measures**:
- Timeout enforcement (5 seconds max per test)
- Try-catch wrapper around user code
- No access to `window`, `document`, `localStorage`, or `fetch`

---

## 6. Postman Collection Import/Export

### Decision

Implement **Postman Collection Format v2.1** parser and generator in `lib/parsers/postman.ts`.

### Rationale

- **Explicit requirement**: FR-030 mandates 100% compatibility with Postman v2.1 format
- **Migration path**: Critical for user adoption—users must be able to import existing Postman collections
- **Standard format**: v2.1 is JSON-based, well-documented, stable format
- **Comprehensive coverage**: Supports folders, variables, auth, pre-request scripts, tests

**Mapping strategy**:

| Postman v2.1 Field       | Restify Internal Model    |
|--------------------------|---------------------------|
| `collection.info.name`   | `Collection.name`         |
| `collection.item[]`      | `Collection.folders/requests` |
| `item.request.url`       | `Request.url`             |
| `item.request.method`    | `Request.method`          |
| `item.request.header[]`  | `Request.headers`         |
| `item.request.body`      | `Request.body`            |
| `item.request.auth`      | `Request.authConfig`      |
| `item.event[].script`    | `Request.preRequestScript` / `testScript` |
| `collection.variable[]`  | `Environment.variables` (collection scope) |

### Alternatives Considered

- **Postman v1 format**: Deprecated, limited adoption
- **Custom format only**: Would block user migration from Postman, fails FR-030
- **OpenAPI only**: Different purpose (API specification vs. test collections), doesn't replace Postman import

---

## 7. Service Worker & Offline Strategy

### Decision

Use **Workbox** (Google's service worker library) with **Cache-First strategy** for static assets and **Network-Only** for API requests.

### Rationale

- **PWA requirement**: FR-087 mandates offline capability for viewing saved collections
- **Workbox benefits**: Simplifies service worker setup, handles cache versioning, provides battle-tested strategies
- **Cache strategy**:
  - **Static assets** (JS/CSS/fonts): Cache-First (instant load, update in background)
  - **App shell** (Next.js pages): Cache-First with Stale-While-Revalidate
  - **User data** (collections/history): Already in IndexedDB, no service worker caching needed
  - **External APIs**: Network-Only (always fresh, never cached)

**Implementation plan**:
1. Configure Next.js with `next-pwa` plugin (wraps Workbox)
2. Define caching strategies in `next.config.js`
3. Create `public/sw.js` with Workbox configuration
4. Add offline fallback page for graceful degradation

### Alternatives Considered

- **Manual service worker**: Reinventing cache invalidation, update logic error-prone
- **No service worker**: Fails FR-087 offline requirement
- **Full offline sync**: Unnecessary complexity—app is client-side only, no server sync needed

---

## 8. WebSocket Implementation

### Decision

Use **native WebSocket API** with reconnection logic and message history management in Zustand store.

### Rationale

- **Browser native**: WebSocket API universally supported, zero bundle cost
- **Sufficient features**: Bidirectional communication, binary support, close/error events
- **Custom wrapper needs**:
  - Auto-reconnect with exponential backoff
  - Message history storage (last 100 messages)
  - Connection state management (connecting/connected/disconnected/error)
  - Ping/pong heartbeat to detect stale connections

**Implementation approach**:
```typescript
class WebSocketManager {
  connect(url: string, options: WSOptions): void;
  disconnect(): void;
  send(message: string): void;
  onMessage(callback: (msg: WSMessage) => void): void;
  // Auto-reconnect, heartbeat, history tracking built-in
}
```

### Alternatives Considered

- **Socket.IO client**: Adds ~30KB, overkill for simple WebSocket connections, requires Socket.IO server
- **ws library**: Node.js-only, doesn't work in browser
- **No WebSocket support**: Fails FR-066-FR-070 requirements

---

## 9. GraphQL Schema Introspection

### Decision

Use **GraphQL introspection query** with **graphql-js** parser (lightweight, ~20KB gzipped).

### Rationale

- **Standard approach**: GraphQL introspection is built into the GraphQL spec
- **Autocomplete requirement**: FR-072 requires autocomplete based on schema, which needs parsed schema
- **graphql-js benefits**: Official GraphQL foundation library, provides parsing and type system utilities
- **No backend needed**: Introspection query runs directly against user's GraphQL endpoint

**Introspection flow**:
1. User enters GraphQL endpoint URL
2. Send standard introspection query: `{ __schema { types { name fields { name type { name } } } } }`
3. Parse response with graphql-js
4. Extract types, fields, arguments for autocomplete
5. Store schema in Zustand for Monaco Editor IntelliSense

### Alternatives Considered

- **graphql-request**: Larger bundle (~25KB), includes unnecessary request logic (we use Fetch)
- **Manual parsing**: Complex GraphQL type system, error-prone to implement from scratch
- **No GraphQL support**: Fails FR-071-FR-075 requirements

---

## 10. Dark Mode Implementation

### Decision

Use **Tailwind CSS dark mode** with class-based strategy (`.dark` class on `<html>`), managed by `next-themes` library.

### Rationale

- **Constitution requirement**: Principle V mandates dark/light mode with system preference detection
- **Tailwind CSS native**: Tailwind supports `dark:` variant out-of-the-box
- **next-themes benefits**: Handles system preference detection, prevents FOUC (flash of unstyled content), syncs with LocalStorage
- **Class strategy**: More flexible than media query strategy, allows manual theme override

**Implementation**:
```typescript
// app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Alternatives Considered

- **Manual theme toggle**: Requires handling system preference detection, LocalStorage sync, FOUC prevention—next-themes does this
- **CSS variables only**: More verbose than Tailwind's `dark:` variants
- **Media query strategy**: Can't override system preference manually

---

## 11. Bundle Size Optimization

### Decision

Use **Next.js dynamic imports** for heavy components (Monaco Editor, code generators) + **Webpack bundle analyzer** to monitor size.

### Rationale

- **Constitution constraint**: Principle VI mandates <500KB initial bundle
- **Large dependencies**:
  - Monaco Editor: ~1.5MB (lazy load when editor opened)
  - Code generators: ~50KB combined (lazy load when code gen panel opened)
  - Chart libraries (if added for response time graphs): ~100KB (lazy load)
- **Next.js dynamic imports**: 
  ```typescript
  const MonacoEditor = dynamic(() => import('./monaco-editor'), {
    loading: () => <EditorSkeleton />,
    ssr: false
  })
  ```
- **Bundle analyzer**: Run `npm run analyze` to visualize dependencies, identify bloat

**Optimization checklist**:
- ✅ Tree-shake unused Radix UI components
- ✅ Use `lucide-react` individual icon imports (not full package)
- ✅ Lazy load Monaco Editor, code generators, WebSocket panel
- ✅ Use Next.js Image component for optimized images
- ✅ Enable gzip/brotli compression in deployment

### Alternatives Considered

- **No optimization**: Would exceed 500KB constraint with Monaco + dependencies
- **CDN for Monaco**: Adds external dependency, complicates offline support
- **Lighter editor**: CodeMirror saves ~1.2MB but sacrifices developer experience (see Research #3)

---

## Summary of Decisions

| Area                  | Decision                              | Primary Rationale                          |
|-----------------------|---------------------------------------|--------------------------------------------|
| State Management      | Zustand + React Query                 | Constitution mandate, optimal separation   |
| Storage               | Dexie.js (IndexedDB) + LocalStorage   | Capacity (1000+ requests), performance     |
| Code Editor           | Monaco Editor                         | Best-in-class DX, VS Code familiarity      |
| HTTP Client           | Fetch API + custom wrapper            | Native, zero bundle cost                   |
| Test Execution        | `new Function()` + sandboxed pm API   | Security, Postman compatibility            |
| Postman Import        | v2.1 parser/generator                 | 100% compatibility requirement (FR-030)    |
| Offline Support       | Workbox + Cache-First                 | PWA requirement (FR-087)                   |
| WebSocket             | Native WebSocket API + reconnect      | Zero bundle, sufficient features           |
| GraphQL               | Introspection + graphql-js            | Standard approach, autocomplete support    |
| Dark Mode             | Tailwind + next-themes                | System detection, no FOUC, simple API      |
| Bundle Optimization   | Dynamic imports + analyzer            | Stay under 500KB constraint                |

---

## Open Questions (Resolved)

All technical questions have been resolved through research. No "NEEDS CLARIFICATION" items remain from Technical Context.

---

## Next Steps

Proceed to **Phase 1: Design & Contracts**:
1. Generate `data-model.md` (IndexedDB schema for entities)
2. Generate `contracts/storage-api.md` (Dexie.js CRUD operations)
3. Generate `quickstart.md` (setup and verification steps)
4. Update agent context with technology decisions
