from datetime import datetime, timezone

from extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    full_name = db.Column(
        db.String(150),
        nullable=False
    )

    email = db.Column(
        db.String(255),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = db.Column(
        db.String(255),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
        }


class PredictionHistory(db.Model):
    __tablename__ = "prediction_history"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    image_filename = db.Column(
        db.String(255),
        nullable=False
    )

    predicted_class = db.Column(
        db.String(50),
        nullable=False
    )

    confidence = db.Column(
        db.Float,
        nullable=False
    )

    non_demented_probability = db.Column(
        db.Float,
        nullable=False
    )

    very_mild_demented_probability = db.Column(
        db.Float,
        nullable=False
    )

    mild_demented_probability = db.Column(
        db.Float,
        nullable=False
    )

    moderate_demented_probability = db.Column(
        db.Float,
        nullable=False
    )

    image_path = db.Column(
        db.String(512),
        nullable=False
    )

    gradcam_path = db.Column(
        db.String(512),
        nullable=True
    )

    model_name = db.Column(
        db.String(100),
        default="EfficientNet-B3"
    )

    model_version = db.Column(
        db.String(50),
        default="1.0.0"
    )

    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    def to_dict(self):
        return {
            "id": self.id,
            "image_filename": self.image_filename,
            "predicted_class": self.predicted_class,
            "confidence": round(
                self.confidence,
                4
            ),
            "class_probabilities": {
                "NonDemented": round(
                    self.non_demented_probability,
                    4
                ),
                "VeryMildDemented": round(
                    self.very_mild_demented_probability,
                    4
                ),
                "MildDemented": round(
                    self.mild_demented_probability,
                    4
                ),
                "ModerateDemented": round(
                    self.moderate_demented_probability,
                    4
                )
            },
            "image_path": self.image_path,
            "gradcam_path": self.gradcam_path,
            "gradcam_available": bool(
                self.gradcam_path
            ),
            "model_name": self.model_name,
            "model_version": self.model_version,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
        }