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

from models import ProcessVisitRequest, ProcessVisitResponse, PatientWiki, BillingCode, Task
from deidentify import deidentify
from prompts import SYSTEM_PROMPT, build_user_message

load_dotenv()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Patient Memory API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY"),
)

MODEL = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL}


@app.post("/api/process", response_model=ProcessVisitResponse)
@limiter.limit("40/minute")
async def process_visit(request: Request, req: ProcessVisitRequest):
    # 1. De-identify before anything leaves the server toward the LLM
    deid_result = deidentify(req.transcript, req.patient_names)
    clean_transcript = deid_result["clean"]
    replacement_map = deid_result["map"]

    # 2. Build the prompt — inject patient wiki if this is a return visit
    user_message = build_user_message(clean_transcript, req.patient_wiki)

    # 3. Call NVIDIA NIM (OpenAI-compatible)
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            max_tokens=2000,
            temperature=0.2,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM call failed: {str(e)}")

    raw = response.choices[0].message.content.strip()

    # 4. Strip accidental markdown fences if model adds them
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    # 5. Parse JSON
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Model returned invalid JSON: {str(e)}. Raw: {raw[:300]}"
        )

    # 6. Build typed response
    try:
        billing = [BillingCode(**b) for b in data.get("billing", [])]
        tasks = [Task(**t) for t in data.get("tasks", [])]
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
        billing=billing,
        tasks=tasks,
        wiki_update=wiki_update,
        deidentified_transcript=clean_transcript,
        replacement_map=replacement_map,
    )
