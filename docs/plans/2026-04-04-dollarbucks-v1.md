# Dollarbucks v1.0 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a mobile-first PWA that lets parents manage kids' chores and pocket money with a local-only ledger — no backend required.

**Architecture:** Vertical slice architecture organised by domain (children / chores / ledger). Each slice owns its components, Zustand store, and TypeScript types. Shared primitives live in `src/components/ui`. All persistence is via Zustand `persist` middleware writing to `localStorage`.

**Tech Stack:** React 18, TypeScript 5, Tailwind CSS 3, Zustand 4, React Router v6, Vite 5, vite-plugin-pwa

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json` (via scaffold)
- Create: `tailwind.config.ts`
- Create: `src/index.css`
- Create: `vite.config.ts`

### Step 1: Scaffold the Vite project

```bash
cd /Users/daniel/Code/Personal/dollarbucks
npm create vite@latest . -- --template react-ts
```

Expected: Vite project files created in current directory (overwrites with `y`).

### Step 2: Install dependencies

```bash
npm install
npm install zustand react-router-dom
npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms vite-plugin-pwa
npx tailwindcss init -p
```

### Step 3: Configure Tailwind brand colours

Replace `tailwind.config.ts` with:

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:   '#1B5FA8',
          orange: '#E8821A',
          yellow: '#F5C842',
          green:  '#4CAF6E',
          cream:  '#FFF8EE',
          navy:   '#0D2F55',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        ui:      ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
} satisfies Config
```

### Step 4: Replace `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  background-color: #FFF8EE;
  font-family: system-ui, sans-serif;
}
```

### Step 5: Configure Vite with PWA plugin

Replace `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Dollarbucks',
        short_name: 'Dollarbucks',
        description: 'Earn it. Save it. Spend it.',
        theme_color: '#1B5FA8',
        background_color: '#FFF8EE',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache' },
          },
        ],
      },
    }),
  ],
})
```

### Step 6: Add PWA placeholder icons (yellow coin)

Create `public/icon-192.png` and `public/icon-512.png` — place any 192×192 and 512×512 PNG placeholder images in `public/` for now (can be replaced with proper art later).

### Step 7: Delete Vite boilerplate

```bash
rm -rf src/assets src/App.css
```

Replace `src/App.tsx` with a bare shell:

```tsx
export default function App() {
  return <div className="min-h-screen bg-brand-cream">Dollarbucks</div>
}
```

### Step 8: Verify dev server starts

```bash
npm run dev
```

Expected: Browser shows "Dollarbucks" on cream background at `http://localhost:5173`.

### Step 9: Commit

```bash
git init
git add -A
git commit -m "chore: scaffold Vite + React + TS + Tailwind + PWA"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/features/children/types.ts`
- Create: `src/features/chores/types.ts`
- Create: `src/features/ledger/types.ts`
- Create: `src/features/app/types.ts`

### Step 1: Write children types

```ts
// src/features/children/types.ts
export interface Child {
  id: string
  name: string
  avatarColour: string  // hex, e.g. "#E8821A"
  weeklyAllowance: number | null
}
```

### Step 2: Write chore types

```ts
// src/features/chores/types.ts
export type EarningScheme = 'fixed' | 'allowance'

export interface Chore {
  id: string
  childId: string
  name: string
  scheme: EarningScheme
  fixedAmount: number | null  // required when scheme === 'fixed'
  isComplete: boolean
  createdAt: string  // ISO date string
}
```

### Step 3: Write ledger types

```ts
// src/features/ledger/types.ts
export type LedgerEntryType =
  | 'chore_fixed'
  | 'chore_allowance'
  | 'withdrawal'
  | 'allowance_reversal'

export interface LedgerEntry {
  id: string
  childId: string
  date: string         // ISO datetime string
  description: string
  amount: number       // positive = credit, negative = debit
  type: LedgerEntryType
}
```

### Step 4: Write app state types

```ts
// src/features/app/types.ts
export interface AppState {
  currentWeekStartDate: string  // ISO date string (Monday of current week)
}
```

### Step 5: Commit

```bash
git add src/features
git commit -m "feat: add TypeScript domain types"
```

---

## Task 3: Zustand Stores with localStorage Persistence

**Files:**
- Create: `src/features/children/store.ts`
- Create: `src/features/chores/store.ts`
- Create: `src/features/ledger/store.ts`
- Create: `src/features/app/store.ts`

> **Why Zustand `persist`?** It wraps your store with automatic `localStorage` read/write using `JSON.stringify`/`parse`. You never touch `localStorage` directly in components — the store is the single source of truth.

### Step 1: Children store

```ts
// src/features/children/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type { Child } from './types'

interface ChildrenStore {
  children: Child[]
  addChild: (data: Omit<Child, 'id'>) => void
  updateChild: (id: string, data: Partial<Omit<Child, 'id'>>) => void
  removeChild: (id: string) => void
}

export const useChildrenStore = create<ChildrenStore>()(
  persist(
    (set) => ({
      children: [],
      addChild: (data) =>
        set((s) => ({ children: [...s.children, { id: uuid(), ...data }] })),
      updateChild: (id, data) =>
        set((s) => ({
          children: s.children.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      removeChild: (id) =>
        set((s) => ({ children: s.children.filter((c) => c.id !== id) })),
    }),
    { name: 'dollarbucks-children' }
  )
)
```

Install uuid:

```bash
npm install uuid
npm install -D @types/uuid
```

### Step 2: Chores store

```ts
// src/features/chores/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type { Chore } from './types'

interface ChoresStore {
  chores: Chore[]
  addChore: (data: Omit<Chore, 'id' | 'isComplete' | 'createdAt'>) => void
  updateChore: (id: string, data: Partial<Omit<Chore, 'id'>>) => void
  removeChore: (id: string) => void
  setComplete: (id: string, isComplete: boolean) => void
  resetAllChores: () => void
  removeChoresForChild: (childId: string) => void
}

export const useChoresStore = create<ChoresStore>()(
  persist(
    (set) => ({
      chores: [],
      addChore: (data) =>
        set((s) => ({
          chores: [
            ...s.chores,
            { id: uuid(), isComplete: false, createdAt: new Date().toISOString(), ...data },
          ],
        })),
      updateChore: (id, data) =>
        set((s) => ({
          chores: s.chores.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      removeChore: (id) =>
        set((s) => ({ chores: s.chores.filter((c) => c.id !== id) })),
      setComplete: (id, isComplete) =>
        set((s) => ({
          chores: s.chores.map((c) => (c.id === id ? { ...c, isComplete } : c)),
        })),
      resetAllChores: () =>
        set((s) => ({ chores: s.chores.map((c) => ({ ...c, isComplete: false })) })),
      removeChoresForChild: (childId) =>
        set((s) => ({ chores: s.chores.filter((c) => c.childId !== childId) })),
    }),
    { name: 'dollarbucks-chores' }
  )
)
```

### Step 3: Ledger store

