# Tasks: REST API Testing Tool

**Input**: Design documents from `/specs/001-api-tester/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/storage-api.md

**Tests**: Not explicitly requested in specification - test tasks omitted per instructions

**Organization**: Tasks are grouped by user story (P1-P8) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a **web application** using Next.js 14+ with App Router:

- Frontend components: `app/`, `components/`, `lib/`, `hooks/`, `stores/`, `types/`
- No backend - all client-side execution per constitution

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create Next.js 14.2+ project with TypeScript 5.3+ using `pnpm create next-app@latest`
- [x] T002 [P] Install core dependencies: Tailwind CSS 3.4+, Zustand, TanStack Query, Dexie.js per plan.md
- [x] T003 [P] Install UI dependencies: Radix UI, Lucide React, Framer Motion, Monaco Editor
- [x] T004 [P] Configure TypeScript strict mode in tsconfig.json
- [x] T005 [P] Configure Tailwind CSS with dark mode support in tailwind.config.ts
- [x] T006 [P] Setup ESLint with strict rules and Prettier in .eslintrc.json
- [x] T007 [P] Configure Vitest for unit testing in vitest.config.ts
- [x] T008 [P] Configure Playwright for E2E testing in playwright.config.ts
- [x] T009 [P] Setup Husky pre-commit hooks for linting and type checking
- [x] T010 Create project directory structure per plan.md: app/, components/ui/, components/features/, lib/, hooks/, stores/, types/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 Define TypeScript types in types/request.ts: HttpMethod, Request, RequestBody, QueryParam, Header, KeyValuePair
- [x] T012 [P] Define TypeScript types in types/collection.ts: Collection, Folder
- [x] T013 [P] Define TypeScript types in types/environment.ts: Environment, Variable, VariableScope
- [x] T014 [P] Define TypeScript types in types/auth.ts: AuthType, AuthConfig, BearerAuth, BasicAuth, ApiKeyAuth, OAuth2Config
- [x] T015 [P] Define TypeScript types in types/history.ts: HistoryEntry, HistoricalRequest, HistoricalResponse
- [x] T016 [P] Define TypeScript types in types/websocket.ts: WebSocketConnection, WSMessage, WebSocketStatus
- [x] T017 [P] Define TypeScript types in types/graphql.ts: GraphQLQuery
- [x] T018 [P] Define TypeScript types in types/test.ts: TestResult, TestStatus
- [x] T019 Create Dexie.js database schema in lib/db/index.ts with all entities from data-model.md
- [x] T020 Implement encryption utilities in lib/storage/crypto.ts for auth credentials using Web Crypto API
- [x] T021 Create storage API for requests in lib/storage/requests.ts per contracts/storage-api.md
- [x] T022 [P] Create storage API for collections in lib/storage/collections.ts per contracts/storage-api.md
- [x] T023 [P] Create storage API for folders in lib/storage/folders.ts per contracts/storage-api.md
- [x] T024 [P] Create storage API for environments in lib/storage/environments.ts per contracts/storage-api.md
- [x] T025 [P] Create storage API for variables in lib/storage/variables.ts per contracts/storage-api.md
- [x] T026 [P] Create storage API for history in lib/storage/history.ts per contracts/storage-api.md
- [x] T027 [P] Create storage API for WebSocket in lib/storage/websockets.ts per contracts/storage-api.md
- [x] T028 [P] Create storage API for GraphQL in lib/storage/graphql.ts per contracts/storage-api.md
- [x] T029 Create Zustand store for UI state in stores/ui-store.ts: sidebar collapsed, active modal, theme
- [x] T030 [P] Create Zustand store for request builder in stores/request-store.ts: current request configuration
- [x] T031 [P] Create Zustand store for settings in stores/settings-store.ts: user preferences from LocalStorage
- [x] T032 Create React Query utilities in lib/http/query-client.ts: client configuration, cache settings
- [x] T033 Create HTTP client wrapper in lib/http/client.ts: Fetch API with interceptors per research.md
- [x] T034 Create variable resolver utility in lib/utils/variables.ts: resolve {{variableName}} syntax per FR-038
- [x] T035 Create URL validator utility in lib/utils/validation.ts: validate HTTP/HTTPS URLs per FR-002
- [x] T036 Create root layout in app/layout.tsx: providers (Zustand, React Query, theme), global styles
- [x] T037 Create Radix UI button component in components/ui/button.tsx with Tailwind variants
- [x] T038 [P] Create Radix UI input component in components/ui/input.tsx
- [x] T039 [P] Create Radix UI select component in components/ui/select.tsx
- [x] T040 [P] Create Radix UI dropdown component in components/ui/dropdown-menu.tsx
- [x] T041 [P] Create Radix UI dialog component in components/ui/dialog.tsx
- [x] T042 [P] Create Radix UI tabs component in components/ui/tabs.tsx
- [x] T043 [P] Create Radix UI tooltip component in components/ui/tooltip.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Send Basic API Request (Priority: P1) 🎯 MVP

**Goal**: Enable developers to construct and send simple HTTP requests and view formatted responses immediately

**Independent Test**: Enter URL https://jsonplaceholder.typicode.com/todos/1, select GET method, click Send, verify formatted JSON response with 200 status and response time displays within 2 seconds

### Implementation for User Story 1

- [x] T044 [P] [US1] Create HTTP method selector component in components/features/request-builder/method-selector.tsx
- [x] T045 [P] [US1] Create URL input component in components/features/request-builder/url-input.tsx with validation per FR-002
- [x] T046 [P] [US1] Create query params editor in components/features/request-builder/query-params.tsx with key-value pairs per FR-003
- [x] T047 [P] [US1] Create headers editor in components/features/request-builder/headers-editor.tsx with key-value pairs per FR-004
- [x] T048 [US1] Create request body editor in components/features/request-builder/body-editor.tsx with type selector (JSON, form data, raw, binary) per FR-006
- [x] T049 [US1] Integrate Monaco Editor for JSON body in components/features/request-builder/json-editor.tsx with syntax highlighting per FR-007
- [x] T050 [US1] Create Send button component in components/features/request-builder/send-button.tsx with keyboard shortcut (Cmd/Ctrl+Enter) per FR-083
- [x] T051 [US1] Implement HTTP request execution hook in hooks/use-request.ts using React Query and HTTP client per FR-008
- [x] T052 [US1] Create response viewer component in components/features/response-viewer/response-viewer.tsx with tabs for Body, Headers, Test Results
- [x] T053 [US1] Create response body renderer in components/features/response-viewer/response-body.tsx with pretty-printed JSON per FR-016
- [x] T054 [P] [US1] Create response metadata display in components/features/response-viewer/response-metadata.tsx: status code (color-coded per FR-024), response time, size per FR-017
- [x] T055 [P] [US1] Create response headers viewer in components/features/response-viewer/response-headers.tsx per FR-023
- [x] T056 [US1] Add copy to clipboard functionality in components/features/response-viewer/copy-button.tsx per FR-020
- [x] T057 [US1] Add download response functionality in components/features/response-viewer/download-button.tsx per FR-021
- [x] T058 [US1] Create main request builder page in app/page.tsx: layout with method selector, URL input, tabs for params/headers/body, Send button, response viewer
- [x] T059 [US1] Add error handling for network errors, timeouts, DNS failures per edge cases
- [ ] T060 [US1] Implement large response handling (>10MB) with virtualization per FR-019 to prevent UI freeze
- [ ] T061 [US1] Add JSON response search functionality in components/features/response-viewer/response-search.tsx per FR-022

**Checkpoint**: At this point, User Story 1 should be fully functional - can send GET/POST requests and view responses independently

---

## Phase 4: User Story 2 - Manage Request Collections (Priority: P2)

**Goal**: Enable organization and reusability of requests through collections with folders and search

**Independent Test**: Create collection "Test APIs", add 5 requests, organize in 2 folders, export to JSON, delete collection, re-import JSON successfully with 100% structure preservation

### Implementation for User Story 2

- [x] T062 [P] [US2] Create collections sidebar in components/features/collection-sidebar/collections-sidebar.tsx with tree view per FR-025
- [x] T063 [P] [US2] Create collection tree node component in components/features/collection-sidebar/collection-node.tsx with expand/collapse
- [x] T064 [P] [US2] Create folder tree node component in components/features/collection-sidebar/folder-node.tsx
- [x] T065 [P] [US2] Create request tree node component in components/features/collection-sidebar/request-node.tsx
- [x] T066 [US2] Create "New Collection" dialog in components/features/collection-sidebar/new-collection-dialog.tsx per FR-025
- [x] T067 [US2] Create "Save to Collection" dialog in components/features/request-builder/save-to-collection-dialog.tsx per FR-026
- [x] T068 [US2] Create "New Folder" dialog in components/features/collection-sidebar/new-folder-dialog.tsx per FR-027
- [x] T069 [US2] Implement collections management hook in hooks/use-collections.ts: create, rename, delete, duplicate per FR-025, FR-028
- [x] T070 [US2] Implement folder management with 3-level nesting validation in hooks/use-folders.ts per FR-027
- [ ] T071 [US2] Create collection search component in components/features/collection-sidebar/collection-search.tsx with <200ms filter per FR-029, FR-034
- [x] T072 [US2] Implement Postman v2.1 import parser in lib/importers/postman-importer.ts with 100% compatibility per FR-030
- [x] T073 [US2] Implement Postman v2.1 export generator in lib/exporters/postman-exporter.ts per FR-031
- [x] T074 [US2] Create import dialog in components/features/import/import-dialog.tsx: file upload, format selection (Postman, OpenAPI, cURL)
- [x] T075 [US2] Create export dialog in components/features/export/export-dialog.tsx: format selection, download per FR-035
- [ ] T076 [US2] Implement OpenAPI 3.0 import parser in lib/importers/openapi-importer.ts per FR-032
- [ ] T077 [US2] Implement cURL command import parser in lib/importers/curl-importer.ts per FR-033
- [ ] T078 [US2] Add drag-and-drop for request reordering in collections sidebar
- [ ] T079 [US2] Implement collection context menu: rename, duplicate, export, delete with confirmation
- [ ] T080 [US2] Add request context menu: edit, duplicate, move to folder, delete
- [ ] T081 [US2] Handle edge case: malformed collection file import with validation errors

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - can send requests AND organize them in collections

---

## Phase 5: User Story 3 - Use Environment Variables (Priority: P3)

**Goal**: Enable switching between environments (Dev, Staging, Production) with dynamic variable resolution

**Independent Test**: Create "Dev" environment with baseUrl=https://dev.api.com, create "Production" with baseUrl=https://api.com, add request with {{baseUrl}}/users URL, switch environments and verify URL resolves correctly in real-time

### Implementation for User Story 3

- [ ] T082 [P] [US3] Create environment selector dropdown in components/features/environment-selector/environment-selector.tsx in app header per FR-044
- [ ] T083 [P] [US3] Create environment management dialog in components/features/environment-selector/manage-environments-dialog.tsx per FR-036
- [ ] T084 [US3] Create environment editor in components/features/environment-selector/environment-editor.tsx: add/edit/delete variables per FR-037
- [ ] T085 [US3] Implement variable scope indicator in components/features/environment-selector/variable-scope-badge.tsx: Global, Environment, Collection per FR-041
- [ ] T086 [US3] Implement environments hook in hooks/use-environments.ts: create, switch, delete with <100ms response per FR-043
- [ ] T087 [US3] Implement variables hook in hooks/use-variables.ts: CRUD operations, precedence resolution per FR-042
- [ ] T088 [US3] Add real-time variable resolution in URL input: highlight {{variableName}} syntax, show resolved value tooltip per FR-039
- [ ] T089 [US3] Add variable syntax highlighting in Monaco Editor for request body per FR-038
- [ ] T090 [US3] Implement unresolved variable warnings in components/features/request-builder/variable-warning.tsx per FR-040
- [ ] T091 [US3] Add variable autocomplete in URL input when typing {{ per FR-039
- [ ] T092 [US3] Add quick variable picker in headers and query params for inserting {{variableName}}
- [ ] T093 [US3] Implement variable precedence resolution in lib/utils/variables.ts: Collection > Environment > Global per FR-042
- [ ] T094 [US3] Add environment quick switcher keyboard shortcut (Cmd/Ctrl+E)
- [ ] T095 [US3] Handle edge case: undefined variable resolution in requests with clear error messaging

**Checkpoint**: All three user stories (Request, Collections, Environments) should now work independently and together

---

## Phase 6: User Story 4 - Add Authentication (Priority: P4)

**Goal**: Simplify authentication for protected endpoints with Bearer, Basic, API Key, OAuth 2.0

**Independent Test**: Configure Bearer token "test-token-123", send request to protected endpoint, verify Authorization header "Bearer test-token-123" is automatically included without manual header entry

### Implementation for User Story 4

- [ ] T096 [P] [US4] Create Auth tab component in components/features/request-builder/auth-tab.tsx with auth type selector per FR-010-FR-013
- [ ] T097 [P] [US4] Create Bearer token auth form in components/features/request-builder/auth/bearer-auth.tsx per FR-010
- [ ] T098 [P] [US4] Create Basic auth form in components/features/request-builder/auth/basic-auth.tsx: username, password per FR-011
- [ ] T099 [P] [US4] Create API Key auth form in components/features/request-builder/auth/api-key-auth.tsx: key name, value, location (header/query) per FR-012
- [ ] T100 [US4] Create OAuth 2.0 auth form in components/features/request-builder/auth/oauth2-auth.tsx: client ID, secret, token URL, authorization URL per FR-013
- [ ] T101 [US4] Implement OAuth 2.0 flow handler in lib/auth/oauth2-flow.ts: redirect to provider, handle callback, store token
- [ ] T102 [US4] Add auth header injection in HTTP client interceptor in lib/http/client.ts before request sent
- [ ] T103 [US4] Implement auth credentials encryption before storage per FR-014 using crypto.ts
- [ ] T104 [US4] Implement auth credentials auto-populate on request load per FR-015
- [ ] T105 [US4] Add "Get Token" button for OAuth 2.0 flow in auth form
- [ ] T106 [US4] Add auth presets dropdown: common auth patterns (GitHub API, Stripe, etc.)
- [ ] T107 [US4] Handle edge case: OAuth 2.0 token expiration with refresh flow
- [ ] T108 [US4] Add auth inheritance from collection level to request level

**Checkpoint**: All four user stories should work independently - authentication simplifies protected endpoint testing

---

## Phase 7: User Story 5 - Write Automated Tests (Priority: P5)

**Goal**: Enable automated validation of API responses with Chai-like test syntax

**Independent Test**: Write test script "pm.test('Status is 200', () => pm.response.to.have.status(200))", send request returning 200, verify test shows green checkmark with "PASS" status

### Implementation for User Story 5

- [ ] T109 [P] [US5] Create Tests tab component in components/features/request-builder/tests-tab.tsx with Monaco Editor per FR-045
- [ ] T110 [P] [US5] Create Pre-request Script tab in components/features/request-builder/pre-request-tab.tsx per FR-052
- [ ] T111 [US5] Implement test execution engine in lib/test-runner/executor.ts: sandboxed JavaScript execution using new Function() per research.md
- [ ] T112 [US5] Implement pm API mock in lib/test-runner/pm-api.ts: pm.test, pm.expect, pm.response, pm.environment per FR-045
- [ ] T113 [US5] Add Chai-like assertion library integration: to.have.status, to.have.header, to.have.jsonBody per FR-048
- [ ] T114 [US5] Create test results panel in components/features/response-viewer/test-results-panel.tsx with pass/fail indicators per FR-049
- [ ] T115 [US5] Implement test execution within 100ms after response received per FR-047
- [ ] T116 [US5] Add test syntax error detection and helpful error messages in Monaco Editor per FR-050
- [ ] T117 [US5] Add test assertions for response time validation per FR-048
- [ ] T118 [US5] Add test assertions for JSON schema validation per FR-048
- [ ] T119 [US5] Add test assertions for regex body matching per FR-048
- [ ] T120 [US5] Persist test results in history entries per FR-051
- [ ] T121 [US5] Implement pre-request script execution for dynamic value generation (timestamps, random IDs) per FR-052
- [ ] T122 [US5] Add test script snippets dropdown: common test patterns (status code, response time, JSON structure)
- [ ] T123 [US5] Add test summary display: "3/5 tests passed" per user story acceptance
- [ ] T124 [US5] Handle edge case: infinite loops or long-running test scripts with timeout (5s max)

**Checkpoint**: Five user stories complete - basic requests + collections + environments + auth + automated tests all functional

---

## Phase 8: User Story 6 - Review Request History (Priority: P6)

**Goal**: Provide complete history of sent requests for debugging and comparison

**Independent Test**: Send 10 different requests, filter history by POST method only, select past request from yesterday, verify all original details (URL, headers, body, response) are restored exactly

### Implementation for User Story 6

- [ ] T125 [P] [US6] Create History page in app/history/page.tsx with table/list view per FR-053
- [ ] T126 [P] [US6] Create history entry row component in components/features/history/history-entry-row.tsx: method, URL, status, timestamp, response time per FR-053
- [ ] T127 [US6] Implement history hook in hooks/use-history.ts: fetch, filter, search with <200ms response per FR-056
- [ ] T128 [US6] Create history filters component in components/features/history/history-filters.tsx: method, status code range, date range, URL pattern per FR-055
- [ ] T129 [US6] Implement history search with URL pattern matching and instant results per FR-056
- [ ] T130 [US6] Add "Load into Builder" action for history entries to restore full request context per FR-057
- [ ] T131 [US6] Create history detail view in components/features/history/history-detail.tsx: full request/response with all fields
- [ ] T132 [US6] Implement history auto-save on every request sent with full context per FR-053
- [ ] T133 [US6] Add LRU eviction for 1000+ history entries per data-model.md
- [ ] T134 [US6] Create "Clear History" dialog with confirmation prompt per FR-058
- [ ] T135 [US6] Implement history export to JSON per FR-059
- [ ] T136 [US6] Add history entry comparison view: side-by-side diff of two requests
- [ ] T137 [US6] Optimize history queries for 1000+ entries without performance degradation per FR-054
- [ ] T138 [US6] Add history entry context menu: load, compare, delete
- [ ] T139 [US6] Handle edge case: restore request from history when collection/environment deleted

**Checkpoint**: Six user stories complete - full history tracking enables debugging workflows

---

## Phase 9: User Story 7 - Generate Client Code (Priority: P7)

**Goal**: Generate ready-to-use code snippets in multiple programming languages from configured requests

**Independent Test**: Configure POST request with Bearer token, JSON body, and headers; generate JavaScript (fetch) code; copy to Node.js script; execute successfully with identical results

### Implementation for User Story 7

- [ ] T140 [P] [US7] Create Code Generation panel in components/features/code-generator/code-generator-panel.tsx with language selector per FR-060
- [ ] T141 [P] [US7] Implement JavaScript (fetch) code generator in lib/generators/javascript-fetch-generator.ts per FR-060
- [ ] T142 [P] [US7] Implement JavaScript (axios) code generator in lib/generators/javascript-axios-generator.ts per FR-060
- [ ] T143 [P] [US7] Implement TypeScript code generator in lib/generators/typescript-generator.ts per FR-060
- [ ] T144 [P] [US7] Implement Python (requests) code generator in lib/generators/python-generator.ts per FR-060
- [ ] T145 [P] [US7] Implement cURL code generator in lib/generators/curl-generator.ts per FR-060
- [ ] T146 [P] [US7] Implement Node.js (http) code generator in lib/generators/nodejs-http-generator.ts per FR-060
- [ ] T147 [P] [US7] Implement Node.js (axios) code generator in lib/generators/nodejs-axios-generator.ts per FR-060
- [ ] T148 [P] [US7] Implement PHP code generator in lib/generators/php-generator.ts per FR-060
- [ ] T149 [US7] Add syntax highlighting for generated code using Monaco Editor or Prism.js per FR-062
- [ ] T150 [US7] Add copy-to-clipboard for generated code per FR-063
- [ ] T151 [US7] Include all headers, auth, query params, body in generated code per FR-061
- [ ] T152 [US7] Handle environment variables in generated code: resolve to current values or mark as TODO per FR-063
- [ ] T153 [US7] Follow language-specific best practices per FR-064: Python uses requests, Node.js uses axios/fetch correctly
- [ ] T154 [US7] Add code generator settings: include comments, error handling, async/await vs promises
- [ ] T155 [US7] Add language-specific snippets: add to package.json dependencies, import statements
- [ ] T156 [US7] Handle edge case: binary/file upload in generated code with multipart encoding

**Checkpoint**: Seven user stories complete - code generation accelerates API integration development

---

## Phase 10: User Story 8 - Test WebSocket & GraphQL (Priority: P8)

**Goal**: Expand tool to support WebSocket connections and GraphQL queries alongside REST APIs

**Independent Test**:

- **WebSocket**: Connect to wss://echo.websocket.org, send "Hello", verify message appears in sent list and response received within 50ms with timestamp
- **GraphQL**: Load schema from GraphQL endpoint, write query with autocomplete, execute successfully with formatted JSON response

### Implementation for User Story 8

#### WebSocket Implementation

- [ ] T157 [P] [US8] Create WebSocket tab in main app for WebSocket testing per FR-066
- [ ] T158 [P] [US8] Create WebSocket connection panel in components/features/websocket/ws-connection-panel.tsx: URL input, Connect/Disconnect buttons per FR-066
- [ ] T159 [P] [US8] Create WebSocket message sender in components/features/websocket/ws-message-sender.tsx per FR-067
- [ ] T160 [P] [US8] Create WebSocket message list in components/features/websocket/ws-message-list.tsx with timestamps per FR-068
- [ ] T161 [US8] Implement WebSocket connection manager in lib/websocket/ws-manager.ts: connect, disconnect, send, receive per research.md
- [ ] T162 [US8] Add WebSocket connection status indicator: Connected, Disconnected, Error per FR-066
- [ ] T163 [US8] Implement WebSocket message display within 50ms of receipt per FR-069
- [ ] T164 [US8] Add WebSocket auto-reconnect option with configurable retry logic per FR-070
- [ ] T165 [US8] Store WebSocket connections in IndexedDB per data-model.md
- [ ] T166 [US8] Store WebSocket messages history per data-model.md
- [ ] T167 [US8] Add WebSocket message filtering: sent vs received
- [ ] T168 [US8] Handle edge case: WebSocket connection drop during active communication with reconnect

#### GraphQL Implementation

- [ ] T169 [P] [US8] Create GraphQL tab in main app for GraphQL testing per FR-071
- [ ] T170 [P] [US8] Create GraphQL query editor in components/features/graphql/graphql-query-editor.tsx using Monaco Editor per FR-072
- [ ] T171 [P] [US8] Create GraphQL variables editor in components/features/graphql/graphql-variables-editor.tsx per FR-073
- [ ] T172 [US8] Implement GraphQL schema introspection in lib/graphql/schema-introspection.ts per FR-071
- [ ] T173 [US8] Add GraphQL autocomplete in Monaco Editor based on loaded schema per FR-072
- [ ] T174 [US8] Implement GraphQL query execution using fetch with POST method
- [ ] T175 [US8] Create GraphQL response viewer with same features as REST response viewer per FR-074
- [ ] T176 [US8] Store GraphQL queries in IndexedDB per data-model.md
- [ ] T177 [US8] Create GraphQL query history panel per FR-074
- [ ] T178 [US8] Implement GraphQL subscriptions support per FR-075
- [ ] T179 [US8] Add GraphQL query validation against loaded schema
- [ ] T180 [US8] Add "Load Schema" button to trigger introspection per user story acceptance
- [ ] T181 [US8] Handle edge case: GraphQL schema introspection failure with fallback to manual schema input

**Checkpoint**: All eight user stories complete - full-featured API testing tool supporting REST, WebSocket, and GraphQL

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and overall quality

- [ ] T182 [P] Add keyboard shortcuts for all major actions per FR-083: Cmd/Ctrl+Enter (send), Cmd/Ctrl+S (save), Cmd/Ctrl+K (focus URL), Cmd/Ctrl+B (toggle sidebar), Cmd/Ctrl+/ (dark mode)
- [ ] T183 [P] Implement dark/light theme toggle in app header using Tailwind dark mode and next-themes per research.md
- [ ] T184 [P] Add tooltips for all major features using Radix UI Tooltip per FR-082
- [ ] T185 [P] Create onboarding tutorial dialog for first-time users per FR-081
- [ ] T186 [P] Implement undo/redo for request editing per FR-084
- [ ] T187 [P] Add responsive design for tablets and mobile (360px+) per FR-085
- [ ] T188 Setup PWA manifest.json with app name, icons, theme colors per FR-087
- [ ] T189 Implement service worker with Workbox for offline mode per FR-087 and research.md
- [ ] T190 Configure service worker Cache-First strategy for static assets per research.md
- [ ] T191 Add auto-save every 30 seconds for current request per FR-077
- [ ] T192 Implement workspace export to backup file per FR-078
- [ ] T193 Implement workspace import from backup file per FR-079
- [ ] T194 [P] Add loading states and skeletons for all async operations
- [ ] T195 [P] Add error boundaries for graceful error handling
- [ ] T196 [P] Implement request cancellation for long-running requests
- [ ] T197 Optimize bundle size with dynamic imports for Monaco Editor, code generators per research.md
- [ ] T198 Add bundle size monitoring to ensure <500KB initial load per constraints
- [ ] T199 Run Lighthouse audit and optimize to achieve >90 score per FR-090
- [ ] T200 Add WCAG 2.1 AA accessibility audit and fixes per constitution
- [ ] T201 [P] Add common header presets dropdown in headers editor per FR-005
- [ ] T202 [P] Add collapsible sections for JSON responses with 1000+ properties per FR-018
- [ ] T203 [P] Optimize rendering for large responses (>10MB) with virtualization per FR-019
- [ ] T204 Test 50 concurrent requests without UI degradation per FR-088
- [ ] T205 Test collections with 1000+ requests for performance per FR-089
- [ ] T206 Cross-browser testing: Chrome, Firefox, Safari, Edge (latest 2 versions) per FR-090
- [ ] T207 Add request/response size tracking and display
- [ ] T208 Implement request queue management for batch sending
- [ ] T209 Add request duplication keyboard shortcut (Cmd/Ctrl+D)
- [ ] T210 Create empty states for collections, history, environments
- [ ] T211 Add confirmation dialogs for destructive actions (delete collection, clear history)
- [ ] T212 Implement focus management and keyboard navigation throughout app
- [ ] T213 Add status bar with connection status, active environment, request count
- [ ] T214 Create settings page in app/settings/page.tsx for app configuration
- [ ] T215 Run quickstart.md validation: verify all setup steps work correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational (Phase 2) completion
  - User stories CAN proceed in parallel if multiple developers available
  - OR sequentially in priority order: US1 (P1) → US2 (P2) → US3 (P3) → ... → US8 (P8)
- **Polish (Phase 11)**: Depends on desired user stories being complete (minimally US1-US4 for MVP)

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational - NO dependencies on other stories ✅ MVP
- **US2 (P2)**: Can start after Foundational - Integrates with US1 but independently testable
- **US3 (P3)**: Can start after Foundational - Integrates with US1/US2 but independently testable
- **US4 (P4)**: Can start after Foundational - Integrates with US1 but independently testable
- **US5 (P5)**: Can start after Foundational - Integrates with US1 but independently testable
- **US6 (P6)**: Can start after Foundational - Integrates with US1 but independently testable
- **US7 (P7)**: Can start after Foundational - Integrates with US1/US4 but independently testable
- **US8 (P8)**: Can start after Foundational - Independent of other stories (WebSocket and GraphQL separate from REST)

### Within Each User Story

- Tasks marked [P] within same story can run in parallel (different files)
- Monaco Editor integration tasks depend on basic component structure first
- Storage operations depend on storage API creation in Foundational phase
- UI components can be built in parallel, then integrated

### Parallel Opportunities

- **Setup (Phase 1)**: Tasks T002-T009 all [P] - install dependencies, configure tools
- **Foundational (Phase 2)**: Tasks T012-T018 (type definitions) all [P], T022-T028 (storage APIs) all [P], T037-T043 (UI components) all [P]
- **Each User Story**: Many component creation tasks marked [P] can run simultaneously
- **Polish (Phase 11)**: Tasks T182-T206 mostly [P] - can parallelize quality improvements

---

## Parallel Example: User Story 1

```bash
# Launch all parallel component tasks for User Story 1 together:
T044 [P] [US1] Method selector component
T045 [P] [US1] URL input component
T046 [P] [US1] Query params editor
T047 [P] [US1] Headers editor
T054 [P] [US1] Response metadata display
T055 [P] [US1] Response headers viewer

