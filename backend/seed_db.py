"""
NeuroMind AI / NEUROVIA — Database Seeding Script
Populates the database with realistic demo accounts, clinical profiles,
hospitals, doctor affiliations, appointment slots, and historical records.
Usage:
    python seed_db.py
"""
import sys
import os
from datetime import date, time as dtime, datetime, timedelta

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db
from database.models import (
    User, UserRole,
    Patient,
    Doctor, Hospital, DoctorHospitalAffiliation, AppointmentSlot,
    PredictionHistory,
    ClinicalReport,
    Notification,
)

from werkzeug.security import generate_password_hash

DEMO_USERS = [
    {
        "email": "admin@neuromind.ai",
        "full_name": "System Administrator",
        "role": UserRole.ADMIN.value,
        "password": "Password123!",
    },
    {
        "email": "doctor@neuromind.ai",
        "full_name": "Dr. Marcus Vance",
        "role": UserRole.DOCTOR.value,
        "password": "Password123!",
        "specialization": "Cognitive Neurology & Neuroimaging",
        "qualification": "MD, PhD, FAAN (Johns Hopkins)",
        "experience": 16,
        "fee": 250.0,
        "reg": "MD-NEURO-88491",
        "rating": 4.95,
    },
    {
        "email": "radiologist@neuromind.ai",
        "full_name": "Dr. Elena Rostova",
        "role": UserRole.RADIOLOGIST.value,
        "password": "Password123!",
        "specialization": "Neuroradiology & MRI Analytics",
        "qualification": "MD, DABR (Stanford Medicine)",
        "experience": 12,
        "fee": 220.0,
        "reg": "RAD-CA-55104",
        "rating": 4.90,
    },
    {
        "email": "patient@neuromind.ai",
        "full_name": "Arthur Pendelton",
        "role": UserRole.PATIENT.value,
        "password": "Password123!",
        "gender": "Male",
        "blood_group": "O+",
        "dob": date(1954, 8, 22),
        "diagnosis": "Mild Cognitive Impairment",
        "contact_name": "Eleanor Pendelton",
        "contact_phone": "+1-555-0192",
    },
]

DEMO_HOSPITALS = [
    {
        "name": "UCSF Memory and Aging Center",
        "address": "675 Nelson Rising Lane, Mission Bay",
        "city": "San Francisco",
        "state": "CA",
        "pincode": "94158",
        "country": "USA",
        "phone": "+1-415-476-6880",
        "email": "memory@ucsf.edu",
        "latitude": 37.7675,
        "longitude": -122.3929,
        "rating": 4.96,
        "is_active": True,
    },
    {
        "name": "Stanford Center for Memory Disorders",
        "address": "213 Quarry Road, Suite 200",
        "city": "Palo Alto",
        "state": "CA",
        "pincode": "94304",
        "country": "USA",
        "phone": "+1-650-723-6469",
        "email": "neuro@stanford.edu",
        "latitude": 37.4338,
        "longitude": -122.1763,
        "rating": 4.94,
        "is_active": True,
    },
    {
        "name": "Massachusetts General Hospital — Memory Division",
        "address": "55 Fruit Street",
        "city": "Boston",
        "state": "MA",
        "pincode": "02114",
        "country": "USA",
        "phone": "+1-617-726-2000",
        "email": "memorycare@mgh.harvard.edu",
        "latitude": 42.3631,
        "longitude": -71.0686,
        "rating": 4.98,
        "is_active": True,
    },
]


