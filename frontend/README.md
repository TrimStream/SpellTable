# TrainingArk - Frontend

The React frontend for TrainingArk, a cEDH training simulator.

**Live:** https://trainingark.vercel.app  
**Stack:** React 18, TypeScript, Vite, CSS Modules, React Router v7

---

## Getting Started

```bash
npm install
npm run dev
```

Runs at http://localhost:5173. The backend must be running separately at http://localhost:8000 for scenario data (V3+). In V1/V2, scenario data is loaded from local JSON files and no backend connection is required.

```bash
npm run build       # Production build
npm run preview     # Preview production build locally
```

---

## Project Structure

```
src/
├── components/             # Reusable UI components
│   ├── Board/              # 4-player board layout (2x2 grid)
│   ├── Battlefield/        # Card sections within a playmat
│   ├── Card/               # Single card with hover preview portal
│   ├── CardModal/          # Full card detail modal (fetches from Scryfall)
│   ├── CardZone/           # Zone wrapper for hand and command zones
│   ├── ErrorBoundary/      # React class component catching runtime errors
│   ├── Footer/             # Site footer with resource links
│   ├── LoadingScreen/      # Full screen pulsing TARK logo
│   ├── PlayerZone/         # Individual player playmat with all zones
│   ├── ScenarioPanel/      # Question, answer options, feedback
│   ├── TarkLogo/           # Reusable inline SVG logo (4 sizes)
│   ├── QuizModal/          # Skill level quiz modal
│   └── ZoneModal/          # Expanded graveyard/exile view
│
├── pages/                  # Route-level components
│   ├── Home/               # Homepage with hero and quiz CTA
│   ├── Scenarios/          # Scenario browser with difficulty filter
│   ├── BoardPage/          # Board wrapper with dynamic scenario loading
│   ├── About/              # About the project and author
│   ├── Rules/              # Rules reference (stub, V3+)
│   ├── Tutorial/           # Tutorial (stub, V3+)
│   └── NotFound/           # 404 page
│
├── layouts/
│   └── Layout/             # Sticky nav + footer wrapper for all non-board pages
│
├── context/
│   └── ThemeContext.tsx    # Dark/light mode state, localStorage persistence
│
├── hooks/
│   └── useScenario.ts      # Fetches all card images from Scryfall for a scenario
│
├── api/
│   └── scryfall.ts         # Scryfall API client (fetch card by UUID)
│
├── data/
│   ├── scenarios/          # Full scenario JSON files (board state + question)
│   ├── scenarios-index.json # Lightweight metadata for the scenario browser
│   └── quiz.ts             # Quiz questions, scoring logic, skill level descriptions
│
└── types/
    ├── index.ts            # Card, Zone, Player, Scenario interfaces
    └── scenario.ts         # ScenarioMeta, Difficulty types
```

---

## Routing

Built with React Router v7's `createBrowserRouter`.

| Route | Component | Notes |
|---|---|---|
| `/` | `Home` | Homepage |
| `/scenarios` | `Scenarios` | Scenario browser |
| `/board/:id` | `BoardPage` | Board, lives outside Layout (no nav) |
| `/about` | `About` | About page |
| `/rules` | `Rules` | Rules reference stub |
| `/tutorial` | `Tutorial` | Tutorial stub |
| `*` | `NotFound` | 404 catch-all |

The board route is a sibling of the Layout route, not a child. This means `/board/:id` renders with no nav bar and no footer - the board gets the full screen.

---

## Key Concepts

### Dynamic Scenario Loading

BoardPage uses a dynamic `import()` to load the correct scenario JSON at runtime based on the `:id` URL param. This is different from the static import used in V1, which hardcoded one scenario at build time.

```typescript
import(`../../data/scenarios/${id}.json`)
  .then(module => setScenario(module.default as Scenario))
  .catch(() => setError(`Scenario "${id}" not found.`));
```

Vite bundles all JSON files in that directory at build time so they are available for dynamic import at runtime.

### Scryfall Image Fetching

Scenario JSON files store only Scryfall UUIDs, not image URLs. The `useScenario` hook fetches all card images at runtime:

1. Collects all card IDs from all 4 players across all 6 zones
2. Deduplicates with a Set (same card on multiple boards fetched once)
3. Skips tokens - tokens use hardcoded `imageUrl` from JSON because they are not standard Scryfall entries
4. Fetches all remaining cards in parallel with `Promise.all`
5. Restores `tapped` state after fetch - Scryfall does not know about game state

### Theme System

Theme state lives in `ThemeContext`. Priority order:

