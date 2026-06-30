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


class EMRCondition(BaseModel):
    code: str = ""
    name: str
    onset: str = ""
    status: str = "active"

class EMRMedication(BaseModel):
    name: str
    start: str = ""
    end: str | None = None
    status: str = "active"
    reason: str = ""

class EMREncounter(BaseModel):
    date: str
    reason: str = ""

class EMRLab(BaseModel):
    test: str
    date: str = ""
    value: str = ""
    unit: str = ""

class EMRImmunization(BaseModel):
    vaccine: str
    date: str = ""

class CareGap(BaseModel):
    gap: str
    due: str | None = None
    status: str = "pending"
    detail: str = ""

class EMRPatientData(BaseModel):
    id: str
    name: str
    dob: str = ""
    gender: str = ""
    conditions: list[EMRCondition] = []
    medications: list[EMRMedication] = []
    encounters: list[EMREncounter] = []
    labs: list[EMRLab] = []
    immunizations: list[EMRImmunization] = []
    careGaps: list[CareGap] = []

class LoadEMRResponse(BaseModel):
    patient_id: str
    patient_name: str
    patient_story: str
    care_gaps: list[CareGap]
    wiki_update: PatientWiki

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
