# English Explorer Kids — Architecture Map

## Stack Overview

| Layer | Technology |
|---|---|
| Build | Vite 5 + TypeScript 5 |
| UI | React 18 + Tailwind CSS 3 |
| Routing | React Router v6 |
| Animations | Framer Motion 12 |
| 3D Characters | three.js + @react-three/fiber + @react-three/drei |
| State | Zustand (character store) + localStorage (persistence) |
| i18n | Custom context (`src/lib/i18n.tsx`) — EN / HE / AR |
| Data fetching | @tanstack/react-query |
| Testing | Vitest + @testing-library/react |
| PWA | vite-plugin-pwa |

---

## Directory Structure

```
src/
├── assets/           PNG sprites (legacy, being phased out for <img> characters)
├── components/
│   ├── character/    3D character system (Canvas, ProxyCharacter, CharacterCanvas)
│   ├── ui/           shadcn/ui primitives
│   └── *.tsx         Feature components (GameShell, AppHeader, …)
├── data/
│   └── learningData.ts   Alphabet / words / quiz question data
├── hooks/            Custom React hooks
├── lib/
│   ├── i18n.tsx         Language context + translations
│   ├── characterStore.ts Zustand store + dispatchCharacterEvent API
│   ├── learningPath.ts   Learning Path Engine v1
│   ├── storyEngine.ts    Story Engine v1
│   ├── levels.ts         Level / stage definitions
│   ├── progress.ts       Progress persistence helpers
│   ├── achievements.ts   Achievement definitions + unlock logic
│   ├── xp.ts             XP + streak system
│   ├── sounds.ts         Audio helpers
│   └── …
├── pages/            Route-level page components (one per route)
└── test/             Vitest test files
```

---

## Character Runtime Architecture

All character rendering uses real-time 3D via `@react-three/fiber`. There are **no `<img>` elements for characters**.

```
App.tsx
  └── CharacterCanvas (root-mounted, single Canvas per component, no remount on nav)
        └── Suspense
              ├── GlbCharacter  ← preferred (rigged .glb asset)
              └── ProxyCharacter ← fallback when GLB is missing
                    logs console.error("MISSING_CHARACTER_ASSET")
```

Character events flow through Zustand:
```
Game/Page → dispatchCharacterEvent({ type, payload })
                       ↓
          characterStore (Zustand)
                       ↓
          CharacterCanvas → updates animation
```

### Supported event types
- `idle` — default resting animation
- `talk` — speaking animation
- `react` — quick reaction (correct / wrong)
- `celebrate` — level-up / win
- `point` — pointing gesture
- `think` — pondering pose
- `wave` — greeting

---

## i18n Architecture

Runtime language switching with no page reload. All UI strings live in `src/lib/i18n.tsx`.

Supported languages: **English (LTR)**, **Hebrew (RTL)**, **Arabic (RTL)**.

RTL mirroring is applied at the root `<div dir={dir}>` level.

---

## Learning Path Engine

`src/lib/learningPath.ts` provides:
- Age-bucketed progression (0–4, 5–7, 8–10, 11–14)
- Prerequisite graph
- Spaced-repetition scheduling
- Session plan generation (returns ordered array of `SessionActivity`)
- Remediation paths for struggling learners

---

## Story Engine

`src/lib/storyEngine.ts` provides:
- Deterministic template-based micro-stories
- Trilingual output (en / he / ar)
- Safe content rules (no violence, no dark themes)
- Embedded learning activities: pick / match / spell / build-sentence

---

## Data Flow

```
localStorage ←→ progress.ts / xp.ts / learningPath.ts
                           ↓
                     React state
                           ↓
                      UI components
```

All user data is local-first. No external data collection.

---

## Performance Strategy

- Code-split by route (React.lazy + Suspense)
- Three.js canvas uses `dpr={[1, 2]}` + `performance.current` adaptive quality
- Heavy components wrapped in `ErrorBoundary`
- PWA caches assets for offline use

---

## Child Safety Guarantees

- No ads, no tracking scripts, no external links
- Parental gate (PIN dialog) guards Settings → Purchases
- All content is in-app; no network calls to external APIs
