"""
Prediction endpoints — handles MRI uploads and runs the ML model.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db, limiter
from services.model_service import ModelService
from services.gradcam_service import GradCAMService
from services.prediction_service import PredictionService
from middleware.audit import log_event
from middleware.auth import get_current_user
from database.models.patient import Patient

prediction_bp = Blueprint("prediction", __name__)

# ============================================================
# LOAD MODEL ONCE
# ============================================================

model_service = ModelService()
gradcam_service = GradCAMService(model_service)

# ============================================================
# PREDICTION ENDPOINT
# ============================================================

@prediction_bp.route("/predict", methods=["POST"])
@jwt_required()
@limiter.limit("20 per hour")
def predict():
    current_user = get_current_user()

    # --------------------------------------------------------
    # CHECK IMAGE
    # --------------------------------------------------------
    if "image" not in request.files:
        return jsonify({"success": False, "error": "No image file provided in request."}), 400

    file = request.files["image"]
    if not file or not file.filename:
        return jsonify({"success": False, "error": "No image selected."}), 400

    # Optional patient association
    patient_id = request.form.get("patient_id")
    if patient_id:
        # Verify patient exists and user has access
        patient = Patient.query.filter_by(id=patient_id, is_deleted=False).first()
        if not patient:
            return jsonify({"success": False, "error": f"Patient #{patient_id} not found."}), 404
        
        # Patients can only upload for themselves unless they are clinical staff
        if current_user.is_patient() and patient.user_id != current_user.id:
            return jsonify({"success": False, "error": "Access denied to this patient record."}), 403

    # --------------------------------------------------------
    # PROCESS PREDICTION
    # --------------------------------------------------------
    try:
        prediction_service = PredictionService(model_service, gradcam_service)
        
        result, error, status_code = prediction_service.process_prediction(
            file=file,
            patient_id=patient_id,
            uploaded_by_id=current_user.id,
            scan_type=request.form.get("scan_type", "MRI"),
            is_emergency=request.form.get("is_emergency", "false").lower() == "true"
        )

        if error:
            return jsonify({"success": False, "error": error}), status_code

        # Log event
        target_id = result.get("prediction", {}).get("id") if isinstance(result, dict) else None
        log_event("PREDICTION_GENERATED", actor=current_user, target_type="prediction", target_id=target_id)

        return jsonify(result), status_code

    except Exception as exc:
        print(f"Prediction endpoint error: {exc}")
        return jsonify({
            "success": False,
            "error": "An unexpected error occurred while processing the MRI."
        }), 500