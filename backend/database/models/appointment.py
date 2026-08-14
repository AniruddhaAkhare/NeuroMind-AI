"""
Doctor, Hospital, and Appointment models.
"""
from datetime import datetime, timezone

from extensions import db


class Hospital(db.Model):
    __tablename__ = "hospitals"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.Text, nullable=True)
    city = db.Column(db.String(100), nullable=True)
    state = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    pincode = db.Column(db.String(20), nullable=True)
    phone = db.Column(db.String(30), nullable=True)
    email = db.Column(db.String(255), nullable=True)
    website = db.Column(db.String(512), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    rating = db.Column(db.Float, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    services = db.relationship(
        "HospitalService",
        back_populates="hospital",
        cascade="all, delete-orphan",
    )
    doctor_affiliations = db.relationship(
        "DoctorHospitalAffiliation",
        back_populates="hospital",
        cascade="all, delete-orphan",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "country": self.country,
            "pincode": self.pincode,
            "phone": self.phone,
            "email": self.email,
            "website": self.website,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "rating": self.rating,
            "is_active": self.is_active,
        }


class HospitalService(db.Model):
    __tablename__ = "hospital_services"

    id = db.Column(db.Integer, primary_key=True)
    hospital_id = db.Column(
        db.Integer,
        db.ForeignKey("hospitals.id", ondelete="CASCADE"),
        nullable=False,
    )
    service_name = db.Column(db.String(255), nullable=False)

    hospital = db.relationship("Hospital", back_populates="services")

    def to_dict(self):
        return {"id": self.id, "service_name": self.service_name}


class Doctor(db.Model):
    __tablename__ = "doctors"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    specialization = db.Column(db.String(255), nullable=True)
    qualification = db.Column(db.String(255), nullable=True)
    experience_years = db.Column(db.Integer, nullable=True)
    consultation_fee = db.Column(db.Float, nullable=True)
    languages = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    rating = db.Column(db.Float, nullable=True)
    registration_number = db.Column(db.String(100), nullable=True, unique=True)
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    user = db.relationship("User", foreign_keys=[user_id])

    hospital_affiliations = db.relationship(
        "DoctorHospitalAffiliation",
        back_populates="doctor",
        cascade="all, delete-orphan",
    )

    appointment_slots = db.relationship(
        "AppointmentSlot",
        back_populates="doctor",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "full_name": self.user.full_name if self.user else None,
            "email": self.user.email if self.user else None,
            "specialization": self.specialization,
            "qualification": self.qualification,
            "experience_years": self.experience_years,
            "consultation_fee": self.consultation_fee,
            "languages": self.languages,
            "bio": self.bio,
            "rating": self.rating,
            "is_available": self.is_available,
        }


class DoctorHospitalAffiliation(db.Model):
    __tablename__ = "doctor_hospital_affiliations"

    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(
        db.Integer,
        db.ForeignKey("doctors.id", ondelete="CASCADE"),
        nullable=False,
    )
    hospital_id = db.Column(
        db.Integer,
        db.ForeignKey("hospitals.id", ondelete="CASCADE"),
        nullable=False,
    )
    is_primary = db.Column(db.Boolean, default=False)

    __table_args__ = (
        db.UniqueConstraint("doctor_id", "hospital_id", name="uq_doctor_hospital"),
    )

    doctor = db.relationship("Doctor", back_populates="hospital_affiliations")
    hospital = db.relationship("Hospital", back_populates="doctor_affiliations")


class AppointmentSlot(db.Model):
    __tablename__ = "appointment_slots"

    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(
        db.Integer,
        db.ForeignKey("doctors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    slot_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    is_available = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        db.UniqueConstraint(
            "doctor_id", "slot_date", "start_time",
            name="uq_doctor_slot",
        ),
    )

    doctor = db.relationship("Doctor", back_populates="appointment_slots")
    appointment = db.relationship(
        "Appointment",
        back_populates="slot",
        uselist=False,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "doctor_id": self.doctor_id,
            "slot_date": self.slot_date.isoformat() if self.slot_date else None,
            "start_time": str(self.start_time),
            "end_time": str(self.end_time),
            "is_available": self.is_available,
        }


class Appointment(db.Model):
    __tablename__ = "appointments"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    doctor_id = db.Column(
        db.Integer,
        db.ForeignKey("doctors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    slot_id = db.Column(
        db.Integer,
        db.ForeignKey("appointment_slots.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,   # prevents double-booking at DB level
    )
    booked_by_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    # Status lifecycle
    status = db.Column(
        db.String(30),
        default="BOOKED",
        nullable=False,
        index=True,
    )
    # AVAILABLE→BOOKED→CONFIRMED→CANCELLED→COMPLETED→RESCHEDULED
    reason = db.Column(db.Text, nullable=True)
    cancellation_reason = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    appointment_date = db.Column(db.Date, nullable=True)
    appointment_time = db.Column(db.Time, nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    patient = db.relationship("Patient", back_populates="appointments")
    doctor = db.relationship("Doctor")
    slot = db.relationship("AppointmentSlot", back_populates="appointment")
    booked_by = db.relationship("User", foreign_keys=[booked_by_id])

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "patient_name": (
                self.patient.user.full_name
                if self.patient and self.patient.user
                else None
            ),
            "doctor_id": self.doctor_id,
            "doctor_name": (
                self.doctor.user.full_name
                if self.doctor and self.doctor.user
                else None
            ),
            "slot_id": self.slot_id,
            "status": self.status,
            "reason": self.reason,
            "notes": self.notes,
            "appointment_date": (
                self.appointment_date.isoformat()
                if self.appointment_date
                else None
            ),
            "appointment_time": str(self.appointment_time) if self.appointment_time else None,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
        }
