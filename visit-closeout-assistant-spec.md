# Visit Closeout Assistant — Build Spec

> Brief for Claude Code. Build this as a working demo for a 4-hour hackathon
> (AI in Healthcare Co-Design, uOttawa DFM / TOH / Bruyère / AGI Ventures).
> Judged by a clinician panel on: clinical importance, technical feasibility,
> safety/privacy, workflow fit. Build the **Must-have** scope first; treat
> **Stretch** as optional.

---

## 1. One-line concept

A doctor finishes a patient visit. The app takes the **visit conversation** and
produces three things on one screen — the **clinical note**, the **suggested
billing code(s)**, and a **follow-up task list** — each traceable to the
conversation, with the clinician approving everything.

Tagline: *"The scribe writes the note. We finish the visit."*

## 2. Why it matters (for the pitch, not the code)

Family physicians lose ~19 hrs/week to admin, >50% report burnout, ~1 in 5
Canadians has no family doctor. The note is largely solved by existing scribes;
the gap is the admin **after** the note — billing that gets undercharged and
follow-ups that fall through the cracks. This tool closes that loop.

## 3. What's AI vs. not

- **AI (Claude / LLM):** reads the messy transcript → writes the note →
  suggests billing code(s) → extracts follow-up tasks. This is the engine.
- **Plain code:** the UI, the de-identification pass, the panes, the
  edit/approve/checkbox interactions, displaying source lines.
- We are **not** training a model. Intelligence is Claude's, accessed via a
  prompt. That is intentional and standard.

---

## 4. Core data flow

```
sample transcript
      │
      ▼
[ de-identify in browser ]   ← strip names/IDs, keep a local re-insertion map
      │  (de-identified text only)
      ▼
[ backend proxy → Anthropic Messages API ]   ← holds API key, runs the prompt
      │  (returns JSON)
      ▼
{ note, billing[], tasks[] }
      │
      ▼
[ re-insert real identifiers locally ] → render 3 panes
```

Key privacy property: **nothing is stored.** Everything lives in browser memory
for the session and is gone on refresh. No database, no files, no patient table.

---

## 5. Tech stack

- **Frontend:** React + Vite. Plain CSS or Tailwind. No router needed (one screen).
- **Backend:** minimal Node + Express proxy (one endpoint) that holds
  `ANTHROPIC_API_KEY` and forwards to the Anthropic Messages API. This keeps the
  key off the client and avoids browser CORS issues.
- **LLM:** Anthropic Messages API, model `claude-sonnet-4-6`, `max_tokens: 1500`.
- **Data:** 2–3 transcripts hard-coded from the ACI-Bench dataset (`aci`
  subset). Synthetic patients — no real PHI. (Dataset:
  https://huggingface.co/datasets/mkieffer/ACI-Bench — `dialogue` + `note`
  columns. Just copy a few `dialogue` values into a seed file.)

Env: `ANTHROPIC_API_KEY` in a `.env` read by the server only.

---

## 6. Suggested file structure

```
/server
  index.js            # Express: POST /api/process → calls Anthropic, returns JSON
  .env                # ANTHROPIC_API_KEY=...
/src
  App.jsx             # layout: transcript selector + 3 panes
  components/
    TranscriptInput.jsx   # dropdown of sample transcripts + paste box + "Process"
    NotePane.jsx          # renders the clinical note
    BillingPane.jsx       # renders suggested code(s) + rationale + approve toggle
    TasksPane.jsx         # editable checklist; each task shows its source line
  lib/
    deidentify.js     # redact PII before sending; returns {clean, map}
    reidentify.js     # re-insert real values into displayed text using map
  data/
    transcripts.js    # 2-3 ACI-Bench sample transcripts
index.html
```

---

## 7. The LLM call

**Endpoint:** `POST /api/process` with body `{ transcript }` (already
de-identified). Server calls Anthropic and returns the parsed JSON.

**System / instruction prompt to send to Claude:**

