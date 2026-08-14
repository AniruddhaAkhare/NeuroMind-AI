"""
Patient management routes — CRUD with RBAC.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from database.models.user import User, UserRole
from database.models.patient import (
    Patient, MedicalHistory, FamilyHistory,
    LifestyleInformation, Medication, ClinicalNote, CognitiveAssessment,
)
from middleware.auth import require_roles, get_current_user
from middleware.audit import log_event

patient_bp = Blueprint("patient", __name__)

CLINICAL_ROLES = (
    UserRole.ADMIN.value,
    UserRole.DOCTOR.value,
    UserRole.RADIOLOGIST.value,
    UserRole.LAB_TECHNICIAN.value,
    UserRole.RECEPTIONIST.value,
)


def _get_patient_or_404(patient_id):
    patient = Patient.query.filter_by(id=patient_id, is_deleted=False).first()
    if not patient:
        return None, jsonify({"success": False, "error": f"Patient #{patient_id} not found."}), 404
    return patient, None, None


def _check_patient_access(current_user, patient):
    """Returns True if user can access this patient's data."""
    if current_user.role in CLINICAL_ROLES:
        return True
    # Patients can only see their own record
    if current_user.role == UserRole.PATIENT.value:
        return (
            patient.user_id == current_user.id
        )
    return False


# ============================================================
# LIST / SEARCH PATIENTS
# ============================================================

@patient_bp.route("/patients", methods=["GET"])
@require_roles(*CLINICAL_ROLES)
def list_patients():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    search = request.args.get("search", "", type=str)

    query = Patient.query.filter_by(is_deleted=False)

    if search:
        query = query.join(User).filter(
            db.or_(
                User.full_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
            )
        )

    paginated = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "success": True,
        "patients": [p.to_dict() for p in paginated.items],
        "total": paginated.total,
        "page": paginated.page,
        "pages": paginated.pages,
        "per_page": paginated.per_page,
    }), 200


# ============================================================
# MY PROFILE (patient self-view)
# ============================================================

@patient_bp.route("/patients/me", methods=["GET"])
@jwt_required()
def my_patient_profile():
    user = get_current_user()
    patient = Patient.query.filter_by(user_id=user.id, is_deleted=False).first()
    if not patient:
        return jsonify({"success": False, "error": "Patient profile not found."}), 404
    return jsonify({"success": True, "patient": patient.to_dict()}), 200


# ============================================================
# GET SINGLE PATIENT
# ============================================================

@patient_bp.route("/patients/<int:patient_id>", methods=["GET"])
@jwt_required()
def get_patient(patient_id):
    current_user = get_current_user()
    patient, err, code = _get_patient_or_404(patient_id)
    if err:
        return err, code

    if not _check_patient_access(current_user, patient):
        return jsonify({"success": False, "error": "Access denied."}), 403

    return jsonify({"success": True, "patient": patient.to_dict()}), 200


# ============================================================
# CREATE PATIENT (admin / receptionist)
# ============================================================

@patient_bp.route("/patients", methods=["POST"])
@require_roles(UserRole.ADMIN.value, UserRole.RECEPTIONIST.value)
def create_patient():
    data = request.get_json(silent=True) or {}
    current_user = get_current_user()

    # Create User account first
    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password", "NeuroMind@123")   # Temp password

    if not full_name or not email:
        return jsonify({"success": False, "error": "full_name and email are required."}), 400

    from werkzeug.security import generate_password_hash
    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "error": "Email already exists."}), 409

    user = User(
        full_name=full_name,
        email=email,
        password_hash=generate_password_hash(password),
        role=UserRole.PATIENT.value,
        phone=data.get("phone"),
    )
    db.session.add(user)
    db.session.flush()  # get user.id without committing

    patient = Patient(
        user_id=user.id,
        date_of_birth=data.get("date_of_birth"),
        gender=data.get("gender"),
        blood_group=data.get("blood_group"),
        nationality=data.get("nationality"),
        address=data.get("address"),
        emergency_contact_name=data.get("emergency_contact_name"),
        emergency_contact_phone=data.get("emergency_contact_phone"),
        emergency_contact_relation=data.get("emergency_contact_relation"),
        primary_diagnosis=data.get("primary_diagnosis"),
        assigned_doctor_id=data.get("assigned_doctor_id"),
    )
    db.session.add(patient)
    db.session.commit()

    log_event("PATIENT_CREATE", actor=current_user, target_type="patient", target_id=patient.id)

    return jsonify({"success": True, "patient": patient.to_dict()}), 201


# ============================================================
# UPDATE PATIENT
# ============================================================