# Then after components ready, integrate sequentially:
T048 [US1] Request body editor (needs components above)
T051 [US1] HTTP request execution hook
T058 [US1] Main page integration
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

**Minimal Viable Product - 4-6 weeks**

1. Complete Phase 1: Setup (~3 days)
2. Complete Phase 2: Foundational (~2 weeks - CRITICAL foundation)
3. Complete Phase 3: User Story 1 (~1.5 weeks)
4. Complete essential Polish tasks: T182-T187, T197-T199 (~1 week)
5. **STOP and VALIDATE**: Test US1 independently - can send requests and view responses
6. Deploy MVP for user feedback

**Total MVP Tasks**: T001-T061 + T182-T187 + T197-T199 = ~80 tasks

### Incremental Delivery (MVP + Priority Features)

**MVP + Collections + Environments - 8-10 weeks**

1. Complete MVP (US1) as above
2. Add Phase 4: User Story 2 - Collections (~2 weeks)
3. Add Phase 5: User Story 3 - Environments (~1 week)
4. Deploy v1.0 with core workflow

**Total Tasks**: MVP + US2 + US3 = ~110 tasks

### Full Feature Set

**All 8 User Stories - 16-20 weeks**

1. Complete MVP + US2 + US3 (above)
2. Add Phase 6: User Story 4 - Authentication (~1 week)
3. Add Phase 7: User Story 5 - Automated Tests (~1.5 weeks)
4. Add Phase 8: User Story 6 - History (~1 week)
5. Add Phase 9: User Story 7 - Code Generation (~1 week)
6. Add Phase 10: User Story 8 - WebSocket & GraphQL (~2 weeks)
7. Complete Phase 11: Polish (~1 week)
8. Deploy v2.0 with full feature parity to Postman

