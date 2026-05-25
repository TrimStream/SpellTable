# TrainingArk

> A free, interactive training simulator for competitive Commander (cEDH).

**Live site:** https://trainingark.vercel.app

---

## What is this?

TrainingArk presents real 4-player cEDH game states and asks you to make decisions. You see every card on the board, hover to preview, click for full oracle text, then choose your line. The site tells you if you got it right and explains why.

It exists because getting better at cEDH through tournament play is expensive. Entry fees, travel, and time - and most of what you learn comes from losing without understanding why. TrainingArk is the free alternative.

---

## Repository Structure

```
trainingark/
├── frontend/           # React 18 + TypeScript + Vite
└── backend/            # Python FastAPI
```

This is a monorepo. Frontend and backend are deployed independently - Vercel for the frontend, Render for the backend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, CSS Modules |
| Routing | React Router v7 |
| Backend | Python FastAPI, Uvicorn |
| Card data | Scryfall API (free, no auth) |
| Database | MongoDB Atlas (V3+) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Running Locally

**Prerequisites:** Node 20+, Python 3.14+

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

Scenarios are JSON files in `frontend/src/data/scenarios/`. Each file defines the complete board state for all 4 players across every zone, plus the question, answer options, and correct answer.

Card images are not stored in JSON. Only Scryfall UUIDs are stored. The `useScenario` hook fetches all card images from the Scryfall API at runtime when a scenario loads.

A lightweight `scenarios-index.json` stores only the metadata (title, description, difficulty, tags) needed to render the scenario browser. The full board state is only loaded when a user navigates to a specific board.

---

## Skill Level System

A 5-question quiz on the homepage determines a player's skill level based on Magic experience, cEDH experience, and tournament results. Results are stored in `localStorage` under `tark_skill_level`.

| Score | Level |
|---|---|
| 0-4 | Beginner |
| 5-9 | Intermediate |
| 10+ | Expert |

Difficulty gating (locking harder scenarios) is stubbed in the codebase and will be wired to user accounts in V4.

---

## Roadmap

| Version | Status | Description |
|---|---|---|
| V1 | Complete | Interactive scenario board with Scryfall card images |
| V2 | Complete | Full website: nav, homepage, quiz, scenarios browser, about |
| V3 | Next | MongoDB Atlas backend, scenarios served from API |
| V4 | Planned | Login, user accounts, difficulty gating, cedhstats/topdeck import |
| V5 | Planned | Visual stack zone on the board |
| V6 | Planned | Scenario builder UI |
| V7 | Planned | AI answer evaluation with Gemini |
| V8 | Planned | Community scenario submissions and ratings |
| V9 | Planned | Moxfield deck import |
| V10 | Planned | Mobile support |
| V11 | Planned | SEO and Open Graph previews |
| V12 | Planned | Accessibility (WCAG 2.1 AA) |
| V13 | Planned | Real-time multiplayer |

---

## Deployment

**Frontend** is deployed on Vercel. Connected to the `main` branch, auto-deploys on push.

**Backend** is deployed on Render. Connected to the `main` branch, auto-deploys on push. Free tier spins down after inactivity - cold starts can take 30-60 seconds.

**Database** will be MongoDB Atlas M0 (free tier, 512MB) starting in V3.

---

## Resources Used

- [Scryfall API](https://scryfall.com/docs/api) - card images, oracle text, rulings
- [topdeck.gg](https://topdeck.gg) - cEDH tournament data
- [cedhstats.org](https://cedhstats.org) - cEDH statistics
- [Moxfield](https://moxfield.com) - deck building
- [Archidekt](https://archidekt.com) - deck building
- [Magic: The Gathering](https://magic.wizards.com/en) - official rules

---

## Author

Built by Eshaan Singh.

- Moxfield: [TrimStream](https://moxfield.com/users/TrimStream)
- GitHub: [TrimStream](https://github.com/TrimStream)

---

## Legal

Open source and non-commercial. Not affiliated with Wizards of the Coast. Card images and data are provided by [Scryfall](https://scryfall.com) under their terms of service.