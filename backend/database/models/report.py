"""
Clinical Report model.
"""
from datetime import datetime, timezone

from extensions import db


class ClinicalReport(db.Model):
    __tablename__ = "clinical_reports"

    id = db.Column(db.Integer, primary_key=True)

    prediction_id = db.Column(
        db.Integer,
        db.ForeignKey("prediction_history.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    generated_by_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # ---- Report content --------------------------------------
    # AI-generated narrative (Gemini)
    ai_narrative = db.Column(db.Text, nullable=True)

    # Clinical observations (manual/doctor input)
    clinical_observations = db.Column(db.Text, nullable=True)

    # Follow-up recommendations
    recommendations = db.Column(db.Text, nullable=True)

    # Disease stage summary
    disease_stage = db.Column(db.String(100), nullable=True)

    # ---- PDF file --------------------------------------------
    pdf_path = db.Column(db.String(512), nullable=True)

    pdf_generated_at = db.Column(db.DateTime(timezone=True), nullable=True)

    # ---- Status ----------------------------------------------
    status = db.Column(db.String(30), default="DRAFT")
    # DRAFT → FINAL → ARCHIVED

    is_archived = db.Column(db.Boolean, default=False, nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # ---- Relationships ---------------------------------------
    prediction = db.relationship("PredictionHistory", back_populates="report")
    patient = db.relationship("Patient")
    generated_by = db.relationship("User", foreign_keys=[generated_by_id])

    def to_dict(self):
        import json
        dossier_data = None
        if self.ai_narrative:
            try:
                stripped = self.ai_narrative.strip()
                if stripped.startswith("{") or stripped.startswith("["):
                    dossier_data = json.loads(stripped)
            except Exception:
                dossier_data = None

        return {
            "id": self.id,
            "prediction_id": self.prediction_id,
            "patient_id": self.patient_id,
            "generated_by_id": self.generated_by_id,
            "generated_by_name": (
                self.generated_by.full_name if self.generated_by else None
            ),
            "ai_narrative": self.ai_narrative,
            "clinical_dossier": dossier_data,
            "clinical_observations": self.clinical_observations,
            "recommendations": self.recommendations,
            "disease_stage": self.disease_stage,
            "pdf_path": self.pdf_path,
            "pdf_available": bool(self.pdf_path),
            "pdf_generated_at": (
                self.pdf_generated_at.isoformat()
                if self.pdf_generated_at
                else None
            ),
            "status": self.status,
            "is_archived": self.is_archived,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
            "updated_at": (
                self.updated_at.isoformat() if self.updated_at else None
            ),
        }
