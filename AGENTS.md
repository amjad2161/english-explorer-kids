# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

English Explorer Kids (**English Fun**) is a single **Vite + React + TypeScript** SPA. There is **no backend**, database, or `.env` file. Progress is stored in **browser `localStorage`**.

### Required service (E2E)

| Service | Command | URL |
|---------|---------|-----|
| Vite dev server | `npm run dev` | http://localhost:8080 |

No Docker, no auxiliary services.

### Standard commands

See `README.md` and `package.json`. CI parity:

```bash
npm ci
npm run lint    # ESLint warnings only (0 errors)
npm test        # Vitest, 36 tests
npm run build   # outputs to dist/
npm run dev     # port 8080, binds 0.0.0.0
```

Production preview: `npm run build && npm run preview` (default port **4173**).

### Dev server notes

- Vite is configured with `host: "::"` and **port 8080** (`vite.config.ts`).
- `waitUntil: 'networkidle'` is unreliable in Playwright/automation because HMR/WebSocket keeps the page active; prefer `domcontentloaded`.
- Game pages show a **~1.2s `GameEntrance` splash** before interactive UI; wait ~2s before clicking quiz options.

### Onboarding bypass (automated testing)

First visit shows `WelcomeScreen` until `localStorage` key `english-fun-onboarded` is `"true"`. For headless demos, set that key (and optionally `english-fun-lang` to `en`) via `page.addInitScript` before navigation.

### Hello-world smoke test

1. Start dev server: `npm run dev`
2. Open http://localhost:8080/quiz (after onboarding or with localStorage preset)
3. Click any answer option — expect ✅/❌ feedback, score/streak UI, and owl mascot reaction

### Lint / test caveats

- ESLint reports **warnings only** (react-hooks/exhaustive-deps, react-refresh/only-export-components); CI passes with warnings.
- No dedicated `tsc` script; type-checking is via Vite/ESLint toolchain.
