# Quickstart Guide - Restify API Tester

**Version:** 1.0.0  
**Last Updated:** 2025-01-12  
**Estimated Setup Time:** 10 minutes

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** 18.x or later ([Download](https://nodejs.org/))
- **pnpm** 8.x or later (recommended) or npm 9.x+
- **Git** (for version control)
- **VS Code** (recommended editor) with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

### Install pnpm (if needed)

```bash
npm install -g pnpm
```

Verify installation:
```bash
node --version  # Should be v18.x or higher
pnpm --version  # Should be v8.x or higher
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/restify.git
cd restify
```

### 2. Install Dependencies

Using pnpm (recommended):
```bash
pnpm install
```

Or using npm:
```bash
npm install
```

This will install all dependencies defined in `package.json`, including:
- Next.js 14.2+
- React 18
- TypeScript 5.3+
- Tailwind CSS 3.4+
- Zustand (state management)
- TanStack Query (React Query)
- Dexie.js (IndexedDB wrapper)
- Monaco Editor
- Radix UI components

**Expected duration:** 2-3 minutes

---

## Development

### 3. Start Development Server

```bash
pnpm dev
```

Or with npm:
```bash
npm run dev
```

This starts the Next.js development server with:
- Hot Module Replacement (HMR)
- Fast Refresh for React components
- TypeScript type checking
- Tailwind CSS JIT compilation

**Server URL:** http://localhost:3000

You should see output like:
```
▲ Next.js 14.2.3
- Local:        http://localhost:3000
- Ready in 1.8s
```

### 4. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

You should see the Restify home screen with:
- Empty state prompting to create a collection or send a request
- Sidebar with Collections panel
- Main request builder area
- Dark/light mode toggle in header

---

## Project Structure Walkthrough

```
restify/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home page (request builder)
│   ├── collections/              # Collections management
│   │   └── [id]/page.tsx         # Collection detail view
│   ├── history/                  # Request history
│   │   └── page.tsx
│   └── settings/                 # App settings
│       └── page.tsx
│
├── components/                   # React components (Atomic Design)
│   ├── ui/                       # Atoms (Radix UI wrappers)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── features/                 # Organisms (feature components)
│   │   ├── request-builder/     # HTTP request configuration
│   │   ├── response-viewer/     # Response display
│   │   ├── collection-sidebar/  # Collections tree
│   │   └── environment-selector/
│   └── layouts/                  # Layout components
│
├── lib/                          # Core utilities
│   ├── db/                       # Dexie.js database
│   │   ├── schema.ts             # IndexedDB schema definition
│   │   └── migrations.ts         # Schema version migrations
│   ├── storage/                  # Storage API modules
│   │   ├── requests.ts           # Request CRUD operations
│   │   ├── collections.ts        # Collection management
│   │   ├── environments.ts       # Environment management
│   │   ├── variables.ts          # Variable storage & resolution
│   │   ├── history.ts            # History tracking
│   │   ├── websockets.ts         # WebSocket state
│   │   └── graphql.ts            # GraphQL query storage
│   ├── http/                     # HTTP client
│   │   ├── client.ts             # Fetch API wrapper
│   │   └── interceptors.ts       # Request/response interceptors
│   ├── test-runner/              # Test execution engine
│   │   ├── executor.ts           # Sandboxed test runner
│   │   └── pm-api.ts             # Postman-like API (pm.test, pm.expect)
│   └── utils/                    # Shared utilities
│
├── hooks/                        # React custom hooks
│   ├── use-request.ts            # Request execution logic
│   ├── use-collections.ts        # Collection state
│   ├── use-environments.ts       # Environment management
│   └── use-history.ts            # History queries
│
├── stores/                       # Zustand state stores
│   ├── ui-store.ts               # UI state (sidebar, modals)
│   ├── request-store.ts          # Current request builder state
│   └── settings-store.ts         # User preferences
│
├── types/                        # TypeScript type definitions
│   ├── request.ts                # Request/Response types
│   ├── collection.ts             # Collection/Folder types
│   ├── environment.ts            # Environment/Variable types
│   └── index.ts                  # Exports
│
├── public/                       # Static assets
│   ├── icons/                    # HTTP method icons
│   └── manifest.json             # PWA manifest
│
├── specs/                        # Feature specifications
│   └── 001-api-tester/           # This feature
│       ├── spec.md               # Requirements (WHAT)
│       ├── plan.md               # Implementation plan (HOW)
│       ├── research.md           # Technical decisions
│       ├── data-model.md         # Database schema
│       ├── contracts/            # API contracts
│       └── quickstart.md         # This guide
│
├── .specify/                     # Spec-driven dev tools
│   ├── memory/
│   │   └── constitution.md       # Project principles
│   └── scripts/                  # Workflow automation
│
├── tests/                        # Test suites
│   ├── unit/                     # Vitest unit tests
│   ├── integration/              # Component integration tests
│   └── e2e/                      # Playwright E2E tests
│
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config (strict mode)
├── tailwind.config.ts            # Tailwind customization
├── next.config.js                # Next.js configuration
└── vitest.config.ts              # Test configuration
```

---

## Making Your First Request

### Step 1: Create a Collection (Optional)

1. Click **"New Collection"** in the sidebar
2. Name it "Test APIs"
3. Click **"Create"**

### Step 2: Configure Request

1. In the request builder:
   - Select HTTP method: **GET**
   - Enter URL: `https://jsonplaceholder.typicode.com/todos/1`
   - Leave headers/body empty for now

2. Click **"Send"** button (or press `Cmd/Ctrl + Enter`)

### Step 3: View Response

You should see:
- **Status:** 200 OK
- **Time:** ~300ms
- **Size:** ~82 bytes
- **Body:** JSON response with todo item

```json
{
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
```

### Step 4: Save to Collection

1. Click **"Save"** button
2. Choose collection: "Test APIs"
3. Name request: "Get Todo"
4. Click **"Save"**

Request now appears in sidebar under "Test APIs" collection.

### Step 5: Check History

1. Navigate to **History** page (sidebar or top nav)
2. See your sent request logged with full details
3. Click entry to re-send or load into builder

---

## Key Features to Try

### 1. Request Authentication

**Bearer Token:**
1. Open **Auth** tab in request builder
2. Select **Bearer Token**
3. Enter token: `your-api-token`
4. Send request - `Authorization: Bearer your-api-token` header added automatically

**Basic Auth:**
1. Select **Basic Auth**
2. Enter username/password
3. Credentials encrypted in IndexedDB storage

### 2. Environment Variables

**Create Environment:**
1. Click **Environment** dropdown (top right)
2. Select **"Manage Environments"**
3. Click **"New Environment"**
4. Name: "Development"
5. Add variable:
   - Key: `base_url`
   - Value: `https://api.dev.example.com`
6. Click **"Save"**

**Use Variable in Request:**
1. Set URL: `{{base_url}}/users`
2. Select "Development" environment
3. Variable resolves to actual URL before sending

### 3. Pre-Request Scripts

**Add Script:**
1. Open **Pre-request Script** tab
2. Enter JavaScript:
```javascript
const timestamp = Date.now();
pm.environment.set('timestamp', timestamp);
```
3. Use `{{timestamp}}` in headers or body
4. Script executes before request sent

### 4. Tests

**Add Test:**
1. Open **Tests** tab
2. Enter assertions:
```javascript
pm.test("Status is 200", () => {
  pm.response.to.have.status(200);
});

pm.test("Response has userId", () => {
  const json = pm.response.json();
  pm.expect(json).to.have.property('userId');
});
```
3. Send request
4. View test results in **Test Results** panel

### 5. Import Postman Collection

1. Click **Import** button (top nav)
2. Select **Postman Collection v2.1** JSON file
3. Choose destination collection or create new
4. Click **Import**
5. All requests/folders/variables imported

---

## Running Tests

### Unit Tests (Vitest)

Run all unit tests:
```bash
pnpm test
```

Run in watch mode:
```bash
pnpm test:watch
```

Run with coverage:
```bash
pnpm test:coverage
```

**Coverage target:** 80%+ (enforced by CI)

### E2E Tests (Playwright)

Install Playwright browsers (first time only):
```bash
pnpm playwright install
```

Run E2E tests:
```bash
pnpm test:e2e
```

Run in UI mode (interactive):
```bash
pnpm playwright test --ui
```

**Test scenarios:**
- Create collection → Add request → Send → Verify response
- Import Postman collection → Verify structure
- Set environment variables → Verify resolution
- Execute tests → Verify pass/fail

---

## Building for Production

### Create Production Build

```bash
pnpm build
```

This:
1. Runs TypeScript type checking
2. Compiles Next.js app
3. Optimizes assets (images, CSS, JS)
4. Generates static HTML where possible
5. Creates service worker for PWA

**Output:** `.next/` directory with optimized build

**Build targets:**
- ✅ Bundle size < 500KB (monitored)
- ✅ Lighthouse score > 90
- ✅ Zero TypeScript errors
- ✅ All tests passing

### Preview Production Build

```bash
pnpm start
```

Opens production server at http://localhost:3000

### Analyze Bundle Size

```bash
pnpm analyze
```

Opens interactive bundle analyzer showing:
- Module sizes
- Duplicate dependencies
- Lazy-loaded chunks

---

## Troubleshooting

### Port 3000 Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
pnpm dev -- -p 3001
```

### IndexedDB Quota Exceeded

**Error:** `QuotaExceededError: The quota has been exceeded`

**Solution:**
1. Open browser DevTools → Application → Storage
2. Clear IndexedDB for localhost:3000
3. Or use **Settings → Clear Data** in app

### TypeScript Errors

**Error:** `Type '...' is not assignable to type '...'`

**Solution:**
```bash
# Check types without building
pnpm tsc --noEmit

# Fix auto-fixable issues
pnpm lint:fix
```

### Hot Reload Not Working

**Solution:**
1. Restart dev server
2. Clear `.next/` folder:
```bash
rm -rf .next
pnpm dev
```

---

## Performance Monitoring

### Check Lighthouse Score

1. Open http://localhost:3000 in Chrome
2. Open DevTools → Lighthouse tab
3. Run audit with:
   - Mode: Navigation
   - Device: Desktop
   - Categories: Performance, Accessibility, Best Practices

**Target scores:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90

### Monitor Bundle Size

```bash
# Check production bundle stats
pnpm build
# Output shows:
# - Route sizes
# - First Load JS shared
# - Lazy-loaded chunks
```

**Size limits:**
- Initial load: < 500KB
- Per-route chunk: < 200KB
- Monaco Editor (lazy): ~1.5MB

---

## Development Workflow

### Feature Branch Workflow

1. Create feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make changes and commit:
```bash
git add .
git commit -m "feat: add feature description"
```

3. Push and create PR:
```bash
git push origin feature/your-feature-name
```

4. Ensure CI checks pass:
   - ✅ TypeScript type check
   - ✅ ESLint validation
   - ✅ Unit tests (80% coverage)
   - ✅ E2E tests
   - ✅ Build succeeds
   - ✅ Bundle size < 500KB

### Semantic Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add GraphQL query builder` - New feature
- `fix: resolve history pagination bug` - Bug fix
- `docs: update quickstart guide` - Documentation
- `style: format code with prettier` - Code style
- `refactor: extract auth logic to hook` - Refactoring
- `test: add tests for variable resolution` - Tests
- `chore: update dependencies` - Maintenance

---

## Editor Setup (VS Code)

### Recommended Extensions

Install via Extensions panel (Cmd/Ctrl+Shift+X):

1. **ESLint** (`dbaeumer.vscode-eslint`)
   - Auto-fix on save
   
2. **Prettier** (`esbenp.prettier-vscode`)
   - Code formatting

3. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
   - Class autocomplete

4. **TypeScript Importer** (`pmneo.tsimporter`)
   - Auto-import suggestions

### Workspace Settings

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

## Next Steps

### 1. Explore Documentation

- **Feature Spec:** `specs/001-api-tester/spec.md` - What we're building
- **Implementation Plan:** `specs/001-api-tester/plan.md` - How we're building it
- **Data Model:** `specs/001-api-tester/data-model.md` - Database schema
- **API Contracts:** `specs/001-api-tester/contracts/storage-api.md` - Storage APIs
- **Constitution:** `.specify/memory/constitution.md` - Project principles

### 2. Review Technical Decisions

See `specs/001-api-tester/research.md` for:
- Why Zustand over Redux
- Why Dexie.js for storage
- Why Monaco Editor despite size
- HTTP client architecture
- Test execution security

### 3. Start Contributing

1. Pick an issue from GitHub Issues or project board
2. Read the feature spec section related to the issue
3. Create feature branch following naming convention
4. Implement following constitution principles
5. Write tests (80% coverage target)
6. Submit PR with semantic commit message

### 4. Join Community

- **GitHub Discussions:** Ask questions, share ideas
- **Discord:** Real-time chat with maintainers
- **Contributing Guide:** `CONTRIBUTING.md` (TBD)

---

## Quick Reference

### Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Create production build |
| `pnpm start` | Run production server |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm lint` | Check code quality |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm format` | Format code with Prettier |
| `pnpm analyze` | Analyze bundle size |
| `pnpm tsc` | Type check without building |

### Keyboard Shortcuts (In App)

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Send request |
| `Cmd/Ctrl + S` | Save request |
| `Cmd/Ctrl + K` | Focus URL input |
| `Cmd/Ctrl + B` | Toggle sidebar |
| `Cmd/Ctrl + /` | Toggle dark mode |
| `Cmd/Ctrl + ,` | Open settings |

### File Conventions

- **Components:** PascalCase (`RequestBuilder.tsx`)
- **Utilities:** camelCase (`formatResponse.ts`)
- **Types:** PascalCase with `.ts` extension (`Request.ts`)
- **Tests:** Same name as source + `.test.ts` (`useRequest.test.ts`)
- **Styles:** Inline Tailwind (no separate CSS files)

---

## Support

### Getting Help

- **Documentation:** Check `specs/001-api-tester/` directory
- **GitHub Issues:** Search existing issues or create new
- **GitHub Discussions:** Community Q&A
- **Discord:** #restify-dev channel (link TBD)

### Reporting Bugs

Include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/OS/Node version
5. Console errors (if any)

### Feature Requests

Use Feature Request template in GitHub Issues:
1. Problem description
2. Proposed solution
3. Alternatives considered
4. Additional context

---

**Ready to build?** Start the dev server and begin exploring! 🚀

```bash
pnpm dev
```

Open http://localhost:3000 and send your first request!
