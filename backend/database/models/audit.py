"""
Audit log model — immutable event trail.
"""
from datetime import datetime, timezone

from extensions import db


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)

    # Who performed the action
    actor_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    actor_role = db.Column(db.String(50), nullable=True)

    actor_email = db.Column(db.String(255), nullable=True)   # snapshot at time of action

    # What action was performed
    action = db.Column(db.String(100), nullable=False, index=True)
    # e.g. USER_LOGIN | USER_LOGOUT | PATIENT_CREATE | MRI_UPLOAD
    #       PREDICTION_GENERATED | REPORT_GENERATED | APPOINTMENT_BOOKED
    #       DOCUMENT_UPLOADED | ROLE_CHANGED | RECORD_MODIFIED | RECORD_DELETED

    # What the target was
    target_type = db.Column(db.String(50), nullable=True)   # patient / prediction / report
    target_id = db.Column(db.Integer, nullable=True)

    # Request metadata
    ip_address = db.Column(db.String(50), nullable=True)
    user_agent = db.Column(db.String(512), nullable=True)

    # Extra detail
    metadata = db.Column(db.JSON, nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    actor = db.relationship(
        "User",
        back_populates="audit_logs",
        foreign_keys=[actor_id],
    )

    def to_dict(self):
        return {
            "id": self.id,
            "actor_id": self.actor_id,
            "actor_role": self.actor_role,
            "actor_email": self.actor_email,
            "action": self.action,
            "target_type": self.target_type,
            "target_id": self.target_id,
            "ip_address": self.ip_address,
            "metadata": self.metadata,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
        }
