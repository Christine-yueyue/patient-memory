# AGENTS.md

## Key Commands

**Critical nuance:** Backend must run first, frontend second (reverse breaks everything).

- Install dependencies: `cd frontend && npm install` (backend has pre-set Python environment)
- Start backend: `cd backend && poetry shell` then `python -m src.main`
- Start frontend: `cd frontend && npm run dev`
- Build: `cd frontend && npm run build`
- Type check: `cd frontend && npx tsc --noEmit`
- Lint: `cd frontend && npm run lint`

## Architecture

Two-package setup:
- `frontend/` - React+TypeScript (client-side only)
- `backend/` - Python FastAPI (server-side only)

Request flow: Frontend → WebSocket → Backend → LLMs → LocalStorage

## Data Privacy

All patient data lives in browser LocalStorage only (`continuCareMemory`, `continuCareTimeline`). 
Frontend handles UI + storage, backend handles LLMs + validation. Nothing persists on server.

## Framework Quirks

Zod is typing-only, zero runtime validation.
Dates are Toronto Ontario format (`January 15, 2026`) backend, `Date` objects frontend.
OHIP: Health card regex `\d{10}[A-Za-z]{0,2}`
No test framework - uses Zod's embedded tests

## Critical Files

Frontend: `frontend/src/main.jsx` → `frontend/src/components/Dashboard.jsx` → `frontend/src/lib/storage.js`

Backend: `backend/src/main.py` → `backend/src/deidentify.py` → `backend/src/models.py`  

Sessions tie to: WebSocket implementation in `backend/src/main.py`

## Ports

Backend default: `3001` (requires frontend `vite.config.js` update to change)