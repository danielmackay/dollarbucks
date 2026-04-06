# Version Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the app version at the bottom of the Settings page, with a tap-to-reveal debug panel showing build metadata.

**Architecture:** Inject four build-time globals into the bundle via `vite.config.ts` `define`. Declare them in `vite-env.d.ts` for TypeScript. Add a version footer to `SettingsPage` with a `showDebug` toggle.

**Tech Stack:** Vite `define`, TypeScript ambient declarations, React `useState`, Tailwind CSS.

---

## Files

| File | Change |
|---|---|
| `vite.config.ts` | Add `define` block with 4 build-time globals |
| `src/vite-env.d.ts` | Add `declare const` for the 4 globals |
| `src/pages/SettingsPage.tsx` | Add `showDebug` state + version footer JSX |

---

### Task 1: Inject build-time globals in Vite config

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Add imports and define block**

Replace the top of `vite.config.ts` with the following. The `execSync` calls run at config-load time (Node.js), so the values are baked into the bundle — they are not evaluated in the browser.

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { execSync } from 'child_process'

function getGitCommit(short: boolean): string {
  try {
    return execSync(short ? 'git rev-parse --short HEAD' : 'git rev-parse HEAD')
      .toString()
      .trim()
  } catch {
    return 'dev'
  }
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
    __GIT_COMMIT_SHORT__: JSON.stringify(getGitCommit(true)),
    __GIT_COMMIT_FULL__: JSON.stringify(getGitCommit(false)),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // ... rest unchanged
```

The full file after the change:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { execSync } from 'child_process'

function getGitCommit(short: boolean): string {
  try {
    return execSync(short ? 'git rev-parse --short HEAD' : 'git rev-parse HEAD')
      .toString()
      .trim()
  } catch {
    return 'dev'
  }
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
    __GIT_COMMIT_SHORT__: JSON.stringify(getGitCommit(true)),
    __GIT_COMMIT_FULL__: JSON.stringify(getGitCommit(false)),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
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
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
})
```

- [ ] **Step 2: Verify the build still compiles**

```bash
bun run build
```

Expected: exits 0, no TypeScript errors. (The globals won't resolve in TS yet — that's fixed in Task 2.)

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "build: inject version and git commit globals via vite define"
```

---

### Task 2: Declare globals in TypeScript

**Files:**
- Modify: `src/vite-env.d.ts`

- [ ] **Step 1: Add declare const entries**

Append to `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

declare const __APP_VERSION__: string
declare const __GIT_COMMIT_SHORT__: string
declare const __GIT_COMMIT_FULL__: string
declare const __BUILD_DATE__: string
```

- [ ] **Step 2: Verify type-check passes**

```bash
bun run build
```

Expected: exits 0, no "Cannot find name '__APP_VERSION__'" errors.

- [ ] **Step 3: Commit**

```bash
git add src/vite-env.d.ts
git commit -m "types: declare vite define globals for version and build metadata"
```

---

### Task 3: Add version footer to SettingsPage

**Files:**
- Modify: `src/pages/SettingsPage.tsx`

- [ ] **Step 1: Add showDebug state**

In `SettingsPage`, the existing state block is:

```typescript
const [resetOpen, setResetOpen] = useState(false)
const [nukeOpen, setNukeOpen] = useState(false)
```

Add one more line:

```typescript
const [resetOpen, setResetOpen] = useState(false)
const [nukeOpen, setNukeOpen] = useState(false)
const [showDebug, setShowDebug] = useState(false)
```

- [ ] **Step 2: Add the version footer JSX**

Inside the `<div className="px-4 mt-5 flex flex-col gap-6 pb-10">` scroll container, after the closing `</section>` of the Danger Zone section and before the closing `</div>`, add:

```tsx
{/* ── Version footer ── */}
<div
  className="text-xs text-gray-400 text-center cursor-pointer select-none pt-2"
  onClick={() => setShowDebug((v) => !v)}
>
  <span>v{__APP_VERSION__}</span>
  {showDebug && (
    <div className="mt-2 space-y-0.5 font-mono">
      <div>Hash: {__GIT_COMMIT_SHORT__}</div>
      <div className="break-all">Commit: {__GIT_COMMIT_FULL__}</div>
      <div>Built: {new Date(__BUILD_DATE__).toLocaleString()}</div>
      <div>Env: {import.meta.env.MODE}</div>
    </div>
  )}
</div>
```

- [ ] **Step 3: Run the build to confirm no type errors**

```bash
bun run build
```

Expected: exits 0.

- [ ] **Step 4: Smoke test in dev server**

```bash
bun dev
```

Open http://localhost:5173, navigate to Settings. Confirm:
- `v0.0.0` appears at the bottom (or whatever version is in `package.json`)
- Tapping it reveals Hash / Commit / Built / Env lines
- Tapping again collapses them

- [ ] **Step 5: Commit**

```bash
git add src/pages/SettingsPage.tsx
git commit -m "feat: add version footer with tap-to-reveal debug info to Settings page"
```