@patient_bp.route("/patients/<int:patient_id>", methods=["PUT"])
@jwt_required()
def update_patient(patient_id):
    current_user = get_current_user()
    patient, err, code = _get_patient_or_404(patient_id)
    if err:
        return err, code

    if not _check_patient_access(current_user, patient):
        return jsonify({"success": False, "error": "Access denied."}), 403

    data = request.get_json(silent=True) or {}
    allowed = [
        "date_of_birth", "gender", "blood_group", "nationality",
        "address", "emergency_contact_name", "emergency_contact_phone",
        "emergency_contact_relation", "primary_diagnosis", "assigned_doctor_id",
    ]
    for field in allowed:
        if field in data:
            setattr(patient, field, data[field])

    db.session.commit()
    log_event("PATIENT_UPDATE", actor=current_user, target_type="patient", target_id=patient.id)

    return jsonify({"success": True, "patient": patient.to_dict()}), 200


# ============================================================
# SOFT DELETE PATIENT
# ============================================================

@patient_bp.route("/patients/<int:patient_id>", methods=["DELETE"])
@require_roles(UserRole.ADMIN.value)
def delete_patient(patient_id):
    current_user = get_current_user()
    patient, err, code = _get_patient_or_404(patient_id)
    if err:
        return err, code

    patient.is_deleted = True
    db.session.commit()

    log_event("PATIENT_DELETE", actor=current_user, target_type="patient", target_id=patient.id)

    return jsonify({"success": True, "message": f"Patient #{patient_id} deleted."}), 200


# ============================================================
# MEDICAL HISTORY
# ============================================================

@patient_bp.route("/patients/<int:patient_id>/medical-history", methods=["GET"])
@jwt_required()
def get_medical_history(patient_id):
    current_user = get_current_user()
    patient, err, code = _get_patient_or_404(patient_id)
    if err:
        return err, code
    if not _check_patient_access(current_user, patient):
        return jsonify({"success": False, "error": "Access denied."}), 403

    records = patient.medical_history.all()
    return jsonify({"success": True, "records": [r.to_dict() for r in records]}), 200


@patient_bp.route("/patients/<int:patient_id>/medical-history", methods=["POST"])
@require_roles(*CLINICAL_ROLES)
def add_medical_history(patient_id):
    current_user = get_current_user()
    patient, err, code = _get_patient_or_404(patient_id)
    if err:
        return err, code

    data = request.get_json(silent=True) or {}
    if not data.get("condition"):
        return jsonify({"success": False, "error": "condition is required."}), 400

    record = MedicalHistory(
        patient_id=patient.id,
        condition=data["condition"],
        diagnosis_date=data.get("diagnosis_date"),
        status=data.get("status", "Active"),
        notes=data.get("notes"),
    )
    db.session.add(record)
    db.session.commit()
    log_event("MEDICAL_HISTORY_ADD", actor=current_user, target_type="patient", target_id=patient_id)
    return jsonify({"success": True, "record": record.to_dict()}), 201


# ============================================================
# FAMILY HISTORY
# ============================================================

@patient_bp.route("/patients/<int:patient_id>/family-history", methods=["GET"])
@jwt_required()
def get_family_history(patient_id):
    current_user = get_current_user()
    patient, err, code = _get_patient_or_404(patient_id)
    if err:
        return err, code
    if not _check_patient_access(current_user, patient):
        return jsonify({"success": False, "error": "Access denied."}), 403

    records = patient.family_history.all()
    return jsonify({"success": True, "records": [r.to_dict() for r in records]}), 200


@patient_bp.route("/patients/<int:patient_id>/family-history", methods=["POST"])
@require_roles(*CLINICAL_ROLES)
def add_family_history(patient_id):
    current_user = get_current_user()
    patient, err, code = _get_patient_or_404(patient_id)
    if err:
        return err, code

    data = request.get_json(silent=True) or {}
    record = FamilyHistory(
        patient_id=patient.id,
        relation=data.get("relation", "Unknown"),
        condition=data.get("condition", ""),
        age_of_onset=data.get("age_of_onset"),
        notes=data.get("notes"),
    )
    db.session.add(record)
    db.session.commit()
    return jsonify({"success": True, "record": record.to_dict()}), 201


# ============================================================
# LIFESTYLE
# ============================================================

@patient_bp.route("/patients/<int:patient_id>/lifestyle", methods=["GET"])
@jwt_required()
def get_lifestyle(patient_id):
    current_user = get_current_user()
    patient, err, code = _get_patient_or_404(patient_id)
    if err:
        return err, code
    if not _check_patient_access(current_user, patient):
        return jsonify({"success": False, "error": "Access denied."}), 403

    lifestyle = patient.lifestyle
    return jsonify({"success": True, "lifestyle": lifestyle.to_dict() if lifestyle else None}), 200


@patient_bp.route("/patients/<int:patient_id>/lifestyle", methods=["PUT"])
@jwt_required()
def upsert_lifestyle(patient_id):
    current_user = get_current_user()
    patient, err, code = _get_patient_or_404(patient_id)
    if err:
        return err, code
    if not _check_patient_access(current_user, patient):
        return jsonify({"success": False, "error": "Access denied."}), 403

    data = request.get_json(silent=True) or {}
    lifestyle = patient.lifestyle or LifestyleInformation(patient_id=patient.id)
    fields = [
        "smoking_status", "alcohol_use", "exercise_frequency",
        "diet_type", "sleep_hours_per_night", "stress_level",
        "occupation", "education_level", "notes",
    ]
    for field in fields:
        if field in data:
            setattr(lifestyle, field, data[field])

    if not lifestyle.id:
        db.session.add(lifestyle)
    db.session.commit()

    return jsonify({"success": True, "lifestyle": lifestyle.to_dict()}), 200