```ts
// src/features/ledger/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type { LedgerEntry, LedgerEntryType } from './types'

interface LedgerStore {
  entries: LedgerEntry[]
  addEntry: (data: Omit<LedgerEntry, 'id' | 'date'>) => void
  removeEntriesForChild: (childId: string) => void
  // Removes the most recent chore_fixed entry for a given chore (used for unmark)
  reverseChoreEntry: (childId: string, description: string) => void
  getBalanceForChild: (childId: string) => number
  getEntriesForChild: (childId: string) => LedgerEntry[]
}

export const useLedgerStore = create<LedgerStore>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (data) =>
        set((s) => ({
          entries: [
            ...s.entries,
            { id: uuid(), date: new Date().toISOString(), ...data },
          ],
        })),
      removeEntriesForChild: (childId) =>
        set((s) => ({ entries: s.entries.filter((e) => e.childId !== childId) })),
      reverseChoreEntry: (childId, description) =>
        set((s) => {
          // Find the most recent matching entry and remove it
          const idx = [...s.entries]
            .reverse()
            .findIndex(
              (e) =>
                e.childId === childId &&
                e.type === 'chore_fixed' &&
                e.description === description
            )
          if (idx === -1) return s
          const realIdx = s.entries.length - 1 - idx
          return { entries: s.entries.filter((_, i) => i !== realIdx) }
        }),
      getBalanceForChild: (childId) =>
        get()
          .entries.filter((e) => e.childId === childId)
          .reduce((sum, e) => sum + e.amount, 0),
      getEntriesForChild: (childId) =>
        get()
          .entries.filter((e) => e.childId === childId)
          .sort((a, b) => b.date.localeCompare(a.date)),
    }),
    { name: 'dollarbucks-ledger' }
  )
)
```

### Step 4: App state store

```ts
// src/features/app/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState } from './types'

function getMondayOfThisWeek(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff)).toISOString().split('T')[0]
}

interface AppStore extends AppState {
  setWeekStartDate: (date: string) => void
  resetWeekStartToNow: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      currentWeekStartDate: getMondayOfThisWeek(),
      setWeekStartDate: (date) => set({ currentWeekStartDate: date }),
      resetWeekStartToNow: () =>
        set({ currentWeekStartDate: getMondayOfThisWeek() }),
    }),
    { name: 'dollarbucks-app' }
  )
)
```

### Step 5: Commit

```bash
git add src/features
git commit -m "feat: add Zustand stores with localStorage persistence"
```

---

## Task 4: Business Logic — Chore Completion & Weekly Reset

**Files:**
- Create: `src/features/chores/useChoreActions.ts`
- Create: `src/features/ledger/useWeeklyReset.ts`

> **Critical business rules:** BR-04 (fixed chores post immediately), BR-05 (allowance posts at reset only), BR-10 (reset is manual). These are the core domain invariants — keep them in dedicated hooks, not scattered across UI handlers.

### Step 1: Chore completion hook

```ts
// src/features/chores/useChoreActions.ts
import { useChoresStore } from './store'
import { useLedgerStore } from '../ledger/store'
import type { Chore } from './types'

/**
 * Returns a handler that toggles a chore's completion status.
 * For fixed chores: posts or reverses a ledger entry.
 * For allowance chores: only flips isComplete.
 */
export function useChoreActions() {
  const { setComplete } = useChoresStore()
  const { addEntry, reverseChoreEntry } = useLedgerStore()

  function toggleChore(chore: Chore) {
    const nowComplete = !chore.isComplete
    setComplete(chore.id, nowComplete)

    if (chore.scheme === 'fixed' && chore.fixedAmount != null) {
      if (nowComplete) {
        addEntry({
          childId: chore.childId,
          description: chore.name,
          amount: chore.fixedAmount,
          type: 'chore_fixed',
        })
      } else {
        reverseChoreEntry(chore.childId, chore.name)
      }
    }
    // allowance chores: no ledger entry — tracked at week reset
  }

  return { toggleChore }
}
```

### Step 2: Write unit test for chore completion logic

Create `src/features/chores/useChoreActions.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useChoresStore } from './store'
import { useLedgerStore } from '../ledger/store'
import { useChoreActions } from './useChoreActions'
import type { Chore } from './types'

// Helper — reset store state between tests
function resetStores() {
  useChoresStore.setState({ chores: [] })
  useLedgerStore.setState({ entries: [] })
}

const baseChore: Chore = {
  id: 'c1',
  childId: 'kid1',
  name: 'Make bed',
  scheme: 'fixed',
  fixedAmount: 0.5,
  isComplete: false,
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('toggleChore — fixed scheme', () => {
  beforeEach(resetStores)

  it('posts a positive ledger entry when marking complete', () => {
    useChoresStore.setState({ chores: [baseChore] })
    const { toggleChore } = useChoreActions()
    toggleChore(baseChore)

    const entries = useLedgerStore.getState().entries
    expect(entries).toHaveLength(1)
    expect(entries[0].amount).toBe(0.5)
    expect(entries[0].type).toBe('chore_fixed')
  })

  it('reverses the entry when unmarking', () => {
    const completedChore = { ...baseChore, isComplete: true }
    useChoresStore.setState({ chores: [completedChore] })
    useLedgerStore.setState({
      entries: [{
        id: 'e1', childId: 'kid1', date: '2026-01-01T10:00:00.000Z',
        description: 'Make bed', amount: 0.5, type: 'chore_fixed',
      }],
    })
    const { toggleChore } = useChoreActions()
    toggleChore(completedChore)

    const entries = useLedgerStore.getState().entries
    expect(entries).toHaveLength(0)
  })
})

describe('toggleChore — allowance scheme', () => {
  beforeEach(resetStores)

  it('does NOT post a ledger entry when completing an allowance chore', () => {
    const allowanceChore: Chore = { ...baseChore, scheme: 'allowance', fixedAmount: null }
    useChoresStore.setState({ chores: [allowanceChore] })
    const { toggleChore } = useChoreActions()
    toggleChore(allowanceChore)

    expect(useLedgerStore.getState().entries).toHaveLength(0)
    expect(useChoresStore.getState().chores[0].isComplete).toBe(true)
  })
})
```

### Step 3: Install Vitest

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

Add to `vite.config.ts` (inside `defineConfig`):

```ts
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./src/test-setup.ts'],
},
```

Create `src/test-setup.ts`:

```ts
import '@testing-library/jest-dom'
```

Add to `tsconfig.app.json` `compilerOptions`:

```json
"types": ["vitest/globals", "@testing-library/jest-dom"]
```

### Step 4: Run tests

```bash
npx vitest run src/features/chores/useChoreActions.test.ts
```

Expected: 3 tests pass.

### Step 5: Weekly reset hook

