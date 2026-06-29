# ContinuCare AI

From fragmented records to continuous care.

ContinuCare AI helps family doctors make sense of patient information across visits. Instead of treating each visit in isolation, it builds a living picture of every patient that grows over time.

---

## The Problem

A family doctor sees 20 to 30 patients a day. Before each visit, they have a few minutes to review the patient's chart. But EMRs show information as flat lists: conditions, medications, lab results scattered across tabs. There is no story connecting them. The doctor walks in without the full picture.

After the visit, decisions get made: order a test, refer to a specialist, adjust a medication, follow up in six weeks. But there is no system that tracks whether those things actually happen. Abnormal results go unfollowed. Referrals never get booked. Medication monitoring gets missed.

These are not workflow annoyances. They are patient safety gaps caused by information falling through the cracks between visits.

---

## What ContinuCare Does

ContinuCare addresses two sides of every visit: **what the doctor needs to know before walking in** and **what needs to happen after the patient leaves**.

### Before the Visit: The Patient Story

When a doctor opens a patient record, ContinuCare generates a clear narrative from the raw EMR data:

- **A clinical timeline with context.** Instead of "Diabetes (2019)", the output reads: "Diagnosed with Type 2 Diabetes in 2019. A1c improved from 8.5 to 7.1 on Metformin. Neuropathy noted in 2024."
- **Medication history that explains changes.** What was tried, what worked, what was stopped, and why.
- **Gaps and overdue items flagged prominently.** "No mammogram since 2020. Flu vaccine due. eGFR not checked in 14 months."
- **Changes since the last visit.** New results, specialist notes, hospital visits, or medication adjustments.

The goal: the doctor walks in with full context, not starting from scratch.

### After the Visit: Closing the Loop

When a clinical decision is made during a visit, ContinuCare converts it into tracked follow-up:

- **Care plan generation.** Follow-up tasks, test tracking, medication monitoring, and referrals are extracted automatically.
- **Completion tracking across visits.** Each item shows as done, pending, or overdue.
- **Alerting for gaps.** Critical misses are flagged: abnormal results with no documented action, overdue screenings, unfilled referrals.
- **Pre-visit reconciliation.** When the patient returns, the doctor sees: "Since the last visit: 3 of 5 follow-up items completed. 1 lab result still pending. 1 referral not yet booked."

This creates a closed loop. Visit decisions become tracked actions. Nothing falls through the cracks.

---

## How It Works

```
Patient EMR data (FHIR)         Visit transcript
         |                            |
         v                            v
 +---------------------+    +-----------------------+
 | LLM processes full   |    | LLM extracts care      |
 | history and creates  |    | plan from visit and    |
 | a structured story   |    | generates follow-up    |
 +---------+-----------+    +-----------+-----------+
           |                            |
           v                            v
 +---------------------+    +-----------------------+
 | Clinician sees       |    | Tasks are tracked      |
 | narrative, gaps,     |    | across visits with     |
 | and context          |    | overdue alerts         |
 +---------------------+    +-----------------------+
           |                            |
           +------------+---------------+
                        v
              +---------------------+
              | Next visit brief:    |
              | "Since last time..." |
              +---------------------+
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Custom CSS |
| Backend | FastAPI (Python) |
| LLM | NVIDIA NIM (OpenAI-compatible) |
| Data Validation | Pydantic |
| De-identification | Regex-based (client + server) |
| Storage | Browser localStorage |
| Synthetic Data | Synthea FHIR |

---

## Why This Matters

Family medicine is built on continuity: knowing patients over time. But current tools make continuity harder, not easier. Patient data is scattered across EMR tabs, fax machines, hospital portals, and paper forms. The story of a patient is buried under the volume of information.

ContinuCare restores the narrative. It does not replace clinical judgment. It surfaces what the clinician needs to know, when they need it, so they can focus on the patient rather than the chart.

---

## Project Status

This is a prototype built for the AI in Healthcare Co-Design Event (June 20, 2026, Invest Ottawa). It uses synthetic patient data only. No real patient information, no live EMR connections, and no clinical deployment.

### Implemented

- Patient story generation from structured EMR data
- Visit transcript processing with structured clinical output
- Follow-up task extraction with status tracking across visits
- Persistent patient memory across multiple encounters
- Visit timeline with longitudinal context
- Clinician review controls for generated content
- De-identification (privacy-first design)

### In Progress

- Family relationship visualization
- Social and community context surfacing
- Panel-level dashboard for all patients and pending follow-ups
- EHR integration via FHIR and SMART on FHIR
- Multi-clinician workflow support

---

Built for the AI in Healthcare Co-Design Event, June 2026.
