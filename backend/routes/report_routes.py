"""
Clinical report routes.
"""
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required

from extensions import db
from database.models.report import ClinicalReport
from database.models.prediction import PredictionHistory
from database.models.user import UserRole
from services.report_service import ReportService
from middleware.auth import get_current_user, require_roles
from middleware.audit import log_event
import os

report_bp = Blueprint("report", __name__)

CLINICAL_ROLES = (
    UserRole.ADMIN.value,
    UserRole.DOCTOR.value,
    UserRole.RADIOLOGIST.value,
)

# Initialize service globally for the blueprint
# (Instantiated per request in some architectures, but safe here if stateless)
report_service = None

def get_report_service():
    global report_service
    if not report_service:
        report_service = ReportService()
    return report_service

# ============================================================
# GENERATE OR GET REPORT FOR PREDICTION
# ============================================================

@report_bp.route("/reports/generate/<int:prediction_id>", methods=["POST"])
@jwt_required()
def generate_report(prediction_id):
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}
    
    prediction = PredictionHistory.query.get(prediction_id)
    if not prediction:
        return jsonify({"success": False, "error": "Prediction not found"}), 404

    # Access check: clinical roles can generate for all; patients for their own
    if current_user and current_user.is_patient():
        from database.models.patient import Patient
        patient_profile = Patient.query.filter_by(user_id=current_user.id).first()
        allowed = (
            prediction.uploaded_by_id == current_user.id or
            (patient_profile and prediction.patient_id == patient_profile.id)
        )
        if not allowed:
            return jsonify({"success": False, "error": "Access denied"}), 403

    clinical_observations = data.get("clinical_observations")
    recommendations = data.get("recommendations")
    
    service = get_report_service()
    report_dict, error, status = service.generate_report(
        prediction_id=prediction_id,
        user_id=current_user.id if current_user else None,
        clinical_observations=clinical_observations,
        recommendations=recommendations
    )
    
    if error:
        return jsonify({"success": False, "error": error}), status
        
    log_event("REPORT_GENERATED", actor=current_user, target_type="prediction", target_id=prediction_id)
    
    return jsonify({
        "success": True,
        "message": "Report generated successfully",
        "report": report_dict
    }), status

# ============================================================
# GET REPORT DETAILS
# ============================================================

@report_bp.route("/reports/<int:prediction_id>", methods=["GET"])
@jwt_required(optional=True)
def get_report(prediction_id):
    current_user = get_current_user()
    
    prediction = PredictionHistory.query.get(prediction_id)
    if not prediction:
        return jsonify({"success": False, "error": "Prediction not found"}), 404
        
    report = ClinicalReport.query.filter_by(prediction_id=prediction_id).first()
    if not report:
        # Generate on demand
        service = get_report_service()
        report_dict, error, status = service.generate_report(
            prediction_id=prediction_id,
            user_id=current_user.id if current_user else None
        )
        if error:
            return jsonify({"success": False, "error": error}), status
        return jsonify({"success": True, "report": report_dict}), 200
        
    return jsonify({
        "success": True,
        "report": report.to_dict()
    }), 200

# ============================================================
# DOWNLOAD PDF
# ============================================================
@report_bp.route("/reports/download/<int:prediction_id>", methods=["GET"])
@jwt_required(optional=True)
def download_pdf(prediction_id):
    current_user = get_current_user()
    
    prediction = PredictionHistory.query.get(prediction_id)
    if not prediction:
        return jsonify({"success": False, "error": "Prediction not found"}), 404
            
    report = ClinicalReport.query.filter_by(prediction_id=prediction_id).first()
    if not report or not report.pdf_path:
        service = get_report_service()
        report_dict, error, status = service.generate_report(
            prediction_id=prediction_id,
            user_id=current_user.id if current_user else None
        )
        if error:
            return jsonify({"success": False, "error": error}), status
        report = ClinicalReport.query.filter_by(prediction_id=prediction_id).first()

    if not report or not report.pdf_path:
        return jsonify({"success": False, "error": "Unable to generate or find PDF report"}), 500
        
    log_event("REPORT_DOWNLOADED", actor=current_user, target_type="report", target_id=report.id)
        
    filename = os.path.basename(report.pdf_path)
    return send_from_directory(
        current_app.config["REPORTS_FOLDER"], 
        filename, 
        as_attachment=True
    )