def seed_database():
    app = create_app()
    with app.app_context():
        print("=" * 60)
        print("  NEUROVIA / NEUROMIND AI — DATABASE SEEDING ENGINE")
        print("=" * 60)

        db.create_all()

        # 1. Seed Users & Profiles
        created_users = {}
        for udata in DEMO_USERS:
            user = User.query.filter_by(email=udata["email"]).first()
            p_hash = generate_password_hash(udata["password"])
            if not user:
                user = User(
                    email=udata["email"],
                    full_name=udata["full_name"],
                    role=udata["role"],
                    password_hash=p_hash,
                    is_active=True,
                )
                db.session.add(user)
                db.session.flush()
                print(f" [+] Created User: {user.email} [{user.role}]")
            else:
                user.password_hash = p_hash
                user.full_name = udata["full_name"]
                user.role = udata["role"]
                user.is_active = True
                print(f" [~] User Exists:  {user.email} (Password & details refreshed)")

            created_users[udata["email"]] = user

            # Profile creation
            if udata["role"] == UserRole.PATIENT.value:
                patient = Patient.query.filter_by(user_id=user.id).first()
                if not patient:
                    patient = Patient(
                        user_id=user.id,
                        gender=udata["gender"],
                        blood_group=udata["blood_group"],
                        date_of_birth=udata["dob"],
                        primary_diagnosis=udata["diagnosis"],
                        emergency_contact_name=udata["contact_name"],
                        emergency_contact_phone=udata["contact_phone"],
                    )
                    db.session.add(patient)
                    db.session.flush()
                    print(f"     [+] Created Patient Clinical Record (ID: {patient.id})")

            elif udata["role"] in (UserRole.DOCTOR.value, UserRole.RADIOLOGIST.value):
                doc = Doctor.query.filter_by(user_id=user.id).first()
                if not doc:
                    doc = Doctor(
                        user_id=user.id,
                        specialization=udata["specialization"],
                        qualification=udata["qualification"],
                        experience_years=udata["experience"],
                        consultation_fee=udata["fee"],
                        registration_number=udata["reg"],
                        rating=udata["rating"],
                        is_available=True,
                    )
                    db.session.add(doc)
                    db.session.flush()
                    print(f"     [+] Created Doctor Clinical Profile (ID: {doc.id})")

        # 2. Seed Hospitals
        hospital_records = []
        for hdata in DEMO_HOSPITALS:
            hosp = Hospital.query.filter_by(name=hdata["name"]).first()
            if not hosp:
                hosp = Hospital(**hdata)
                db.session.add(hosp)
                db.session.flush()
                print(f" [+] Created Hospital: {hosp.name} ({hosp.city}, {hosp.state})")
            hospital_records.append(hosp)

        # 3. Seed Affiliations
        doctor_user = created_users.get("doctor@neuromind.ai")
        if doctor_user:
            doc_profile = Doctor.query.filter_by(user_id=doctor_user.id).first()
            if doc_profile and hospital_records:
                for hosp in hospital_records[:2]:
                    affil = DoctorHospitalAffiliation.query.filter_by(
                        doctor_id=doc_profile.id,
                        hospital_id=hosp.id,
                    ).first()
                    if not affil:
                        affil = DoctorHospitalAffiliation(
                            doctor_id=doc_profile.id,
                            hospital_id=hosp.id,
                        )
                        db.session.add(affil)
                        print(f" [+] Affiliated {doctor_user.full_name} with {hosp.name}")

                # 4. Seed Slots for the next 7 days
                today = date.today()
                for day_offset in range(1, 8):
                    slot_date = today + timedelta(days=day_offset)
                    for start_h, start_m in [(9, 0), (10, 0), (11, 30), (14, 0), (15, 30)]:
                        start_t = dtime(start_h, start_m)
                        end_dt = datetime.combine(today, start_t) + timedelta(minutes=30)
                        existing_slot = AppointmentSlot.query.filter_by(
                            doctor_id=doc_profile.id,
                            slot_date=slot_date,
                            start_time=start_t,
                        ).first()
                        if not existing_slot:
                            new_slot = AppointmentSlot(
                                doctor_id=doc_profile.id,
                                slot_date=slot_date,
                                start_time=start_t,
                                end_time=end_dt.time(),
                                is_available=True,
                            )
                            db.session.add(new_slot)

        # 5. Seed Initial Notification
        patient_user = created_users.get("patient@neuromind.ai")
        if patient_user:
            notif = Notification.query.filter_by(user_id=patient_user.id).first()
            if not notif:
                notif = Notification(
                    user_id=patient_user.id,
                    title="Welcome to NEUROVIA",
                    message="Your cognitive health record has been initialized. You can schedule assessments and view diagnostic reports.",
                    notification_type="system",
                    is_read=False,
                )
                db.session.add(notif)
                print(f" [+] Added Welcome Notification for {patient_user.email}")

        db.session.commit()
        print("=" * 60)
        print("  DATABASE SEEDING COMPLETE! ALL TEST ENTITIES READY")
        print("=" * 60)
        print("\n  Pre-configured Role Credentials:")
        print("  - Admin:       admin@neuromind.ai       | Password123!")
        print("  - Doctor:      doctor@neuromind.ai      | Password123!")
        print("  - Radiologist: radiologist@neuromind.ai | Password123!")
        print("  - Patient:     patient@neuromind.ai     | Password123!\n")


if __name__ == "__main__":
    seed_database()
