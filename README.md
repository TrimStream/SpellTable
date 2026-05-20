# SpellTable

Interactive cEDH training simulator. Players are presented with real game scenarios on a 4-player board and asked to make decisions. The AI evaluates their reasoning and explains the correct line.

---

## Tech Stack

- **Frontend:** React 18, TypeScript, CSS Modules
- **Backend:** Python, FastAPI
- **Card data:** Scryfall API
- **Testing:** Vitest, React Testing Library
- **Deployment:** Vercel (frontend), Render (backend)

---

## V1 Goals

- 4-player interactive board with real card images from Scryfall
- Click/hover cards to inspect oracle text and details
- Keyboard navigation and screen reader support
- 3-5 hand-written cEDH scenarios
- Scenario panel with question and answer input

---

## Running Locally

**Prerequisites:** Node 18+, Python 3.11+

```bash
git clone https://github.com/TrimStream/SpellTable.git
cd spelltable

# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload
```

Frontend: `http://localhost:5173` — Backend: `http://localhost:8000`

---

## License

MIT