**Total Tasks**: All 215 tasks

### Parallel Team Strategy

With 3-4 developers after Foundational phase:

1. **Week 1-2**: Everyone on Setup + Foundational together
2. **Week 3-4**: Split by user story (Foundation complete enables parallel work)
   - Developer A: US1 (Request Builder) - MVP blocker
   - Developer B: US2 (Collections)
   - Developer C: US3 (Environments)
   - Developer D: US4 (Authentication)
3. **Week 5-6**: Continue parallel development
   - Developer A: US5 (Tests) after US1 complete
   - Developer B: US6 (History) after US2 complete
   - Developer C: US7 (Code Gen) after US3 complete
   - Developer D: US8 (WebSocket/GraphQL) after US4 complete
4. **Week 7**: Everyone on Polish together
5. Stories integrate smoothly because Foundation provides common infrastructure

---

## Task Count Summary

- **Phase 1 (Setup)**: 10 tasks
- **Phase 2 (Foundational)**: 33 tasks ⚠️ CRITICAL
- **Phase 3 (US1)**: 18 tasks 🎯 MVP
- **Phase 4 (US2)**: 20 tasks
- **Phase 5 (US3)**: 14 tasks
- **Phase 6 (US4)**: 13 tasks
- **Phase 7 (US5)**: 16 tasks
- **Phase 8 (US6)**: 15 tasks
- **Phase 9 (US7)**: 17 tasks
- **Phase 10 (US8)**: 25 tasks (WebSocket: 12, GraphQL: 13)
- **Phase 11 (Polish)**: 34 tasks

**Total Tasks**: 215

**Parallel Tasks**: 85 tasks marked [P] can run in parallel within their phase/story

**MVP Scope**: 80 tasks (Phases 1-3 + essential Polish)

**Suggested First Milestone**: Complete US1 (MVP) = Phases 1, 2, 3 = 61 tasks

---

## Notes

- Tasks marked [P] can run in parallel - different files, no dependencies within phase
- All [Story] labels map to user stories from spec.md for traceability
- Each user story is independently completable and testable - follows spec.md acceptance criteria
- Foundational phase (Phase 2) is CRITICAL - no user story work possible until complete
- Stop at any checkpoint to validate story independently before proceeding
- Monaco Editor lazy-loaded (~1.5MB) to meet <500KB initial bundle constraint
- IndexedDB operations are async - all storage APIs return Promises
- Encryption for auth credentials mandatory per constitution Principle IV
- All timestamps use Unix epoch (milliseconds) for consistency
- Follow atomic design: atoms (components/ui/) → organisms (components/features/)
