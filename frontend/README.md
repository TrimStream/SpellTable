# TrainingArk

An interactive cEDH training simulator. Study real game positions, make decisions, and learn the correct lines - for free.

**Live:** https://trainingark.vercel.app

---

## What is cEDH?

Competitive Commander (cEDH) is Magic: The Gathering's Commander format played at its highest power level. Every deck is optimized to win as fast as possible, typically through infinite combos, heavy interaction, and relentless resource denial. Games often end on turns 3-5.

Getting better at cEDH through tournament play is expensive. Entry fees, travel, time - and most of what you learn comes from losing without fully understanding why. TrainingArk is the free alternative.

---

## What TrainingArk Does

- Presents a complete 4-player game state with real card images pulled from the Scryfall API
- Asks you to make a decision: when to interact, when to go for the win, when to hold up mana
- Tells you if you got it right and explains the correct line
- Organizes scenarios by difficulty: Beginner, Intermediate, Expert
- Takes a short quiz to find your level and recommends where to start

---

## Tech Stack

**Frontend**
- React 18, TypeScript, Vite
- React Router v7
- CSS Modules

**Backend**
- Python FastAPI
- Uvicorn

**Data**
- Scryfall API (card images and oracle text, free, no auth required)
- Local JSON scenario files (moving to MongoDB in V3)

**Deployment**
- Vercel (frontend)
- Render (backend)

---

## Project Structure

```
spelltable/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── layouts/        # Shared nav/footer wrapper
│   │   ├── context/        # Theme context
│   │   ├── hooks/          # useScenario data loading hook
│   │   ├── api/            # Scryfall API client
│   │   ├── data/           # Scenario JSON files and quiz data
│   │   └── types/          # TypeScript interfaces
│   ├── public/             # Static assets (favicon)
│   └── index.html
└── backend/
    ├── main.py             # FastAPI app
    └── requirements.txt
```

---

## Running Locally

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Runs at http://localhost:5173

**Backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Runs at http://localhost:8000

---

## How Scenarios Work

Scenarios are stored as JSON files in `frontend/src/data/scenarios/`. Each file defines the full board state for all 4 players across all zones, plus the question, options, and correct answer.

Card images are not stored in the JSON. Only Scryfall UUIDs are stored. The `useScenario` hook fetches all card images from Scryfall at runtime when a scenario loads.

To add a new scenario:
1. Create a new JSON file in `src/data/scenarios/` following the existing format
2. Add a metadata entry to `src/data/scenarios-index.json`
3. Navigate to `/board/your-scenario-id` to test it

A visual scenario builder is planned for V6.

---

## Skill Level System

The quiz on the homepage determines a player's skill level based on Magic experience, cEDH experience, and tournament results. Results are stored in localStorage.

- **Beginner** (0-4 pts): New to cEDH or Magic
- **Intermediate** (5-9 pts): Experienced player with some cEDH tournament history
- **Expert** (10+ pts): Multiple tournament top cuts or wins

Difficulty gating (locking intermediate/expert scenarios for beginners) is stubbed in the code and will be wired to user accounts in V4.

---

## Roadmap

| Version | Status | Description |
|---|---|---|
| V1 | Complete | Interactive scenario board |
| V2 | Complete | Full website with navigation, quiz, homepage |
| V3 | Planned | MongoDB backend, scenarios served from database |
| V4 | Planned | Login, user accounts, difficulty gating |
| V5 | Planned | Visual stack zone on the board |
| V6 | Planned | Scenario builder UI |
| V7 | Planned | AI answer evaluation with Gemini |
| V8 | Planned | Community scenario submissions |
| V9 | Planned | Moxfield deck import |
| V10 | Planned | Mobile support |
| V11 | Planned | SEO and Open Graph |
| V12 | Planned | Accessibility (WCAG 2.1 AA) |
| V13 | Planned | Real-time multiplayer |

---

## Resources

- [topdeck.gg](https://topdeck.gg) - cEDH tournament results
- [cedhstats.org](https://cedhstats.org) - cEDH statistics and meta
- [Moxfield](https://moxfield.com) - deck building
- [Archidekt](https://archidekt.com) - deck building
- [Magic: The Gathering](https://magic.wizards.com/en) - official MTG site

---

## Author

Built by Eshaan Singh.

Find me on Moxfield: [TrimStream](https://moxfield.com/users/TrimStream)

---

## License

Open source. 

Not affiliated with Wizards of the Coast. 

Card images and data provided by [Scryfall](https://scryfall.com).