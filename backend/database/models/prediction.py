"""
MRI Prediction and XAI results models.
Extends the existing prediction_history table additively.
"""
from datetime import datetime, timezone

from extensions import db


class PredictionHistory(db.Model):
    __tablename__ = "prediction_history"

    id = db.Column(db.Integer, primary_key=True)

    # ---- Patient link (new — nullable for backward compat) ---
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # ---- Uploaded by -----------------------------------------
    uploaded_by_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # ---- Original fields (PRESERVED) -------------------------
    image_filename = db.Column(db.String(255), nullable=False)
    predicted_class = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    non_demented_probability = db.Column(db.Float, nullable=False)
    very_mild_demented_probability = db.Column(db.Float, nullable=False)
    mild_demented_probability = db.Column(db.Float, nullable=False)
    moderate_demented_probability = db.Column(db.Float, nullable=False)
    image_path = db.Column(db.String(512), nullable=False)
    gradcam_path = db.Column(db.String(512), nullable=True)
    model_name = db.Column(db.String(100), default="EfficientNet-B3")
    model_version = db.Column(db.String(50), default="1.0.0")
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    # ---- New extended fields (additive) ----------------------
    risk_level = db.Column(
        db.String(20),
        nullable=True,
    )  # LOW / MODERATE / HIGH / CRITICAL

    risk_score = db.Column(db.Float, nullable=True)   # 0.0–1.0

    follow_up_recommendation = db.Column(db.Text, nullable=True)

    preprocessing_applied = db.Column(db.JSON, nullable=True)

    scan_type = db.Column(db.String(50), default="MRI")

    is_emergency = db.Column(db.Boolean, default=False, nullable=False)

    # ---- Relationships --------------------------------------
    patient = db.relationship("Patient", back_populates="mri_predictions")

    uploaded_by = db.relationship("User", foreign_keys=[uploaded_by_id])

    xai_result = db.relationship(
        "XAIResult",
        back_populates="prediction",
        uselist=False,
        cascade="all, delete-orphan",
    )

    report = db.relationship(
        "ClinicalReport",
        back_populates="prediction",
        uselist=False,
        cascade="all, delete-orphan",
    )

    def to_dict(self):
        report_data = self.report.to_dict() if self.report else None
        xai_data = self.xai_result.to_dict() if self.xai_result else None
        peak_coords = xai_data.get("peak_coordinates") if xai_data else None

        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "uploaded_by_id": self.uploaded_by_id,
            "image_filename": self.image_filename,
            "predicted_class": self.predicted_class,
            "confidence": round(self.confidence, 4),
            "class_probabilities": {
                "NonDemented": round(self.non_demented_probability, 4),
                "VeryMildDemented": round(self.very_mild_demented_probability, 4),
                "MildDemented": round(self.mild_demented_probability, 4),
                "ModerateDemented": round(self.moderate_demented_probability, 4),
            },
            "risk_level": self.risk_level,
            "risk_score": self.risk_score,
            "follow_up_recommendation": self.follow_up_recommendation,
            "is_emergency": self.is_emergency,
            "image_path": self.image_path,
            "gradcam_path": self.gradcam_path,
            "raw_heatmap_path": self.xai_result.heatmap_path if self.xai_result else None,
            "gradcam_available": bool(self.gradcam_path),
            "xai_result": xai_data,
            "peak_coordinates": peak_coords,
            "clinical_dossier": report_data.get("clinical_dossier") if report_data else None,
            "report": report_data,
            "model_name": self.model_name,
            "model_version": self.model_version,
            "scan_type": self.scan_type,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
        }


class XAIResult(db.Model):
    """Persisted XAI / Grad-CAM metadata for a prediction."""

    __tablename__ = "xai_results"

    id = db.Column(db.Integer, primary_key=True)

    prediction_id = db.Column(
        db.Integer,
        db.ForeignKey("prediction_history.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    method = db.Column(db.String(50), default="GradCAM")   # GradCAM / GradCAM++ etc.

    target_layer = db.Column(db.String(100), nullable=True)

    target_class = db.Column(db.String(50), nullable=True)

    target_class_index = db.Column(db.Integer, nullable=True)

    heatmap_path = db.Column(db.String(512), nullable=True)

    overlay_path = db.Column(db.String(512), nullable=True)

    # Per-region importance — stored as JSON array of dicts or dict with peak_coordinates
    region_importance = db.Column(db.JSON, nullable=True)

    cam_max_value = db.Column(db.Float, nullable=True)

    cam_mean_value = db.Column(db.Float, nullable=True)

    generated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    prediction = db.relationship("PredictionHistory", back_populates="xai_result")

    def to_dict(self):
        regions = self.region_importance
        peak_coords = None
        if isinstance(regions, dict):
            peak_coords = regions.get("peak_coordinates")
            regions = regions.get("regions", [])

        return {
            "id": self.id,
            "prediction_id": self.prediction_id,
            "method": self.method,
            "target_layer": self.target_layer,
            "target_class": self.target_class,
            "target_class_index": self.target_class_index,
            "heatmap_path": self.heatmap_path,
            "overlay_path": self.overlay_path,
            "region_importance": regions,
            "peak_coordinates": peak_coords,
            "cam_max_value": self.cam_max_value,
            "cam_mean_value": self.cam_mean_value,
            "generated_at": (
                self.generated_at.isoformat() if self.generated_at else None
            ),
        }
