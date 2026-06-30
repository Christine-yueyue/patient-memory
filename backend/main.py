import os
import json
import re
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from models import ProcessVisitRequest, ProcessVisitResponse, PatientWiki, BillingCode, Task, Prescription, EMRPatientData, LoadEMRResponse, CareGap
from deidentify import deidentify
from prompts import SYSTEM_PROMPT, EMR_SYSTEM_PROMPT, build_user_message, build_emr_message

load_dotenv()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="ContinuCare Assistant API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    base_url="https://opencode.ai/zen/v1",
    api_key=os.getenv("OPENCODE_API_KEY"),
)

MODEL = "deepseek-v4-flash-free"


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL}


def _call_llm(system_prompt: str, user_message: str) -> dict:
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            max_tokens=2500,
            temperature=0.2,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM call failed: {str(e)}")

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Model returned invalid JSON: {str(e)}. Raw: {raw[:300]}"
        )


@app.post("/api/load-emr", response_model=LoadEMRResponse)
async def load_emr(req: EMRPatientData):
    patient_data = req.model_dump()
    user_message = build_emr_message(patient_data)

    data = _call_llm(EMR_SYSTEM_PROMPT, user_message)

    care_gaps = [CareGap(**g) for g in data.get("care_gaps", [])]
    wiki_raw = data.get("wiki_update", {})
    wiki_update = PatientWiki(
        conditions=wiki_raw.get("conditions", []),
        medications=wiki_raw.get("medications", []),
        pending_tasks=[],
        resolved_tasks=wiki_raw.get("resolved_tasks", []),
        narrative=wiki_raw.get("narrative", ""),
        history=wiki_raw.get("history", ""),
    )

    return LoadEMRResponse(
        patient_id=req.id,
        patient_name=req.name,
        patient_story=data.get("patient_story", ""),
        care_gaps=care_gaps,
        wiki_update=wiki_update,
    )


@app.post("/api/process", response_model=ProcessVisitResponse)
@limiter.limit("40/minute")
async def process_visit(request: Request, req: ProcessVisitRequest):
    # 1. De-identify before anything leaves the server toward the LLM
    deid_result = deidentify(req.transcript, req.patient_names)
    clean_transcript = deid_result["clean"]
    replacement_map = deid_result["map"]

    # 2. Build prompt — inject patient wiki if return visit
    user_message = build_user_message(clean_transcript, req.patient_wiki)

    # 3. Call LLM
    data = _call_llm(SYSTEM_PROMPT, user_message)

    # 4. Build typed response
    try:
        prescriptions = [Prescription(**p) for p in data.get("prescriptions", [])]
        billing = [BillingCode(**b) for b in data.get("billing", [])]
        tasks = [Task(**t) for t in data.get("tasks", [])]
        checklist = data.get("checklist", [])
        patient_reminders = data.get("patient_reminders", [])
        doctor_reminders = data.get("doctor_reminders", [])
        patient_summary = data.get("patient_summary", "")
        insights = data.get("insights", [])
        wiki_raw = data.get("wiki_update", {})
        wiki_pending = [Task(**t) for t in wiki_raw.get("pending_tasks", [])]
        wiki_update = PatientWiki(
            conditions=wiki_raw.get("conditions", []),
            medications=wiki_raw.get("medications", []),
            pending_tasks=wiki_pending,
            resolved_tasks=wiki_raw.get("resolved_tasks", []),
            narrative=wiki_raw.get("narrative", ""),
            history=wiki_raw.get("history", ""),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Response parsing error: {str(e)}")

    return ProcessVisitResponse(
        note=data.get("note", ""),
        prescriptions=prescriptions,
        billing=billing,
        tasks=tasks,
        checklist=checklist,
        patient_reminders=patient_reminders,
        doctor_reminders=doctor_reminders,
        patient_summary=patient_summary,
        insights=insights,
        wiki_update=wiki_update,
        deidentified_transcript=clean_transcript,
        replacement_map=replacement_map,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 3001))
    )
