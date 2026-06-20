from pydantic import BaseModel
from typing import Optional


class Task(BaseModel):
    task: str
    due: str
    source: str
    status: str = "pending"


class BillingCode(BaseModel):
    code: str
    label: str
    rationale: str
    source: str
    approved: bool = False


class PatientWiki(BaseModel):
    conditions: list[str] = []
    medications: list[str] = []
    pending_tasks: list[Task] = []
    resolved_tasks: list[str] = []
    narrative: str = ""
    history: str = ""


class ProcessVisitRequest(BaseModel):
    transcript: str
    patient_names: list[str] = []   # used for de-identification
    patient_wiki: Optional[PatientWiki] = None
    patient_session_id: str


class ProcessVisitResponse(BaseModel):
    note: str
    billing: list[BillingCode]
    tasks: list[Task]
    wiki_update: PatientWiki
    deidentified_transcript: str    # what was actually sent to Claude
    replacement_map: dict           # token → real value, for re-id on frontend
