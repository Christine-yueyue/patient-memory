# ContinuCare AI

Healthcare conversations are fragmented. A patient may visit multiple hospitals, clinics, or specialists and end up repeating the same medical history, symptoms, medications, and social context at every visit. That repetition wastes clinician time and makes it easier for important context to get lost.

ContinuCare AI is a lightweight clinical memory layer that turns each visit transcript into a persistent, evolving patient profile.

Instead of treating each encounter as a one-off conversation, the system:

- summarizes the visit in plain clinical language,
- extracts diagnoses, medications, allergies, symptoms, and follow-up tasks,
- updates a living patient wiki across visits,
- preserves longitudinal context for the next clinician.

The prototype also gives the doctor a review step so they can verify or decline the generated note, billing suggestions, and follow-up tasks before they are treated as final.

## Key Features

### Persistent patient memory
Maintains an evolving patient profile across multiple encounters.

### Automatic clinical summarization
Converts long transcripts into structured notes and a patient-friendly summary.

### Incremental memory updates
Carries forward prior context while adding only new information from the latest visit.

### Clinician review controls
Lets the doctor verify, adjust, or decline generated note content and task suggestions.

### Visit timeline
Shows a running history of processed visits so the patient story is easy to follow over time.

### Lightweight architecture
Uses browser local storage for the demo, so the prototype works without a database.

### LLM-powered extraction
Uses a structured JSON workflow to generate the note, billing items, tasks, insights, and updated wiki.

## What the Code Actually Implements

The current repo includes:

- a React + Vite frontend in `patient-memory/frontend/`,
- a FastAPI backend in `patient-memory/backend/`,
- browser-side de-identification before the transcript is sent for generation,
- localStorage persistence for the patient wiki and visit timeline,
- structured outputs for:
  - clinical note,
  - suggested billing codes,
  - follow-up tasks,
  - patient summary,
  - AI insights,
  - updated patient memory.

## Why It Matters

Clinicians spend a lot of time reconstructing the story of a patient who has been seen in multiple places. ContinuCare AI reduces that burden by preserving the context across visits and surfacing it instantly in a clean review screen.

For a hackathon demo, this is a strong proof of concept because it is easy to understand, visually polished, and focused on a real workflow problem.

## Tech Stack

- Frontend: React + Vite
- Styling: Custom CSS
- Backend: FastAPI
- Model interface: OpenAI-compatible NVIDIA NIM endpoint
- Storage: Browser localStorage
- Data: Synthetic clinical transcripts

## Future Vision

If expanded beyond the prototype, ContinuCare AI could support:

- patient-controlled longitudinal health records,
- clinician verification workflows before note finalization,
- secure sharing after patient consent,
- integration with EHR systems through standards like FHIR,
- patient-facing summaries delivered by email or portal,
- auditable memory history across institutions.

## Current MVP

The strongest MVP in this repo is the persistent memory layer:

- each processed visit updates the patient wiki,
- the timeline shows continuity over time,
- the doctor can review the generated output,
- the patient summary makes the visit easier to share and explain.

That makes the demo feel more like a real continuity-of-care tool rather than a one-shot note generator.
