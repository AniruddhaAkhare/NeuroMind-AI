"""
Notification and EmergencyAlert models.
"""
from datetime import datetime, timezone

from extensions import db


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)

    notification_type = db.Column(db.String(50), nullable=False)
    # Types: appointment_confirmed | appointment_cancelled | appointment_rescheduled
    #        followup_reminder | mri_reminder | cognitive_reminder
    #        report_ready | high_risk_alert | system

    reference_type = db.Column(db.String(50), nullable=True)  # appointment/prediction/report
    reference_id = db.Column(db.Integer, nullable=True)

    is_read = db.Column(db.Boolean, default=False, nullable=False, index=True)
    is_archived = db.Column(db.Boolean, default=False, nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    read_at = db.Column(db.DateTime(timezone=True), nullable=True)

    user = db.relationship("User", back_populates="notifications")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "notification_type": self.notification_type,
            "reference_type": self.reference_type,
            "reference_id": self.reference_id,
            "is_read": self.is_read,
            "is_archived": self.is_archived,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
            "read_at": self.read_at.isoformat() if self.read_at else None,
        }


class EmergencyAlert(db.Model):
    __tablename__ = "emergency_alerts"

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

    alert_type = db.Column(db.String(50), nullable=False)
    # HIGH_RISK_PREDICTION | CRITICAL_RISK | URGENT_CONSULTATION

    severity = db.Column(db.String(20), nullable=False)   # HIGH / CRITICAL

    message = db.Column(db.Text, nullable=False)

    trigger_reason = db.Column(db.Text, nullable=True)

    is_acknowledged = db.Column(db.Boolean, default=False, nullable=False)

    acknowledged_by_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    acknowledged_at = db.Column(db.DateTime(timezone=True), nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "prediction_id": self.prediction_id,
            "alert_type": self.alert_type,
            "severity": self.severity,
            "message": self.message,
            "trigger_reason": self.trigger_reason,
            "is_acknowledged": self.is_acknowledged,
            "acknowledged_by_id": self.acknowledged_by_id,
            "acknowledged_at": (
                self.acknowledged_at.isoformat()
                if self.acknowledged_at
                else None
            ),
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
        }
