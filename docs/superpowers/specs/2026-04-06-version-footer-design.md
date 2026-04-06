# Version Footer — Design Spec

**Date:** 2026-04-06
**Feature:** Display app version at the bottom of the Settings page with tap-to-reveal debug info.

---

## Overview

Add a subtle version footer to the bottom of `SettingsPage`. By default it shows only the semver. Tapping it toggles an expanded debug panel showing build metadata. No new components, no new stores — self-contained within `SettingsPage`.

---

## Build-time Data Injection

Four `define` entries are added to `vite.config.ts`, baked into the bundle at build time:

| Global | Source | Example |
|---|---|---|
| `__APP_VERSION__` | `package.json` `.version` | `"1.0.0"` |
| `__GIT_COMMIT_SHORT__` | `git rev-parse --short HEAD` | `"abc1234"` |
| `__GIT_COMMIT_FULL__` | `git rev-parse HEAD` | `"abc1234f9e2d..."` |
| `__BUILD_DATE__` | `new Date().toISOString()` at build time | `"2026-04-06T14:32:00.000Z"` |

`import.meta.env.MODE` is used for the env label (already provided by Vite, no define needed).

Git commands fall back to `"dev"` if they fail (e.g. in CI environments without git history).

TypeScript ambient declarations for all four globals are added to `src/vite-env.d.ts`.

---

## UI — Collapsed State

Below the Danger Zone section, inside the existing `pb-10` scroll container:

```
v1.0.0
```

- Styling: `text-xs text-gray-400 text-center cursor-pointer select-none`
- No border, no card, no label — quiet footer text only
- Sufficient top margin to breathe below the Danger Zone card (`mt-4` or `mt-6`)

---

## UI — Expanded State

Tapping toggles a `showDebug` boolean via `useState`. When true, a small block appears below the version line:

```
v1.0.0

Hash:    abc1234
Commit:  abc1234f9e2d1b3a4c5d6e7f8a9b0c1d2e3f4a5b
Built:   2026-04-06 14:32
Env:     production
```

- Styling: `text-xs text-gray-400 text-center` throughout, monospace font for hash/commit values
- Label/value pairs are left-aligned within the block, block itself is centered on the page
- Tapping again collapses back to version-only

---

## Implementation Scope

- `vite.config.ts` — add `define` entries
- `src/vite-env.d.ts` — add `declare const` for the four globals
- `src/pages/SettingsPage.tsx` — add `showDebug` state + version footer JSX below the Danger Zone section

No new files, no new components, no new stores.

---

## Out of Scope

- Copy to clipboard on tap
- Navigation or linking from the version footer
- Showing version on any other page
