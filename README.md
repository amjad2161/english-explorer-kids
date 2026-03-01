# English Explorer Kids 🦉

An interactive English learning platform for kids, featuring games, quizzes, spelling challenges, and more. Supports Hebrew, Arabic, and English.

[![CI](https://github.com/amjad2161/english-explorer-kids/actions/workflows/ci.yml/badge.svg)](https://github.com/amjad2161/english-explorer-kids/actions/workflows/ci.yml)

🌐 **Live site:** https://amjad2161.github.io/english-explorer-kids/

---

## Local Development

**Prerequisites:** Node.js (LTS) and npm

```sh
# 1. Clone the repository
git clone https://github.com/amjad2161/english-explorer-kids.git
cd english-explorer-kids

# 2. Install dependencies
npm ci

# 3. Start the development server (hot-reload on http://localhost:8080)
npm run dev
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server on port 8080 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across all source files |
| `npm test` | Run Vitest unit tests (single run) |
| `npm run test:watch` | Run Vitest in watch mode |

## CI / CD

- **CI** runs on every push and pull request: lint → test → build (see `.github/workflows/ci.yml`).
- **GitHub Pages** is deployed automatically on every push to `main` (see `.github/workflows/pages.yml`).

## Tech Stack

- [Vite 5](https://vitejs.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- [React 18](https://react.dev/) + [Tailwind CSS 3](https://tailwindcss.com/)
- [React Router v6](https://reactrouter.com/)
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Vitest](https://vitest.dev/) + [@testing-library/react](https://testing-library.com/) for tests
- [shadcn/ui](https://ui.shadcn.com/) component library
- PWA support via [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)

## Open PR Status (PRs #3–#8)

| PR | Title | Recommendation |
|---|---|---|
| [#3](https://github.com/amjad2161/english-explorer-kids/pull/3) | Visual overhaul | Review and merge after CI passes |
| [#4](https://github.com/amjad2161/english-explorer-kids/pull/4) | SVG mascot (Professor Owl) | **Merge** — preferred over 3D for performance |
| [#5](https://github.com/amjad2161/english-explorer-kids/pull/5) | Lint fixes, package rename, unit tests | **Merge** — foundational quality improvements |
| [#6](https://github.com/amjad2161/english-explorer-kids/pull/6) | 3D mascot (three.js) | **Close** — superseded by SVG approach in PR #4 |
| [#7](https://github.com/amjad2161/english-explorer-kids/pull/7) | Production upgrade | Review and merge after conflicts resolved |
| [#8](https://github.com/amjad2161/english-explorer-kids/pull/8) | Foundational engines | Review and merge after conflicts resolved |