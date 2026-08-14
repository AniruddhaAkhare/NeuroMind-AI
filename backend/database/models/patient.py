"""
Patient and related clinical profile models.
"""
from datetime import datetime, timezone

from extensions import db


class Patient(db.Model):
    __tablename__ = "patients"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # ---- Demographics ----------------------------------------
    date_of_birth = db.Column(db.Date, nullable=True)
    gender = db.Column(db.String(20), nullable=True)   # Male/Female/Other/Prefer not to say
    blood_group = db.Column(db.String(10), nullable=True)
    nationality = db.Column(db.String(100), nullable=True)

    # ---- Contact ---------------------------------------------
    address = db.Column(db.Text, nullable=True)
    emergency_contact_name = db.Column(db.String(150), nullable=True)
    emergency_contact_phone = db.Column(db.String(20), nullable=True)
    emergency_contact_relation = db.Column(db.String(50), nullable=True)

    # ---- Clinical summary ------------------------------------
    primary_diagnosis = db.Column(db.String(255), nullable=True)
    assigned_doctor_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # ---- Soft delete -----------------------------------------
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # ---- Relationships ---------------------------------------
    user = db.relationship(
        "User",
        back_populates="patient_profile",
        foreign_keys=[user_id],
    )

    assigned_doctor = db.relationship(
        "User",
        foreign_keys=[assigned_doctor_id],
    )

    medical_history = db.relationship(
        "MedicalHistory",
        back_populates="patient",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    family_history = db.relationship(
        "FamilyHistory",
        back_populates="patient",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    lifestyle = db.relationship(
        "LifestyleInformation",
        back_populates="patient",
        uselist=False,
        cascade="all, delete-orphan",
    )

    medications = db.relationship(
        "Medication",
        back_populates="patient",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    clinical_notes = db.relationship(
        "ClinicalNote",
        back_populates="patient",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    mri_predictions = db.relationship(
        "PredictionHistory",
        back_populates="patient",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    appointments = db.relationship(
        "Appointment",
        back_populates="patient",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    cognitive_assessments = db.relationship(
        "CognitiveAssessment",
        back_populates="patient",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "full_name": self.user.full_name if self.user else None,
            "email": self.user.email if self.user else None,
            "date_of_birth": (
                self.date_of_birth.isoformat() if self.date_of_birth else None
            ),
            "gender": self.gender,
            "blood_group": self.blood_group,
            "nationality": self.nationality,
            "address": self.address,
            "emergency_contact_name": self.emergency_contact_name,
            "emergency_contact_phone": self.emergency_contact_phone,
            "emergency_contact_relation": self.emergency_contact_relation,
            "primary_diagnosis": self.primary_diagnosis,
            "assigned_doctor_id": self.assigned_doctor_id,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
        }


class MedicalHistory(db.Model):
    __tablename__ = "medical_history"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    condition = db.Column(db.String(255), nullable=False)
    diagnosis_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(50), default="Active")   # Active/Resolved/Chronic
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    patient = db.relationship("Patient", back_populates="medical_history")

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "condition": self.condition,
            "diagnosis_date": (
                self.diagnosis_date.isoformat() if self.diagnosis_date else None
            ),
            "status": self.status,
            "notes": self.notes,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
        }


class FamilyHistory(db.Model):
    __tablename__ = "family_history"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    relation = db.Column(db.String(100), nullable=False)   # e.g. Father, Mother
    condition = db.Column(db.String(255), nullable=False)
    age_of_onset = db.Column(db.Integer, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    patient = db.relationship("Patient", back_populates="family_history")

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "relation": self.relation,
            "condition": self.condition,
            "age_of_onset": self.age_of_onset,
            "notes": self.notes,
        }


class LifestyleInformation(db.Model):
    __tablename__ = "lifestyle_information"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    smoking_status = db.Column(db.String(50), nullable=True)    # Never/Former/Current
    alcohol_use = db.Column(db.String(50), nullable=True)       # None/Occasional/Regular
    exercise_frequency = db.Column(db.String(50), nullable=True)
    diet_type = db.Column(db.String(100), nullable=True)
    sleep_hours_per_night = db.Column(db.Float, nullable=True)
    stress_level = db.Column(db.String(50), nullable=True)      # Low/Moderate/High
    occupation = db.Column(db.String(150), nullable=True)
    education_level = db.Column(db.String(100), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    patient = db.relationship("Patient", back_populates="lifestyle")

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "smoking_status": self.smoking_status,
            "alcohol_use": self.alcohol_use,
            "exercise_frequency": self.exercise_frequency,
            "diet_type": self.diet_type,
            "sleep_hours_per_night": self.sleep_hours_per_night,
            "stress_level": self.stress_level,
            "occupation": self.occupation,
            "education_level": self.education_level,
            "notes": self.notes,
        }


class Medication(db.Model):
    __tablename__ = "medications"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = db.Column(db.String(255), nullable=False)
    dosage = db.Column(db.String(100), nullable=True)
    frequency = db.Column(db.String(100), nullable=True)
    prescribing_doctor = db.Column(db.String(150), nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    patient = db.relationship("Patient", back_populates="medications")

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "name": self.name,
            "dosage": self.dosage,
            "frequency": self.frequency,
            "prescribing_doctor": self.prescribing_doctor,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "is_active": self.is_active,
            "notes": self.notes,
        }


class ClinicalNote(db.Model):
    __tablename__ = "clinical_notes"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    author_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    note_type = db.Column(db.String(50), default="General")   # General/Progress/Discharge
    content = db.Column(db.Text, nullable=False)
    is_deleted = db.Column(db.Boolean, default=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    patient = db.relationship("Patient", back_populates="clinical_notes")
    author = db.relationship("User", foreign_keys=[author_id])

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "author_id": self.author_id,
            "author_name": self.author.full_name if self.author else "Unknown",
            "note_type": self.note_type,
            "content": self.content,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
        }


class CognitiveAssessment(db.Model):
    __tablename__ = "cognitive_assessments"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    administered_by_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    assessment_type = db.Column(db.String(100), nullable=False)  # MMSE/MoCA/CDR
    score = db.Column(db.Float, nullable=True)
    max_score = db.Column(db.Float, nullable=True)
    interpretation = db.Column(db.String(255), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    assessment_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    patient = db.relationship("Patient", back_populates="cognitive_assessments")
    administered_by = db.relationship("User", foreign_keys=[administered_by_id])

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "assessment_type": self.assessment_type,
            "score": self.score,
            "max_score": self.max_score,
            "interpretation": self.interpretation,
            "notes": self.notes,
            "assessment_date": (
                self.assessment_date.isoformat() if self.assessment_date else None
            ),
            "administered_by": (
                self.administered_by.full_name
                if self.administered_by
                else None
            ),
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
        }
