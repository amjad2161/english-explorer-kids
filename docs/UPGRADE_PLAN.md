# Staged Upgrade Plan

## Phases & Checkpoints

---

### Phase 0 — Audit & Docs ✅
**Goal**: Understand the codebase; establish guardrails.

- [x] Scan all routes, pages, games, assets, state, error handling
- [x] Create `docs/ARCHITECTURE.md`
- [x] Create `docs/DO_NOT_BREAK.md`
- [x] Create `docs/UPGRADE_PLAN.md` (this file)

**Acceptance criteria**: Docs committed; build passes; all existing tests green.

---

### Phase 1 — i18n Foundation ✅ (pre-existing)
**Goal**: Trilingual runtime switching; RTL/LTR mirroring.

- [x] `src/lib/i18n.tsx` — LanguageContext with EN / HE / AR
- [x] Language switcher in AppHeader
- [x] RTL applied at root `<div dir={dir}>`
- [x] All strings externalised for critical pages

**Acceptance criteria**: Instant language switch; RTL correct for HE/AR.

---

### Phase 2 — Design System Tokens ✅ (pre-existing)
**Goal**: Centralised colour, spacing, motion tokens.

- [x] CSS custom properties in `index.css` / `App.css`
- [x] Tailwind config extends with custom colours
- [x] `src/lib/designTokens.ts` — typed JS token exports for three.js materials

---

### Phase 3 — Character Runtime 🔄
**Goal**: Replace all `<img>` characters with real-time 3D.

- [x] Install `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`
- [x] `src/lib/characterStore.ts` — Zustand store + `dispatchCharacterEvent`
- [x] `src/components/character/ProxyCharacter.tsx` — fallback 3D mesh
- [x] `src/components/character/CharacterCanvas.tsx` — Canvas + ErrorBoundary
- [x] `Interactive3DMascot.tsx` — remove `<img>`, use CharacterCanvas
- [x] `LibraryBookworm.tsx` — remove `<img>`, use CharacterCanvas
- [x] `LibraryGuardian.tsx` — remove `<img>`, use CharacterCanvas
- [x] `LibraryMouse.tsx` — remove `<img>`, use CharacterCanvas

**Acceptance criteria**:
- Zero `<img>` elements for characters
- `console.error("MISSING_CHARACTER_ASSET")` fires when no GLB found
- All animations work (idle/wave/celebrate/surprised/sad)

---

### Phase 4 — GameShell Wrapper 🔄
**Goal**: Unified game chrome for all existing games.

- [x] `src/components/GameShell.tsx`
  - Header (title, back button, language)
  - Progress bar
  - Hint button
  - Pause/Quit dialog with parental gate
  - Unified reward event → `dispatchCharacterEvent`

**Acceptance criteria**: All games still function; GameShell wraps without changing game logic.

---

### Phase 5 — Learning Path Engine v1 🔄
**Goal**: Structured progression from zero for ages 0–14.

- [x] `src/lib/learningPath.ts`
  - Age buckets (0–4, 5–7, 8–10, 11–14)
  - Prerequisite graph
  - Spaced-repetition scheduling (simple interval)
  - Session plan generator
  - Remediation path

**Acceptance criteria**: `generateSessionPlan(age, progress)` returns valid ordered activities.

---

### Phase 6 — Story Engine v1 🔄
**Goal**: Deterministic template-based interactive micro-stories.

- [x] `src/lib/storyEngine.ts`
  - Trilingual story templates
  - Safe content rules
  - Embedded activities (pick / match / spell / build-sentence)
- [x] `src/pages/StoryPage.tsx` — story UI with character reactions
- [x] Route `/story` added in `App.tsx`

**Acceptance criteria**: Story renders in all three languages; embedded activities function correctly.

---

### Phase 7 — Performance & Error Hardening 🔄
**Goal**: 60 fps target; graceful degradation.

- [ ] Adaptive quality tiers in CharacterCanvas (`dpr` + `performance`)
- [ ] React.lazy + Suspense for all page routes
- [ ] ErrorBoundary around every 3D canvas
- [ ] Lighthouse CI budget check

---

### Phase 8 — Tests & CI 🔄
**Goal**: Regression protection.

- [x] Unit tests: characterStore, learningPath, storyEngine
- [x] Integration tests: GameShell rendering
- [ ] E2E: Playwright smoke tests (quiz flow, language switch, character events)
- [ ] Visual regression scaffolding
- [ ] CI workflow: `.github/workflows/ci.yml`

---

## Decision Log

| Decision | Rationale |
|---|---|
| Per-component Canvas (not single global) | Simpler integration; `<View>` API complexity deferred to Phase 7 |
| Zustand for character store | Lightweight, no boilerplate, tree-shakeable |
| ProxyCharacter from primitives | No GLB assets in repo; proxy ensures no broken renders |
| Local-first data | Child safety; no external server dependency |
