"""
Follow-up and reminder models.
Managed by APScheduler background jobs.
"""
from datetime import datetime, timezone

from extensions import db


class FollowUp(db.Model):
    __tablename__ = "followups"

    id = db.Column(db.Integer, primary_key=True)

    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    prediction_id = db.Column(
        db.Integer,
        db.ForeignKey("prediction_history.id", ondelete="SET NULL"),
        nullable=True,
    )

    followup_type = db.Column(db.String(50), nullable=False)
    # MRI_REPEAT | COGNITIVE_ASSESSMENT | MEDICATION_REVIEW | GENERAL

    due_date = db.Column(db.Date, nullable=False)
    interval_days = db.Column(db.Integer, nullable=True)

    notes = db.Column(db.Text, nullable=True)

    status = db.Column(db.String(30), default="SCHEDULED")
    # SCHEDULED | COMPLETED | MISSED | CANCELLED

    created_by_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "prediction_id": self.prediction_id,
            "followup_type": self.followup_type,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "interval_days": self.interval_days,
            "notes": self.notes,
            "status": self.status,
        }


class MedicationReminder(db.Model):
    __tablename__ = "medication_reminders"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    medication_id = db.Column(
        db.Integer,
        db.ForeignKey("medications.id", ondelete="CASCADE"),
        nullable=True,
    )
    reminder_time = db.Column(db.Time, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    last_sent_at = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "medication_id": self.medication_id,
            "reminder_time": str(self.reminder_time),
            "is_active": self.is_active,
        }


class MRIReminder(db.Model):
    __tablename__ = "mri_reminders"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    due_date = db.Column(db.Date, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    is_sent = db.Column(db.Boolean, default=False)
    sent_at = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "notes": self.notes,
            "is_sent": self.is_sent,
        }


class CognitiveAssessmentReminder(db.Model):
    __tablename__ = "cognitive_assessment_reminders"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    due_date = db.Column(db.Date, nullable=False)
    assessment_type = db.Column(db.String(100), nullable=True)
    is_sent = db.Column(db.Boolean, default=False)
    sent_at = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "assessment_type": self.assessment_type,
            "is_sent": self.is_sent,
        }
