"""
User model — extended with role-based access control.
Existing 'users' table is extended additively.
"""
import enum
from datetime import datetime, timezone

from extensions import db


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    RADIOLOGIST = "radiologist"
    LAB_TECHNICIAN = "lab_technician"
    RECEPTIONIST = "receptionist"
    PATIENT = "patient"


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    full_name = db.Column(db.String(150), nullable=False)

    email = db.Column(
        db.String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash = db.Column(db.String(255), nullable=False)

    # ----------------------------------------------------------
    # ROLE (new — defaults to 'patient' for backward compat)
    # ----------------------------------------------------------
    role = db.Column(
        db.String(50),
        nullable=False,
        default=UserRole.PATIENT.value,
        index=True,
    )

    # ----------------------------------------------------------
    # PROFILE EXTENSIONS
    # ----------------------------------------------------------
    phone = db.Column(db.String(20), nullable=True)

    avatar_url = db.Column(db.String(512), nullable=True)

    is_active = db.Column(db.Boolean, nullable=False, default=True)

    last_login_at = db.Column(db.DateTime(timezone=True), nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=True,
    )

    # ----------------------------------------------------------
    # RELATIONSHIPS
    # ----------------------------------------------------------
    patient_profile = db.relationship(
        "Patient",
        back_populates="user",
        foreign_keys="Patient.user_id",
        uselist=False,
        cascade="all, delete-orphan",
    )

    notifications = db.relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    audit_logs = db.relationship(
        "AuditLog",
        back_populates="actor",
        foreign_keys="AuditLog.actor_id",
        lazy="dynamic",
    )

    # ----------------------------------------------------------
    # HELPERS
    # ----------------------------------------------------------
    def has_role(self, *roles: str) -> bool:
        return self.role in roles

    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN.value

    def is_doctor(self) -> bool:
        return self.role == UserRole.DOCTOR.value

    def is_radiologist(self) -> bool:
        return self.role == UserRole.RADIOLOGIST.value

    def is_lab_tech(self) -> bool:
        return self.role == UserRole.LAB_TECHNICIAN.value

    def is_receptionist(self) -> bool:
        return self.role == UserRole.RECEPTIONIST.value

    def is_patient(self) -> bool:
        return self.role == UserRole.PATIENT.value

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "role": self.role,
            "phone": self.phone,
            "avatar_url": self.avatar_url,
            "is_active": self.is_active,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
            "last_login_at": (
                self.last_login_at.isoformat()
                if self.last_login_at
                else None
            ),
        }

    def to_public_dict(self):
        """Safe dict — no sensitive fields."""
        return {
            "id": self.id,
            "full_name": self.full_name,
            "role": self.role,
            "avatar_url": self.avatar_url,
        }