```
You are a clinical documentation assistant for a primary care visit. You are
given the transcript of a doctor-patient conversation. The transcript has been
de-identified; tokens like [PATIENT], [DOB], [PHONE] are placeholders — preserve
them exactly, do not invent real values.

Return ONLY valid JSON (no markdown, no preamble) with this exact shape:

{
  "note": "string — a structured clinical note with sections: CHIEF COMPLAINT, HISTORY OF PRESENT ILLNESS, ASSESSMENT, PLAN",
  "billing": [
    { "code": "string", "label": "string", "rationale": "string — the diagnosis/visit element justifying it", "source": "string — short quote from the transcript" }
  ],
  "tasks": [
    { "task": "string — an actionable follow-up, e.g. 'Order CBC' or 'Refer to cardiology'", "due": "string — e.g. '6 weeks' or 'before next visit'", "source": "string — short quote from the transcript that triggered it" }
  ]
}

Rules:
- Billing codes are SUGGESTIONS for the clinician to confirm; never present them
  as final. If unsure, still suggest the closest plausible code and say so in
  rationale. (For the demo, generic visit/assessment codes are acceptable;
  production would use Ontario OHIP codes.)
- Every task and billing item MUST include a "source" quote from the transcript.
- Do not include any information not supported by the transcript.
```

**Server must:** strip any accidental ```json fences, `JSON.parse`, and return
the object. Wrap in try/catch; on parse failure return `{error}` and let the UI
show a friendly message.

---

## 8. De-identification pass (`lib/deidentify.js`)

Runs in the browser **before** the transcript is sent. Goal: data minimization —
the clinical story goes to the LLM, the identity does not.

- Replace with tokens via regex:
  - dates of birth / dates → `[DOB]` / `[DATE]`
  - phone numbers → `[PHONE]`
  - emails → `[EMAIL]`
  - Ontario health card numbers (10 digits, optional 2 letters) → `[HEALTHCARD]`
  - postal codes (A1A 1A1) → `[ADDRESS]`
- Names: replace against a configurable name list seeded from the sample data
  (so "Martha Collins" → `[PATIENT]` visibly in the demo). Note in a code comment
  that production would use proper NER/LLM-based de-id — regex names are a demo
  shortcut, not a guarantee.
- Return `{ clean, map }` where `map` lets `reidentify.js` put real values back
  into the displayed note locally.

Demo value: show the transcript with names highlighted, then show them replaced
by tokens, with a caption "this is what leaves the device."

---

## 9. UI requirements

- **One screen.** Left: transcript selector (dropdown of samples + paste area) and
  a "Process visit" button. Right: three stacked/side-by-side panes — Note,
  Billing, Tasks.
- **Tasks pane:** each item is a checkbox + editable text + a small "from: …"
  source line. User can edit, check off, or delete.
- **Billing pane:** code + label + rationale, with an "Approve" toggle. Label the
  whole pane "Suggested — clinician confirms."
- **Trust cues everywhere:** every billing/task item shows the transcript line it
  came from (satisfies the "calibrated trust / audit & override" requirement).
- Loading state while the API call runs. No localStorage / sessionStorage.

---

## 10. Build order (do in this order)

**Must-have (ship these first):**
1. Express proxy + one working Anthropic call returning the JSON shape.
2. Seed 2–3 ACI-Bench transcripts; dropdown to pick one.
3. Process button → call proxy → render Note, Billing, Tasks panes.
4. Tasks are editable + checkable; billing shows rationale; source lines visible.

**Stretch (only if time remains):**
5. De-identification pass + the "watch names get stripped" view.
6. Re-identification on display.
7. Personalization: a free-text "note style" field injected into the prompt.

> If the clock is tight, ship 1–4. That alone is a complete, demoable product.
> De-id (5–6) is the highest-value stretch for a privacy-judged event.

---

## 11. Privacy / safety position (for judges)

- **Demo:** synthetic ACI-Bench data only — zero real PHI. Stores nothing
  (in-memory, gone on refresh).
- **Real-world (describe, don't build):** de-identify → send through an LLM
  provider under a zero-retention + data-residency (PHIPA) agreement → write
  results back into the **existing EMR** (no new patient database). Local/on-prem
  model as the privacy-maximal future. Consent at recording, audit log, clinician
  approval before anything is saved.

## 12. Out of scope (say "roadmap," don't build)

- Live speech-to-text (use ready transcripts).
- Real EMR / FHIR integration.
- Medication reconciliation (needs a second "before" med list we don't have).
- Real OHIP code validation / fine-tuning.
- Auth, accounts, persistence.

---

## 13. Acceptance check

A reviewer can: pick a sample transcript → click Process → within a few seconds
see a clinical note, at least one suggested billing code with a rationale, and a
follow-up task list where each task shows the conversation line it came from —
and can edit/check the tasks. (Stretch: see identifiers stripped before sending.)
