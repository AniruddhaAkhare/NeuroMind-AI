"""
Appointment scheduling routes.
"""
from datetime import datetime, date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from extensions import db
from database.models.appointment import Appointment, AppointmentSlot, Doctor
from database.models.patient import Patient
from database.models.user import UserRole
from middleware.auth import get_current_user, require_roles
from middleware.audit import log_event
from sqlalchemy.exc import IntegrityError

appointment_bp = Blueprint("appointment", __name__)

CLINICAL_ROLES = (UserRole.ADMIN.value, UserRole.RECEPTIONIST.value, UserRole.DOCTOR.value)

# ============================================================
# GET APPOINTMENT SLOTS FOR DOCTOR
# ============================================================

@appointment_bp.route("/appointments/slots/<int:doctor_id>", methods=["GET"])
@jwt_required()
def get_slots(doctor_id):
    """
    Get available appointment slots for a specific doctor on a given date.
    """
    slot_date_str = request.args.get("date")
    if not slot_date_str:
        # Default to today
        target_date = date.today()
    else:
        try:
            target_date = datetime.strptime(slot_date_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"success": False, "error": "Invalid date format. Use YYYY-MM-DD"}), 400

    slots = AppointmentSlot.query.filter_by(
        doctor_id=doctor_id, 
        slot_date=target_date,
        is_available=True
    ).order_by(AppointmentSlot.start_time).all()

    return jsonify({
        "success": True,
        "date": str(target_date),
        "slots": [slot.to_dict() for slot in slots]
    }), 200

# ============================================================
# BOOK APPOINTMENT
# ============================================================

@appointment_bp.route("/appointments/book", methods=["POST"])
@jwt_required()
def book_appointment():
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}
    
    slot_id = data.get("slot_id")
    patient_id = data.get("patient_id")
    reason = data.get("reason", "")
    
    if not slot_id or not patient_id:
        return jsonify({"success": False, "error": "slot_id and patient_id are required"}), 400
        
    # Access check for patient
    if current_user.is_patient():
        patient_profile = Patient.query.filter_by(user_id=current_user.id).first()
        if not patient_profile or patient_profile.id != int(patient_id):
            return jsonify({"success": False, "error": "You can only book appointments for yourself"}), 403

    slot = AppointmentSlot.query.get(slot_id)
    if not slot or not slot.is_available:
        return jsonify({"success": False, "error": "Slot is no longer available"}), 400
        
    # Transaction to prevent double booking
    try:
        appt = Appointment(
            patient_id=patient_id,
            doctor_id=slot.doctor_id,
            slot_id=slot_id,
            booked_by_id=current_user.id,
            status="BOOKED",
            reason=reason,
            appointment_date=slot.slot_date,
            appointment_time=slot.start_time
        )
        
        slot.is_available = False
        
        db.session.add(appt)
        db.session.commit()
        
        log_event("APPOINTMENT_BOOKED", actor=current_user, target_type="appointment", target_id=appt.id)
        
        return jsonify({
            "success": True,
            "message": "Appointment booked successfully",
            "appointment": appt.to_dict()
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({"success": False, "error": "This slot was just taken. Please select another."}), 409

# ============================================================
# LIST MY APPOINTMENTS
# ============================================================

@appointment_bp.route("/appointments", methods=["GET"])
@jwt_required()
def list_appointments():
    current_user = get_current_user()
    
    # If patient, only show their appointments
    if current_user.is_patient():
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        if not patient:
            return jsonify({"success": True, "appointments": []}), 200
        appointments = Appointment.query.filter_by(patient_id=patient.id).order_by(Appointment.appointment_date.desc()).all()
        
    # If doctor, only show their schedule
    elif current_user.is_doctor():
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        if not doctor:
            return jsonify({"success": True, "appointments": []}), 200
        appointments = Appointment.query.filter_by(doctor_id=doctor.id).order_by(Appointment.appointment_date.desc()).all()
        
    # Admin/Receptionist see all (can filter)
    else:
        date_filter = request.args.get("date")
        query = Appointment.query
        if date_filter:
            query = query.filter_by(appointment_date=date_filter)
        appointments = query.order_by(Appointment.appointment_date.desc()).all()

    return jsonify({
        "success": True,
        "appointments": [a.to_dict() for a in appointments]
    }), 200

# ============================================================
# CANCEL APPOINTMENT
# ============================================================

@appointment_bp.route("/appointments/<int:appointment_id>/cancel", methods=["POST"])
@jwt_required()
def cancel_appointment(appointment_id):
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}
    
    appt = Appointment.query.get(appointment_id)
    if not appt:
        return jsonify({"success": False, "error": "Appointment not found"}), 404
        
    # Access check
    if current_user.is_patient():
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        if not patient or appt.patient_id != patient.id:
            return jsonify({"success": False, "error": "Access denied"}), 403
            
    if appt.status in ["CANCELLED", "COMPLETED"]:
        return jsonify({"success": False, "error": f"Cannot cancel appointment with status {appt.status}"}), 400
        
    # Free the slot
    if appt.slot:
        appt.slot.is_available = True
        
    appt.status = "CANCELLED"
    appt.cancellation_reason = data.get("reason", "Cancelled by user")
    
    db.session.commit()
    
    log_event("APPOINTMENT_CANCELLED", actor=current_user, target_type="appointment", target_id=appt.id)
    
    return jsonify({
        "success": True,
        "message": "Appointment cancelled successfully"
    }), 200
