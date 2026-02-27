# Do-Not-Break List

This file lists everything that MUST continue to work after any change.
Run the CI checks and manually test these before merging.

---

## 🎮 Games (never change their rules/logic)

| Route | Game | Core mechanic |
|---|---|---|
| `/alphabet` | AlphabetPage | Click letter → hear pronunciation |
| `/words` | WordsPage | Category browsing + word flip cards |
| `/quiz` | QuizPage | 4-option multiple-choice quiz |
| `/memory` | MemoryGame | Flip-pair matching |
| `/spelling` | SpellingBee | Hear word → arrange letters |
| `/scramble` | WordScramble | Unscramble scrambled word |
| `/hangman` | HangmanGame | Letter-by-letter word guessing |
| `/pattern` | PatternPuzzle | Complete the pattern sequence |
| `/levels` | LevelsPage | Level/stage selection map |

---

## 🌐 i18n

- Language switcher must work at any point without page reload
- RTL layout must apply correctly for Hebrew and Arabic
- All game text must respond to language change
- Language preference must persist across sessions (localStorage `app-lang`)

---

## 🏅 Progress & Persistence

- Stars earned persist in localStorage (`stage-{id}`)
- XP and streak persist in localStorage (`xp-data`)
- Achievements unlock correctly
- Daily challenge resets daily

---

## 🎨 Theme / Design

- Light / dark mode switching must work
- CSS custom properties (`--primary`, `--background`, etc.) must remain intact
- Tailwind classes must compile without error

---

## 📱 PWA

- `vite-plugin-pwa` generates valid service worker
- App installable on mobile
- Offline mode shows correct fallback

---

## 🔊 Audio

- Letter pronunciation via Web Speech API continues to work
- Sound effects (`playClickSound`, `playSuccessSound`, etc.) do not throw

---

## 🔒 Child Safety

- No external links added
- No analytics or ad scripts added
- Parental gate guards Settings/Purchase flows

---

## ⚡ Performance Budgets

| Metric | Budget |
|---|---|
| JS bundle (gzip) | < 500 KB |
| FCP (mobile mid) | < 2.5 s |
| Character canvas FPS | ≥ 30 fps (target 60) |

---

## 🧪 Tests

- `src/test/example.test.ts` must pass
- Any new test added must pass in CI
- Build (`npm run build`) must succeed with no errors
- Lint (`npm run lint`) must pass with no errors
