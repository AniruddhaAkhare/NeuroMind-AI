"""
Database models package for NeuroMind AI.
Import all models here so SQLAlchemy can discover them.
"""

from .user import User, UserRole
from .patient import (
    Patient,
    MedicalHistory,
    FamilyHistory,
    LifestyleInformation,
    Medication,
    ClinicalNote,
    CognitiveAssessment,
)
from .prediction import PredictionHistory, XAIResult
from .report import ClinicalReport
from .appointment import Hospital, HospitalService, Doctor, DoctorHospitalAffiliation, AppointmentSlot, Appointment
from .rag import MedicalDocument, DocumentChunk
from .notification import Notification, EmergencyAlert
from .followup import FollowUp, MedicationReminder, MRIReminder, CognitiveAssessmentReminder
from .audit import AuditLog

__all__ = [
    "User", "UserRole",
    "Patient", "MedicalHistory", "FamilyHistory",
    "LifestyleInformation", "Medication", "ClinicalNote", "CognitiveAssessment",
    "PredictionHistory", "XAIResult",
    "ClinicalReport",
    "Hospital", "HospitalService", "Doctor", "DoctorHospitalAffiliation",
    "AppointmentSlot", "Appointment",
    "MedicalDocument", "DocumentChunk",
    "Notification", "EmergencyAlert",
    "FollowUp", "MedicationReminder", "MRIReminder", "CognitiveAssessmentReminder",
    "AuditLog",
]
