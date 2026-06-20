from pydantic import BaseModel
from typing import Optional


class Task(BaseModel):
    task: str
    due: str
    source: str
    status: str = "pending"
    assignee: str = "doctor"  # "doctor" or "patient"


class Prescription(BaseModel):
    medication: str
    dose: str
    frequency: str
    duration: str
    instructions: str = ""


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
    patient_names: list[str] = []
    patient_wiki: Optional[PatientWiki] = None
    patient_session_id: str


class ProcessVisitResponse(BaseModel):
    note: str                          # SOAP format plain text
    prescriptions: list[Prescription] = []
    billing: list[BillingCode]
    tasks: list[Task]
    checklist: list[str] = []          # end-of-visit checklist items
    patient_reminders: list[str] = []
    doctor_reminders: list[str] = []
    patient_summary: str = ""
    insights: list[str] = []
    wiki_update: PatientWiki
    deidentified_transcript: str
    replacement_map: dict