# ============================================================
# MEDICATIONS
# ============================================================

@patient_bp.route("/patients/<int:patient_id>/medications", methods=["GET"])
@jwt_required()
def get_medications(patient_id):
    current_user = get_current_user()
    patient, err, code = _get_patient_or_404(patient_id)
    if err:
        return err, code
    if not _check_patient_access(current_user, patient):
        return jsonify({"success": False, "error": "Access denied."}), 403

    meds = patient.medications.filter_by(is_active=True).all()
    return jsonify({"success": True, "medications": [m.to_dict() for m in meds]}), 200


@patient_bp.route("/patients/<int:patient_id>/medications", methods=["POST"])
@require_roles(*CLINICAL_ROLES)
def add_medication(patient_id):
    current_user = get_current_user()
    patient, err, code = _get_patient_or_404(patient_id)
    if err:
        return err, code

    data = request.get_json(silent=True) or {}
    if not data.get("name"):
        return jsonify({"success": False, "error": "Medication name is required."}), 400

    med = Medication(
        patient_id=patient.id,
        name=data["name"],
        dosage=data.get("dosage"),
        frequency=data.get("frequency"),
        prescribing_doctor=data.get("prescribing_doctor"),
        start_date=data.get("start_date"),
        end_date=data.get("end_date"),
        notes=data.get("notes"),
    )
    db.session.add(med)
    db.session.commit()
    return jsonify({"success": True, "medication": med.to_dict()}), 201


# ============================================================
# CLINICAL NOTES
# ============================================================

@patient_bp.route("/patients/<int:patient_id>/notes", methods=["GET"])
@jwt_required()
def get_clinical_notes(patient_id):
    current_user = get_current_user()
    patient, err, code = _get_patient_or_404(patient_id)
    if err:
        return err, code
    if not _check_patient_access(current_user, patient):
        return jsonify({"success": False, "error": "Access denied."}), 403

    notes = patient.clinical_notes.filter_by(is_deleted=False).order_by(
        ClinicalNote.created_at.desc()
    ).all()
    return jsonify({"success": True, "notes": [n.to_dict() for n in notes]}), 200


@patient_bp.route("/patients/<int:patient_id>/notes", methods=["POST"])
@require_roles(UserRole.ADMIN.value, UserRole.DOCTOR.value, UserRole.RADIOLOGIST.value)
def add_clinical_note(patient_id):
    current_user = get_current_user()
    patient, err, code = _get_patient_or_404(patient_id)
    if err:
        return err, code

    data = request.get_json(silent=True) or {}
    if not data.get("content"):
        return jsonify({"success": False, "error": "Note content is required."}), 400

    note = ClinicalNote(
        patient_id=patient.id,
        author_id=current_user.id,
        note_type=data.get("note_type", "General"),
        content=data["content"],
    )
    db.session.add(note)
    db.session.commit()
    log_event("CLINICAL_NOTE_ADD", actor=current_user, target_type="patient", target_id=patient_id)
    return jsonify({"success": True, "note": note.to_dict()}), 201


# ============================================================
# COGNITIVE ASSESSMENTS
# ============================================================

@patient_bp.route("/patients/<int:patient_id>/cognitive-assessments", methods=["GET"])
@jwt_required()
def get_cognitive_assessments(patient_id):
    current_user = get_current_user()
    patient, err, code = _get_patient_or_404(patient_id)
    if err:
        return err, code
    if not _check_patient_access(current_user, patient):
        return jsonify({"success": False, "error": "Access denied."}), 403

    assessments = patient.cognitive_assessments.order_by(CognitiveAssessment.assessment_date.desc()).all()
    return jsonify({"success": True, "assessments": [a.to_dict() for a in assessments]}), 200


@patient_bp.route("/patients/<int:patient_id>/cognitive-assessments", methods=["POST"])
@require_roles(UserRole.ADMIN.value, UserRole.DOCTOR.value)
def add_cognitive_assessment(patient_id):
    current_user = get_current_user()
    patient, err, code = _get_patient_or_404(patient_id)
    if err:
        return err, code

    data = request.get_json(silent=True) or {}
    assessment = CognitiveAssessment(
        patient_id=patient.id,
        administered_by_id=current_user.id,
        assessment_type=data.get("assessment_type", "MMSE"),
        score=data.get("score"),
        max_score=data.get("max_score"),
        interpretation=data.get("interpretation"),
        notes=data.get("notes"),
        assessment_date=data.get("assessment_date"),
    )
    db.session.add(assessment)
    db.session.commit()
    return jsonify({"success": True, "assessment": assessment.to_dict()}), 201