```ts
// src/features/ledger/useWeeklyReset.ts
import { useChildrenStore } from '../children/store'
import { useChoresStore } from '../chores/store'
import { useLedgerStore } from './store'
import { useAppStore } from '../app/store'

export interface WeekResetSummary {
  childId: string
  childName: string
  allowanceEarned: number
  allowanceChoresCompleted: number
  allowanceChoresTotal: number
}

/**
 * Returns a preview of what the reset will post, and a function to execute it.
 * Call getResetSummary() first to show confirmation UI,
 * then call executeReset() when the parent confirms.
 */
export function useWeeklyReset() {
  const { children } = useChildrenStore()
  const { chores, resetAllChores } = useChoresStore()
  const { addEntry } = useLedgerStore()
  const { resetWeekStartToNow } = useAppStore()

  function getResetSummary(): WeekResetSummary[] {
    return children
      .filter((child) => child.weeklyAllowance != null)
      .map((child) => {
        const allowanceChores = chores.filter(
          (c) => c.childId === child.id && c.scheme === 'allowance'
        )
        const completed = allowanceChores.filter((c) => c.isComplete).length
        const total = allowanceChores.length
        const ratio = total === 0 ? 0 : completed / total
        const allowanceEarned =
          total === 0 ? 0 : Math.round(child.weeklyAllowance! * ratio * 100) / 100

        return {
          childId: child.id,
          childName: child.name,
          allowanceEarned,
          allowanceChoresCompleted: completed,
          allowanceChoresTotal: total,
        }
      })
  }

  function executeReset() {
    const summaries = getResetSummary()

    summaries.forEach(({ childId, childName, allowanceEarned }) => {
      if (allowanceEarned > 0) {
        addEntry({
          childId,
          description: 'Weekly allowance',
          amount: allowanceEarned,
          type: 'chore_allowance',
        })
      }
    })

    resetAllChores()
    resetWeekStartToNow()

    return summaries
  }

  return { getResetSummary, executeReset }
}
```

### Step 6: Write unit test for weekly reset

Create `src/features/ledger/useWeeklyReset.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useChildrenStore } from '../children/store'
import { useChoresStore } from '../chores/store'
import { useLedgerStore } from './store'
import { useWeeklyReset } from './useWeeklyReset'

function resetStores() {
  useChildrenStore.setState({ children: [] })
  useChoresStore.setState({ chores: [] })
  useLedgerStore.setState({ entries: [] })
}

describe('getResetSummary', () => {
  beforeEach(resetStores)

  it('calculates proportional allowance for partially completed week', () => {
    useChildrenStore.setState({
      children: [{ id: 'k1', name: 'Jack', avatarColour: '#E8821A', weeklyAllowance: 10 }],
    })
    useChoresStore.setState({
      chores: [
        { id: 'ch1', childId: 'k1', name: 'Tidy room', scheme: 'allowance', fixedAmount: null, isComplete: true, createdAt: '' },
        { id: 'ch2', childId: 'k1', name: 'Set table', scheme: 'allowance', fixedAmount: null, isComplete: false, createdAt: '' },
        { id: 'ch3', childId: 'k1', name: 'Feed dog', scheme: 'allowance', fixedAmount: null, isComplete: false, createdAt: '' },
        { id: 'ch4', childId: 'k1', name: 'Unpack bag', scheme: 'allowance', fixedAmount: null, isComplete: false, createdAt: '' },
      ],
    })
    const { getResetSummary } = useWeeklyReset()
    const [summary] = getResetSummary()
    expect(summary.allowanceEarned).toBe(2.5)  // 1/4 of $10
  })

  it('returns 0 earned when no allowance chores exist', () => {
    useChildrenStore.setState({
      children: [{ id: 'k1', name: 'Jack', avatarColour: '#E8821A', weeklyAllowance: 10 }],
    })
    useChoresStore.setState({ chores: [] })
    const { getResetSummary } = useWeeklyReset()
    const [summary] = getResetSummary()
    expect(summary.allowanceEarned).toBe(0)
  })
})

describe('executeReset', () => {
  beforeEach(resetStores)

  it('posts allowance ledger entry and resets all chore completions', () => {
    useChildrenStore.setState({
      children: [{ id: 'k1', name: 'Jack', avatarColour: '#E8821A', weeklyAllowance: 10 }],
    })
    useChoresStore.setState({
      chores: [
        { id: 'ch1', childId: 'k1', name: 'Tidy room', scheme: 'allowance', fixedAmount: null, isComplete: true, createdAt: '' },
        { id: 'ch2', childId: 'k1', name: 'Set table', scheme: 'allowance', fixedAmount: null, isComplete: true, createdAt: '' },
      ],
    })
    const { executeReset } = useWeeklyReset()
    executeReset()

    const entries = useLedgerStore.getState().entries
    expect(entries).toHaveLength(1)
    expect(entries[0].amount).toBe(10)
    expect(entries[0].type).toBe('chore_allowance')

    const chores = useChoresStore.getState().chores
    expect(chores.every((c) => !c.isComplete)).toBe(true)
  })
})
```

### Step 7: Run all tests

```bash
npx vitest run
```

Expected: All tests pass.

### Step 8: Commit

```bash
git add src/features
git commit -m "feat: add chore completion and weekly reset business logic with tests"
```

---

## Task 5: Routing & App Shell

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`
- Create: `src/pages/HomePage.tsx`
- Create: `src/pages/ChildDetailPage.tsx`
- Create: `src/pages/LedgerPage.tsx`
- Create: `src/pages/SettingsPage.tsx`
- Create: `src/components/layout/BottomNav.tsx`

### Step 1: Add router to main.tsx

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

### Step 2: Set up routes in App.tsx

```tsx
// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { BottomNav } from './components/layout/BottomNav'
import { HomePage } from './pages/HomePage'
import { ChildDetailPage } from './pages/ChildDetailPage'
import { LedgerPage } from './pages/LedgerPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <div className="min-h-screen bg-brand-cream pb-20 max-w-lg mx-auto">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/child/:childId" element={<ChildDetailPage />} />
        <Route path="/child/:childId/ledger" element={<LedgerPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}
```

### Step 3: Bottom navigation bar

```tsx
// src/components/layout/BottomNav.tsx
import { NavLink } from 'react-router-dom'

export function BottomNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center text-xs gap-1 py-2 px-4 ${
      isActive ? 'text-brand-blue font-semibold' : 'text-gray-400'
    }`

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around max-w-lg mx-auto">
      <NavLink to="/" end className={linkClass}>
        <span className="text-2xl">🏠</span>
        <span>Home</span>
      </NavLink>
      <NavLink to="/settings" className={linkClass}>
        <span className="text-2xl">⚙️</span>
        <span>Settings</span>
      </NavLink>
    </nav>
  )
}
```

### Step 4: Create page stubs

```tsx
// src/pages/HomePage.tsx
export function HomePage() {
  return <div className="p-4"><h1 className="font-display text-2xl text-brand-navy">Dollarbucks</h1></div>
}
```

```tsx
// src/pages/ChildDetailPage.tsx
import { useParams } from 'react-router-dom'
export function ChildDetailPage() {
  const { childId } = useParams()
  return <div className="p-4">Child: {childId}</div>
}
```