1. Saved preference in `localStorage` (key: `tark_theme`)
2. OS preference via `window.matchMedia('(prefers-color-scheme: dark)')`
3. Default: dark

When theme changes, `data-theme="dark"` or `data-theme="light"` is written to the `<html>` element. CSS variables switch via the `[data-theme='light']` selector in `index.css`.

All components use `var(--bg)`, `var(--text)`, etc. and automatically pick up the correct color.

### TarkLogo Component

The logo is an inline SVG React component. It must be inline (not loaded as an `<img>`) because:
- The ARK text uses Rajdhani font which is loaded by the page, not the SVG file
- `var(--text)` CSS variable only resolves when the SVG is part of the DOM

Four sizes available via the `size` prop: `small`, `nav`, `hero`, `loading`.

---

## CSS Architecture

All styles use CSS Modules. No global class names except for the design tokens in `index.css`.

**Design tokens (index.css):**
```css
:root {
  --bg: #0f0f13;
  --bg-secondary: #13131a;
  --bg-card: #1a1a24;
  --text: #e8e0d4;
  --text-muted: rgba(232, 224, 212, 0.45);
  --text-disabled: rgba(232, 224, 212, 0.2);
  --border: rgba(255, 255, 255, 0.07);
  --gold: #c9a84c;
  --gold-bright: #e8c96a;
  --gold-dark: #8b6914;
  --diff-beginner: #5ecb82;
  --diff-intermediate: #c9a84c;
  --diff-expert: #e07070;
  --font-sans: system-ui, 'Segoe UI', Roboto, sans-serif;
  --font-display: 'Rajdhani', sans-serif;
}
```

Gold and difficulty colors are the same in dark and light mode. Only backgrounds, text, and borders flip.

---

## Skill Level System

The quiz produces one of three values stored in `localStorage`:

```typescript
type SkillLevel = 'beginner' | 'intermediate' | 'expert';
```

This type is the shared contract between the quiz, the scenarios page, and the eventual user account system in V4. All three systems write and read the same three values.

Difficulty gating logic is written and commented out in `Scenarios.tsx`:

```typescript
// TODO V4: Uncomment when auth is implemented
// function isLocked(difficulty: Difficulty): boolean {
//   if (!_skillLevel) return false;
//   if (_skillLevel === 'beginner') return difficulty !== 'beginner';
//   if (_skillLevel === 'intermediate') return difficulty === 'expert';
//   return false;
// }
```

V4 will wire this to the user account instead of localStorage.

---

## TypeScript

Strict mode is enabled. The build will fail on unused variables, which is intentional - it catches dead code before it reaches production.

Key interfaces:

```typescript
interface Card {
  id: string;           // Scryfall UUID
  name: string;
  imageUrl?: string;    // Fetched at runtime, hardcoded for tokens
  tapped?: boolean;
  cardType: 'creature' | 'artifact' | 'enchantment' | 'planeswalker' | 'land' | 'instant' | 'sorcery' | 'battle';
  isToken?: boolean;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  players: [Player, Player, Player, Player];
  question: string;
  options?: string[];
  correctAnswer: string;
}

type Difficulty = 'beginner' | 'intermediate' | 'expert';
```

---

## Adding a Scenario

1. Find the Scryfall UUID for every card you want in the scenario at `scryfall.com`
2. Create `src/data/scenarios/scenario-XX.json` following the structure of `scenario-01.json`
3. Add an entry to `src/data/scenarios-index.json` with the metadata
4. Test at `localhost:5173/board/scenario-XX`

Token cards need `isToken: true` and a hardcoded `imageUrl` because tokens are not standard single-faced Scryfall entries. For multiple tokens of the same type, append `-2`, `-3` etc to the id to keep React keys unique.

A visual scenario builder is planned for V6 that removes the need to write JSON manually.

---

## Deployment

Deployed on Vercel. Connected to the `main` branch, auto-deploys on every push.

- Root directory: `frontend`
- Build command: `npm run build` (auto-detected)
- Output directory: `dist` (auto-detected)

Environment variables: none required in V1/V2. V3 will add `VITE_API_URL` pointing to the backend.

---

## Known Issues and TODOs

| Location | TODO |
|---|---|
| `Layout.tsx` | TODO V4: Uncomment login button when auth is implemented |
| `Scenarios.tsx` | TODO V4: Wire isLocked to user account skill level |
| `ThemeContext.tsx` | TODO V4: Migrate tark_skill_level and tark_archetype to user account on signup |
| `Footer.tsx` | TODO Discord: Add Discord server link when server is created |
| `App.tsx` | TODO V?: Add deck route when deck evaluation page is built |