```tsx
// src/pages/LedgerPage.tsx
import { useParams } from 'react-router-dom'
export function LedgerPage() {
  const { childId } = useParams()
  return <div className="p-4">Ledger: {childId}</div>
}
```

```tsx
// src/pages/SettingsPage.tsx
export function SettingsPage() {
  return <div className="p-4">Settings</div>
}
```

### Step 5: Verify routing works

```bash
npm run dev
```

Navigate to `/`, `/settings` — both render without errors. Bottom nav shows two tabs.

### Step 6: Commit

```bash
git add src/
git commit -m "feat: add routing, app shell, and bottom nav"
```

---

## Task 6: Shared UI Components

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/BalanceBadge.tsx`
- Create: `src/components/ui/PageHeader.tsx`

### Step 1: Button

```tsx
// src/components/ui/Button.tsx
import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-brand-blue text-white active:bg-blue-900',
  secondary: 'bg-brand-orange text-white active:bg-orange-700',
  danger: 'bg-red-500 text-white active:bg-red-700',
  ghost: 'bg-transparent text-brand-blue border border-brand-blue',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-5 py-3.5 text-lg',
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: Props) {
  return (
    <button
      className={`rounded-xl font-ui font-semibold min-h-[44px] transition-opacity disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}
```

### Step 2: Input

```tsx
// src/components/ui/Input.tsx
import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-semibold text-brand-navy">{label}</label>}
      <input
        className={`border rounded-lg px-3 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue min-h-[44px] ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
```

### Step 3: Modal

```tsx
// src/components/ui/Modal.tsx
import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        {title && (
          <h2 className="font-display text-xl text-brand-navy mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  )
}
```

### Step 4: BalanceBadge

```tsx
// src/components/ui/BalanceBadge.tsx
interface Props {
  balance: number
  size?: 'sm' | 'lg'
}

export function BalanceBadge({ balance, size = 'lg' }: Props) {
  const isNegative = balance < 0
  const formatted = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(balance)

  return (
    <span
      className={`font-display font-bold tabular-nums ${
        isNegative ? 'text-red-500' : 'text-brand-green'
      } ${size === 'lg' ? 'text-3xl' : 'text-xl'}`}
    >
      {formatted}
    </span>
  )
}
```

### Step 5: PageHeader

```tsx
// src/components/ui/PageHeader.tsx
import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
  back?: boolean
}

export function PageHeader({ title, back }: Props) {
  const navigate = useNavigate()
  return (
    <header className="flex items-center gap-3 px-4 pt-6 pb-4 bg-brand-navy text-white">
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="text-2xl min-h-[44px] min-w-[44px] flex items-center"
          aria-label="Back"
        >
          ←
        </button>
      )}
      <h1 className="font-display text-2xl flex-1">{title}</h1>
    </header>
  )
}
```

### Step 6: Commit

```bash
git add src/components
git commit -m "feat: add shared UI components (Button, Input, Modal, BalanceBadge, PageHeader)"
```

---

## Task 7: Home Screen

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Create: `src/features/children/components/ChildCard.tsx`
- Create: `src/features/children/components/EmptyState.tsx`

> The home screen is the app's primary entry point. Child cards give parents/kids instant visual feedback on balance and chore progress. Keep it scannable — one glance should tell you how each child is doing this week.

### Step 1: ChildCard component

```tsx
// src/features/children/components/ChildCard.tsx
import { useNavigate } from 'react-router-dom'
import { useChoresStore } from '../../chores/store'
import { useLedgerStore } from '../../ledger/store'
import { BalanceBadge } from '../../../components/ui/BalanceBadge'
import type { Child } from '../types'

interface Props {
  child: Child
}

export function ChildCard({ child }: Props) {
  const navigate = useNavigate()
  const chores = useChoresStore((s) => s.chores.filter((c) => c.childId === child.id))
  const balance = useLedgerStore((s) => s.getBalanceForChild(child.id))

  const totalChores = chores.length
  const completedChores = chores.filter((c) => c.isComplete).length

  return (
    <button
      onClick={() => navigate(`/child/${child.id}`)}
      className="w-full text-left bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-transform"
    >
      {/* Avatar */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0"
        style={{ backgroundColor: child.avatarColour }}
      >
        {child.name[0].toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-display text-lg text-brand-navy truncate">{child.name}</div>
        <div className="text-sm text-gray-500">
          {totalChores === 0
            ? 'No chores yet'
            : `${completedChores}/${totalChores} chores done`}
        </div>
      </div>

      {/* Balance */}
      <BalanceBadge balance={balance} size="sm" />
    </button>
  )
}
```

### Step 2: EmptyState component

```tsx
// src/features/children/components/EmptyState.tsx
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'

export function EmptyState() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-6">
      <div className="text-6xl">🪙</div>
      <div>
        <h2 className="font-display text-xl text-brand-navy">No kids yet!</h2>
        <p className="text-gray-500 mt-2">Add a child to get started.</p>
      </div>
      <Button onClick={() => navigate('/settings')}>Add a child</Button>
    </div>
  )
}
```

### Step 3: Full HomePage

```tsx
// src/pages/HomePage.tsx
import { useChildrenStore } from '../features/children/store'
import { ChildCard } from '../features/children/components/ChildCard'
import { EmptyState } from '../features/children/components/EmptyState'

export function HomePage() {
  const children = useChildrenStore((s) => s.children)

  return (
    <main>
      <header className="bg-brand-navy px-4 pt-8 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-brand-yellow text-3xl">🪙</span>
          <h1 className="font-display text-2xl text-white">Dollarbucks</h1>
        </div>
        <p className="text-brand-yellow text-sm font-ui">Earn it. Save it. Spend it.</p>
      </header>

      <div className="p-4 flex flex-col gap-3">
        {children.length === 0 ? (
          <EmptyState />
        ) : (
          children.map((child) => <ChildCard key={child.id} child={child} />)
        )}
      </div>
    </main>
  )
}
```

### Step 4: Verify in browser

```bash
npm run dev
```

Expected: Home screen shows the coin logo header and empty state with "Add a child" button.

### Step 5: Commit

```bash
git add src/
git commit -m "feat: home screen with child cards and empty state"
```

---

## Task 8: Settings — Manage Children

**Files:**
- Modify: `src/pages/SettingsPage.tsx`
- Create: `src/features/children/components/ChildForm.tsx`
- Create: `src/features/children/components/ChildList.tsx`

> This is the primary data-entry surface for parents. The avatar colour picker uses a curated palette of ~8 Bluey-inspired colours — no freeform hex input for v1.

### Step 1: Avatar colour palette constant

Create `src/features/children/avatarColours.ts`:

```ts
export const AVATAR_COLOURS = [
  '#1B5FA8', // Bluey Blue
  '#E8821A', // Bingo Orange
  '#F5C842', // Sunny Yellow
  '#4CAF6E', // Grass Green
  '#9B59B6', // Purple
  '#E74C3C', // Red
  '#1ABC9C', // Teal
  '#F39C12', // Amber
]
```

### Step 2: ChildForm component

```tsx
// src/features/children/components/ChildForm.tsx
import { useState } from 'react'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { AVATAR_COLOURS } from '../avatarColours'
import type { Child } from '../types'

interface Props {
  initial?: Partial<Child>
  onSubmit: (data: Omit<Child, 'id'>) => void
  onCancel: () => void
}

export function ChildForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [colour, setColour] = useState(initial?.avatarColour ?? AVATAR_COLOURS[0])
  const [allowance, setAllowance] = useState(initial?.weeklyAllowance?.toString() ?? '')
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    onSubmit({
      name: name.trim(),
      avatarColour: colour,
      weeklyAllowance: allowance ? parseFloat(allowance) : null,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Child's name"
        value={name}
        onChange={(e) => { setName(e.target.value); setError('') }}
        placeholder="e.g. Jack"
        error={error}
        autoFocus
      />

      <div>
        <label className="text-sm font-semibold text-brand-navy block mb-2">
          Avatar colour
        </label>
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLOURS.map((c) => (
            <button
              key={c}
              onClick={() => setColour(c)}
              className={`w-10 h-10 rounded-full border-4 transition-transform ${
                colour === c ? 'border-brand-navy scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      <Input
        label="Weekly allowance (optional)"
        type="number"
        min="0"
        step="0.50"
        value={allowance}
        onChange={(e) => setAllowance(e.target.value)}
        placeholder="e.g. 10.00"
      />

      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} className="flex-1">Save</Button>
      </div>
    </div>
  )
}
```

### Step 3: ChildList component

```tsx
// src/features/children/components/ChildList.tsx
import { useState } from 'react'
import { useChildrenStore } from '../store'
import { useChoresStore } from '../../chores/store'
import { useLedgerStore } from '../../ledger/store'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { ChildForm } from './ChildForm'
import type { Child } from '../types'

export function ChildList() {
  const { children, addChild, updateChild, removeChild } = useChildrenStore()
  const { removeChoresForChild } = useChoresStore()
  const { removeEntriesForChild } = useLedgerStore()

  const [addOpen, setAddOpen] = useState(false)
  const [editChild, setEditChild] = useState<Child | null>(null)
  const [deleteChild, setDeleteChild] = useState<Child | null>(null)

  function handleDelete(child: Child) {
    removeChild(child.id)
    removeChoresForChild(child.id)
    removeEntriesForChild(child.id)
    setDeleteChild(null)
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-brand-navy">Children</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}>+ Add</Button>
      </div>

      {children.length === 0 && (
        <p className="text-gray-500 text-sm">No children yet.</p>
      )}

      {children.map((child) => (
        <div
          key={child.id}
          className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
            style={{ backgroundColor: child.avatarColour }}
          >
            {child.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-brand-navy truncate">{child.name}</div>
            {child.weeklyAllowance != null && (
              <div className="text-xs text-gray-500">
                ${child.weeklyAllowance.toFixed(2)}/week
              </div>
            )}
          </div>
          <button
            onClick={() => setEditChild(child)}
            className="text-brand-blue text-sm min-h-[44px] px-2"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteChild(child)}
            className="text-red-500 text-sm min-h-[44px] px-2"
          >
            Remove
          </button>
        </div>
      ))}

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add child">
        <ChildForm
          onSubmit={(data) => { addChild(data); setAddOpen(false) }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editChild} onClose={() => setEditChild(null)} title="Edit child">
        {editChild && (
          <ChildForm
            initial={editChild}
            onSubmit={(data) => { updateChild(editChild.id, data); setEditChild(null) }}
            onCancel={() => setEditChild(null)}
          />
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteChild} onClose={() => setDeleteChild(null)} title="Remove child?">
        {deleteChild && (
          <div className="flex flex-col gap-4">
            <p className="text-gray-700">
              This will permanently delete <strong>{deleteChild.name}</strong> and all their chores and ledger history.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setDeleteChild(null)} className="flex-1">Cancel</Button>
              <Button variant="danger" onClick={() => handleDelete(deleteChild)} className="flex-1">Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
```

### Step 4: Wire into SettingsPage

```tsx
// src/pages/SettingsPage.tsx
import { PageHeader } from '../components/ui/PageHeader'
import { ChildList } from '../features/children/components/ChildList'

export function SettingsPage() {
  return (
    <main>
      <PageHeader title="Settings" />
      <div className="p-4 flex flex-col gap-6">
        <ChildList />
      </div>
    </main>
  )
}
```

### Step 5: Verify — add/edit/remove children work end-to-end

```bash
npm run dev
```

Go to Settings → add a child → verify they appear on Home Screen with correct avatar colour and $0.00 balance.

### Step 6: Commit

```bash
git add src/
git commit -m "feat: manage children — add, edit, remove with avatar colour picker"
```

---

## Task 9: Settings — Manage Chores

**Files:**
- Create: `src/features/chores/components/ChoreForm.tsx`
- Create: `src/features/chores/components/ChoreListForChild.tsx`
- Modify: `src/pages/SettingsPage.tsx`

### Step 1: ChoreForm component

```tsx
// src/features/chores/components/ChoreForm.tsx
import { useState } from 'react'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import type { Chore, EarningScheme } from '../types'

interface Props {
  childId: string
  initial?: Partial<Chore>
  onSubmit: (data: Omit<Chore, 'id' | 'isComplete' | 'createdAt'>) => void
  onCancel: () => void
}

export function ChoreForm({ childId, initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [scheme, setScheme] = useState<EarningScheme>(initial?.scheme ?? 'fixed')
  const [amount, setAmount] = useState(initial?.fixedAmount?.toString() ?? '')
  const [nameError, setNameError] = useState('')
  const [amountError, setAmountError] = useState('')

  function handleSubmit() {
    let valid = true
    if (!name.trim()) { setNameError('Name is required'); valid = false }
    if (scheme === 'fixed' && (!amount || parseFloat(amount) <= 0)) {
      setAmountError('Enter a valid amount'); valid = false
    }
    if (!valid) return

    onSubmit({
      childId,
      name: name.trim(),
      scheme,
      fixedAmount: scheme === 'fixed' ? parseFloat(amount) : null,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Chore name"
        value={name}
        onChange={(e) => { setName(e.target.value); setNameError('') }}
        placeholder="e.g. Make bed"
        error={nameError}
        autoFocus
      />

      <div>
        <label className="text-sm font-semibold text-brand-navy block mb-2">Earning type</label>
        <div className="flex gap-2">
          {(['fixed', 'allowance'] as EarningScheme[]).map((s) => (
            <button
              key={s}
              onClick={() => setScheme(s)}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-colors min-h-[44px] ${
                scheme === s
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {s === 'fixed' ? '💰 Fixed amount' : '📅 Weekly allowance'}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1.5">
          {scheme === 'fixed'
            ? 'Earns a fixed $ amount when marked complete.'
            : 'Contributes to weekly allowance % when complete.'}
        </p>
      </div>

      {scheme === 'fixed' && (
        <Input
          label="Amount ($)"
          type="number"
          min="0.01"
          step="0.25"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setAmountError('') }}
          placeholder="e.g. 0.50"
          error={amountError}
        />
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} className="flex-1">Save</Button>
      </div>
    </div>
  )
}
```

### Step 2: ChoreListForChild component

```tsx
// src/features/chores/components/ChoreListForChild.tsx
import { useState } from 'react'
import { useChoresStore } from '../store'
import { useLedgerStore } from '../../ledger/store'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { ChoreForm } from './ChoreForm'
import type { Child } from '../../children/types'
import type { Chore } from '../types'

interface Props {
  child: Child
}

export function ChoreListForChild({ child }: Props) {
  const { chores, addChore, updateChore, removeChore } = useChoresStore()
  const { reverseChoreEntry } = useLedgerStore()
  const childChores = chores.filter((c) => c.childId === child.id)

  const [addOpen, setAddOpen] = useState(false)
  const [editChore, setEditChore] = useState<Chore | null>(null)
  const [deleteChore, setDeleteChore] = useState<Chore | null>(null)

  function handleDelete(chore: Chore) {
    // If chore was completed and fixed, reverse its ledger entry
    if (chore.isComplete && chore.scheme === 'fixed') {
      reverseChoreEntry(chore.childId, chore.name)
    }
    removeChore(chore.id)
    setDeleteChore(null)
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-brand-navy">{child.name}'s chores</h3>
        <Button size="sm" onClick={() => setAddOpen(true)}>+ Add</Button>
      </div>

      {childChores.length === 0 && (
        <p className="text-gray-400 text-sm">No chores yet.</p>
      )}

      {childChores.map((chore) => (
        <div key={chore.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 truncate">{chore.name}</div>
            <div className="text-xs text-gray-400">
              {chore.scheme === 'fixed'
                ? `$${chore.fixedAmount?.toFixed(2)} fixed`
                : 'Weekly allowance'}
            </div>
          </div>
          <button onClick={() => setEditChore(chore)} className="text-brand-blue text-sm min-h-[44px] px-2">Edit</button>
          <button onClick={() => setDeleteChore(chore)} className="text-red-500 text-sm min-h-[44px] px-2">Remove</button>
        </div>
      ))}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add chore">
        <ChoreForm
          childId={child.id}
          onSubmit={(data) => { addChore(data); setAddOpen(false) }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>

      <Modal open={!!editChore} onClose={() => setEditChore(null)} title="Edit chore">
        {editChore && (
          <ChoreForm
            childId={child.id}
            initial={editChore}
            onSubmit={(data) => { updateChore(editChore.id, data); setEditChore(null) }}
            onCancel={() => setEditChore(null)}
          />
        )}
      </Modal>

      <Modal open={!!deleteChore} onClose={() => setDeleteChore(null)} title="Remove chore?">
        {deleteChore && (
          <div className="flex flex-col gap-4">
            <p className="text-gray-700">Remove <strong>{deleteChore.name}</strong>?</p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setDeleteChore(null)} className="flex-1">Cancel</Button>
              <Button variant="danger" onClick={() => handleDelete(deleteChore)} className="flex-1">Remove</Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
```

### Step 3: Add chore management to SettingsPage

```tsx
// src/pages/SettingsPage.tsx
import { PageHeader } from '../components/ui/PageHeader'
import { ChildList } from '../features/children/components/ChildList'
import { ChoreListForChild } from '../features/chores/components/ChoreListForChild'
import { useChildrenStore } from '../features/children/store'

export function SettingsPage() {
  const children = useChildrenStore((s) => s.children)
  return (
    <main>
      <PageHeader title="Settings" />
      <div className="p-4 flex flex-col gap-6">
        <ChildList />
        {children.map((child) => (
          <ChoreListForChild key={child.id} child={child} />
        ))}
      </div>
    </main>
  )
}
```

### Step 4: Verify

```bash
npm run dev
```

Add a child, then add both a fixed chore and an allowance chore. Verify they appear correctly under the child.

### Step 5: Commit

```bash
git add src/
git commit -m "feat: manage chores per child with scheme selector"
```

---

## Task 10: Child Detail Screen — Chore List + Completion

**Files:**
- Modify: `src/pages/ChildDetailPage.tsx`
- Create: `src/features/chores/components/ChoreItem.tsx`
- Create: `src/features/chores/components/AllowanceProgressBar.tsx`

### Step 1: ChoreItem component

```tsx
// src/features/chores/components/ChoreItem.tsx
import { useChoreActions } from '../useChoreActions'
import type { Chore } from '../types'

interface Props {
  chore: Chore
}

export function ChoreItem({ chore }: Props) {
  const { toggleChore } = useChoreActions()

  return (
    <button
      onClick={() => toggleChore(chore)}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors ${
        chore.isComplete
          ? 'bg-brand-green/10 border-brand-green'
          : 'bg-white border-gray-200'
      }`}
    >
      {/* Checkbox circle */}
      <div
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${
          chore.isComplete
            ? 'bg-brand-green border-brand-green text-white'
            : 'border-gray-300'
        }`}
      >
        {chore.isComplete && <span className="text-sm">✓</span>}
      </div>

      {/* Name */}
      <span
        className={`flex-1 text-left text-base font-ui ${
          chore.isComplete ? 'line-through text-gray-400' : 'text-gray-800'
        }`}
      >
        {chore.name}
      </span>

      {/* Badge */}
      {chore.scheme === 'fixed' ? (
        <span className="text-sm font-semibold text-brand-orange">
          ${chore.fixedAmount?.toFixed(2)}
        </span>
      ) : (
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
          allowance
        </span>
      )}
    </button>
  )
}
```

### Step 2: AllowanceProgressBar

```tsx
// src/features/chores/components/AllowanceProgressBar.tsx
import type { Child } from '../../children/types'
import type { Chore } from '../types'

interface Props {
  child: Child
  chores: Chore[]
}

export function AllowanceProgressBar({ child, chores }: Props) {
  if (child.weeklyAllowance == null) return null

  const allowanceChores = chores.filter((c) => c.scheme === 'allowance')
  if (allowanceChores.length === 0) return null

  const completed = allowanceChores.filter((c) => c.isComplete).length
  const pct = Math.round((completed / allowanceChores.length) * 100)
  const projected =
    Math.round((completed / allowanceChores.length) * child.weeklyAllowance * 100) / 100

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm font-semibold text-brand-navy">Weekly allowance</span>
        <span className="text-sm text-brand-orange font-bold">${projected.toFixed(2)} earned</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-orange rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {completed}/{allowanceChores.length} allowance chores · ${child.weeklyAllowance.toFixed(2)} max
      </div>
    </div>
  )
}
```

### Step 3: Full ChildDetailPage

```tsx
// src/pages/ChildDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useChildrenStore } from '../features/children/store'
import { useChoresStore } from '../features/chores/store'
import { useLedgerStore } from '../features/ledger/store'
import { ChoreItem } from '../features/chores/components/ChoreItem'
import { AllowanceProgressBar } from '../features/chores/components/AllowanceProgressBar'
import { BalanceBadge } from '../components/ui/BalanceBadge'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import { WithdrawalModal } from '../features/ledger/components/WithdrawalModal'
import { useState } from 'react'

export function ChildDetailPage() {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const child = useChildrenStore((s) => s.children.find((c) => c.id === childId))
  const chores = useChoresStore((s) => s.chores.filter((c) => c.childId === childId))
  const balance = useLedgerStore((s) => s.getBalanceForChild(childId!))
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  if (!child) return <div className="p-4">Child not found</div>

  return (
    <main>
      <PageHeader title={child.name} back />

      {/* Balance card */}
      <div className="bg-brand-navy mx-4 mt-4 rounded-2xl p-5 text-center">
        <p className="text-brand-yellow text-sm mb-1">Current balance</p>
        <BalanceBadge balance={balance} size="lg" />
      </div>

      {/* Allowance progress */}
      <div className="px-4 mt-4">
        <AllowanceProgressBar child={child} chores={chores} />
      </div>

      {/* Chore list */}
      <div className="px-4 mt-4 flex flex-col gap-2">
        <h2 className="font-display text-lg text-brand-navy">This week's chores</h2>
        {chores.length === 0 && (
          <p className="text-gray-400 text-sm">No chores assigned yet.</p>
        )}
        {chores.map((chore) => (
          <ChoreItem key={chore.id} chore={chore} />
        ))}
      </div>

      {/* Actions */}
      <div className="px-4 mt-6 flex flex-col gap-3">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setWithdrawOpen(true)}
        >
          💸 Withdraw cash
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => navigate(`/child/${childId}/ledger`)}
        >
          📋 View history
        </Button>
      </div>

      <WithdrawalModal
        child={child}
        balance={balance}
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
      />
    </main>
  )
}
```

### Step 4: Commit (stub — WithdrawalModal will be created in Task 11)

```bash
git add src/
git commit -m "feat: child detail screen with chore list and allowance progress"
```

---

## Task 11: Withdrawal Modal

**Files:**
- Create: `src/features/ledger/components/WithdrawalModal.tsx`

### Step 1: WithdrawalModal

```tsx
// src/features/ledger/components/WithdrawalModal.tsx
import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { useLedgerStore } from '../store'
import type { Child } from '../../children/types'

interface Props {
  child: Child
  balance: number
  open: boolean
  onClose: () => void
}

export function WithdrawalModal({ child, balance, open, onClose }: Props) {
  const { addEntry } = useLedgerStore()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [amountError, setAmountError] = useState('')

  function reset() { setAmount(''); setNote(''); setAmountError('') }

  function handleClose() { reset(); onClose() }

  function handleConfirm() {
    const value = parseFloat(amount)
    if (!amount || isNaN(value) || value <= 0) {
      setAmountError('Enter a valid amount')
      return
    }
    addEntry({
      childId: child.id,
      description: note.trim() || 'Cash withdrawal',
      amount: -value,
      type: 'withdrawal',
    })
    reset()
    onClose()
  }

  const withdrawAmount = parseFloat(amount) || 0
  const wouldOverdraft = withdrawAmount > balance

  return (
    <Modal open={open} onClose={handleClose} title={`Withdraw for ${child.name}`}>
      <div className="flex flex-col gap-4">
        <Input
          label="Amount ($)"
          type="number"
          min="0.01"
          step="0.50"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setAmountError('') }}
          placeholder="e.g. 5.00"
          error={amountError}
          autoFocus
        />

        <Input
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Bought LEGO set"
        />

        {wouldOverdraft && withdrawAmount > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-sm text-amber-800">
            ⚠️ This withdrawal exceeds {child.name}'s balance of ${balance.toFixed(2)}. Their balance will go negative.
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose} className="flex-1">Cancel</Button>
          <Button
            variant={wouldOverdraft ? 'danger' : 'primary'}
            onClick={handleConfirm}
            className="flex-1"
          >
            {wouldOverdraft ? 'Withdraw anyway' : 'Withdraw'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

### Step 2: Verify withdrawal end-to-end

```bash
npm run dev
```

1. Add a child, add a fixed chore, mark it complete → balance shows positive amount.
2. Tap "Withdraw cash" → enter amount less than balance → confirm → balance decreases.
3. Try to withdraw more than balance → warning appears, confirm → balance goes negative.

### Step 3: Commit

```bash
git add src/
git commit -m "feat: withdrawal modal with overdraft warning (BR-07)"
```

---

## Task 12: Ledger / History Screen

**Files:**
- Modify: `src/pages/LedgerPage.tsx`
- Create: `src/features/ledger/components/LedgerEntryRow.tsx`

### Step 1: LedgerEntryRow

```tsx
// src/features/ledger/components/LedgerEntryRow.tsx
import type { LedgerEntry } from '../types'

interface Props {
  entry: LedgerEntry
  runningBalance: number
}

export function LedgerEntryRow({ entry, runningBalance }: Props) {
  const isCredit = entry.amount > 0
  const dateStr = new Date(entry.date).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div
        className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
          isCredit ? 'bg-brand-green/10 text-brand-green' : 'bg-red-50 text-red-500'
        }`}
      >
        {isCredit ? '↑' : '↓'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800 truncate">{entry.description}</div>
        <div className="text-xs text-gray-400">{dateStr}</div>
      </div>
      <div className="text-right shrink-0">
        <div className={`text-sm font-bold ${isCredit ? 'text-brand-green' : 'text-red-500'}`}>
          {isCredit ? '+' : ''}
          {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(entry.amount)}
        </div>
        <div className="text-xs text-gray-400">
          {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(runningBalance)}
        </div>
      </div>
    </div>
  )
}
```

### Step 2: Full LedgerPage

```tsx
// src/pages/LedgerPage.tsx
import { useParams } from 'react-router-dom'
import { useChildrenStore } from '../features/children/store'
import { useLedgerStore } from '../features/ledger/store'
import { LedgerEntryRow } from '../features/ledger/components/LedgerEntryRow'
import { BalanceBadge } from '../components/ui/BalanceBadge'
import { PageHeader } from '../components/ui/PageHeader'

export function LedgerPage() {
  const { childId } = useParams<{ childId: string }>()
  const child = useChildrenStore((s) => s.children.find((c) => c.id === childId))
  const entries = useLedgerStore((s) => s.getEntriesForChild(childId!))
  const balance = useLedgerStore((s) => s.getBalanceForChild(childId!))

  if (!child) return <div className="p-4">Child not found</div>

  // Calculate running balance for each entry (oldest → newest, then reverse for display)
  const entriesOldestFirst = [...entries].reverse()
  const withBalances = entriesOldestFirst.reduce<{ entry: typeof entries[0]; running: number }[]>(
    (acc, entry) => {
      const prev = acc[acc.length - 1]?.running ?? 0
      acc.push({ entry, running: prev + entry.amount })
      return acc
    },
    []
  )
  const displayEntries = [...withBalances].reverse() // newest first

  return (
    <main>
      <PageHeader title={`${child.name}'s history`} back />

      {/* Balance summary */}
      <div className="bg-brand-navy mx-4 mt-4 rounded-2xl p-5 text-center">
        <p className="text-brand-yellow text-sm mb-1">Current balance</p>
        <BalanceBadge balance={balance} size="lg" />
      </div>

      {/* Transaction list */}
      <div className="mx-4 mt-4 bg-white rounded-2xl px-4 pb-2">
        {displayEntries.length === 0 ? (
          <p className="text-gray-400 text-sm py-6 text-center">No transactions yet.</p>
        ) : (
          displayEntries.map(({ entry, running }) => (
            <LedgerEntryRow key={entry.id} entry={entry} runningBalance={running} />
          ))
        )}
      </div>
    </main>
  )
}
```

### Step 3: Verify

```bash
npm run dev
```

Complete several chores, make a withdrawal, then tap "View history" — verify entries appear newest-first with correct running balances.

### Step 4: Commit

```bash
git add src/
git commit -m "feat: ledger history screen with running balance per entry"
```

---

## Task 13: Weekly Reset UI

**Files:**
- Create: `src/features/ledger/components/WeeklyResetModal.tsx`
- Modify: `src/pages/SettingsPage.tsx`

### Step 1: WeeklyResetModal

```tsx
// src/features/ledger/components/WeeklyResetModal.tsx
import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { useWeeklyReset } from '../useWeeklyReset'

interface Props {
  open: boolean
  onClose: () => void
}

export function WeeklyResetModal({ open, onClose }: Props) {
  const { getResetSummary, executeReset } = useWeeklyReset()
  const [done, setDone] = useState(false)
  const summary = open ? getResetSummary() : []

  function handleConfirm() {
    executeReset()
    setDone(true)
  }

  function handleClose() { setDone(false); onClose() }

  if (done) {
    return (
      <Modal open={open} onClose={handleClose} title="Week complete! 🎉">
        <div className="flex flex-col gap-4">
          <p className="text-gray-700">All chores have been reset for the new week.</p>
          <Button onClick={handleClose} className="w-full">Done</Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal open={open} onClose={handleClose} title="Reset week">
      <div className="flex flex-col gap-4">
        <p className="text-gray-600 text-sm">
          This will post weekly allowance earnings and reset all chore completion statuses.
        </p>

        {summary.length === 0 ? (
          <p className="text-gray-400 text-sm">No weekly allowance children to summarise.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {summary.map((s) => (
              <div key={s.childId} className="bg-brand-cream rounded-xl p-3 flex justify-between">
                <div>
                  <div className="font-semibold text-brand-navy">{s.childName}</div>
                  <div className="text-xs text-gray-500">
                    {s.allowanceChoresCompleted}/{s.allowanceChoresTotal} allowance chores done
                  </div>
                </div>
                <div className="text-brand-green font-bold text-lg">
                  ${s.allowanceEarned.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose} className="flex-1">Cancel</Button>
          <Button onClick={handleConfirm} className="flex-1">Confirm reset</Button>
        </div>
      </div>
    </Modal>
  )
}
```

### Step 2: Add weekly reset button to SettingsPage

```tsx
// src/pages/SettingsPage.tsx
import { useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { ChildList } from '../features/children/components/ChildList'
import { ChoreListForChild } from '../features/chores/components/ChoreListForChild'
import { WeeklyResetModal } from '../features/ledger/components/WeeklyResetModal'
import { Button } from '../components/ui/Button'
import { useChildrenStore } from '../features/children/store'

export function SettingsPage() {
  const children = useChildrenStore((s) => s.children)
  const [resetOpen, setResetOpen] = useState(false)

  return (
    <main>
      <PageHeader title="Settings" />
      <div className="p-4 flex flex-col gap-6">
        <ChildList />
        {children.map((child) => (
          <ChoreListForChild key={child.id} child={child} />
        ))}

        <section>
          <h2 className="font-display text-lg text-brand-navy mb-3">Week management</h2>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setResetOpen(true)}
          >
            🔄 Reset week
          </Button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Posts allowance earnings and clears all chore completions.
          </p>
        </section>
      </div>

      <WeeklyResetModal open={resetOpen} onClose={() => setResetOpen(false)} />
    </main>
  )
}
```

### Step 3: Verify end-to-end

```bash
npm run dev
```

1. Add a child with weekly allowance.
2. Add 2 allowance chores, mark 1 complete.
3. Go to Settings → Reset week → confirm → verify ledger has 50% of allowance posted.
4. Verify both chores reset to incomplete.

### Step 4: Commit

```bash
git add src/
git commit -m "feat: weekly reset modal with allowance summary (BR-05, BR-10)"
```

---

## Task 14: PWA Polish & Production Build

**Files:**
- Create: `public/icon-192.png` (final art)
- Create: `public/icon-512.png` (final art)
- Modify: `index.html`

### Step 1: Add meta tags to index.html

```html
<!-- Add inside <head> -->
<meta name="theme-color" content="#1B5FA8">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Dollarbucks">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="apple-touch-icon" href="/icon-192.png">
```

### Step 2: Production build

```bash
npm run build
```

Expected: `dist/` folder created, no TypeScript errors, no build errors.

### Step 3: Preview the production build

```bash
npm run preview
```

Navigate to the preview URL. Open DevTools → Application → Service Workers — verify SW is registered.

### Step 4: Lighthouse PWA check (optional, manual)

In Chrome DevTools → Lighthouse → PWA category. Expected: installable, has manifest, has service worker.

### Step 5: Final commit

```bash
git add .
git commit -m "feat: PWA meta tags and production build verified"
```

---

## Task 15: Run Full Test Suite

### Step 1: Run all tests

```bash
npx vitest run
```

Expected: All tests pass with no errors.

### Step 2: Type check

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

### Step 3: Final commit if any fixes needed

```bash
git add src/
git commit -m "fix: resolve any remaining type errors"
```

---

## Acceptance Criteria Checklist

| Criterion | How to verify |
|---|---|
| Add child | Settings → Add → appears on Home with avatar |
| Add chore (fixed) | Settings → child chores → add → appears in Child Detail |
| Add chore (allowance) | Same as above with allowance scheme |
| Complete fixed chore | Tap chore → ledger entry posted immediately, balance updates |
| Unmark fixed chore | Tap again → ledger entry reversed, balance decreases |
| Complete allowance chore | Tap → progress bar updates, no ledger entry |
| Weekly reset | Settings → Reset week → allowance posted, chores cleared |
| Withdrawal | Child Detail → Withdraw → negative ledger entry, balance correct |
| Overdraft warning | Withdraw more than balance → amber warning appears |
| Ledger history | Child Detail → View history → entries newest-first with running balance |
| Balance always visible | Child cards on Home, balance card on Child Detail |
| PWA install | Chrome → Install app → works offline |
| Delete child → deletes history | Settings → Remove child → confirming deletes all related data |
