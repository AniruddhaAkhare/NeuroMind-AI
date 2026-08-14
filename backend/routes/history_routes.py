"""
Prediction history routes.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from extensions import db
from database.models.prediction import PredictionHistory
from database.models.patient import Patient
from middleware.auth import get_current_user, require_roles
from database.models.user import UserRole
from middleware.audit import log_event

history_bp = Blueprint("history", __name__)


# ============================================================
# GET HISTORY
# ============================================================

@history_bp.route("/history", methods=["GET"])
@jwt_required()
def get_history():
    current_user = get_current_user()
    
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    search = request.args.get("search", "", type=str)
    class_filter = request.args.get("class_filter", "", type=str)
    sort_by = request.args.get("sort_by", "desc", type=str)
    patient_id = request.args.get("patient_id", type=int)

    query = PredictionHistory.query

    # RBAC logic for history access
    if current_user.is_patient():
        # Patient can only see their own history, or history uploaded by them
        patient_profile = Patient.query.filter_by(user_id=current_user.id).first()
        if patient_profile:
            query = query.filter(
                db.or_(
                    PredictionHistory.patient_id == patient_profile.id,
                    PredictionHistory.uploaded_by_id == current_user.id
                )
            )
        else:
            query = query.filter_by(uploaded_by_id=current_user.id)
    else:
        # Clinical staff can filter by patient
        if patient_id:
            query = query.filter_by(patient_id=patient_id)

    if search:
        query = query.filter(PredictionHistory.image_filename.ilike(f"%{search}%"))
    
    if class_filter and class_filter != "All":
        query = query.filter(PredictionHistory.predicted_class == class_filter)

    if sort_by == "asc":
        query = query.order_by(PredictionHistory.created_at.asc())
    else:
        query = query.order_by(PredictionHistory.created_at.desc())

    paginated = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "success": True,
        "records": [item.to_dict() for item in paginated.items],
        "total": paginated.total,
        "page": paginated.page,
        "pages": paginated.pages,
        "per_page": paginated.per_page
    }), 200


# ============================================================
# GET SINGLE PREDICTION DETAIL
# ============================================================

@history_bp.route("/history/<int:id>", methods=["GET"])
@jwt_required()
def get_prediction_detail(id):
    current_user = get_current_user()
    prediction = PredictionHistory.query.get(id)
    
    if not prediction:
        return jsonify({"success": False, "error": f"Prediction record #{id} not found"}), 404

    # RBAC check
    if current_user.is_patient():
        patient_profile = Patient.query.filter_by(user_id=current_user.id).first()
        allowed = (
            prediction.uploaded_by_id == current_user.id or
            (patient_profile and prediction.patient_id == patient_profile.id)
        )
        if not allowed:
            return jsonify({"success": False, "error": "Access denied"}), 403

    return jsonify({
        "success": True,
        "prediction": prediction.to_dict()
    }), 200


# ============================================================
# DELETE PREDICTION
# ============================================================

@history_bp.route("/history/<int:id>", methods=["DELETE"])
@require_roles(UserRole.ADMIN.value, UserRole.DOCTOR.value)
def delete_prediction(id):
    current_user = get_current_user()
    prediction = PredictionHistory.query.get(id)
    
    if not prediction:
        return jsonify({"success": False, "error": f"Prediction record #{id} not found"}), 404

    db.session.delete(prediction)
    db.session.commit()

    log_event("PREDICTION_DELETED", actor=current_user, target_type="prediction", target_id=id)

    return jsonify({
        "success": True,
        "message": f"Prediction #{id} deleted successfully"
    }), 200


# ============================================================
# GLOBAL STATS (Moved to analytics later, keeping for compat)
# ============================================================

@history_bp.route("/stats", methods=["GET"])
@require_roles(UserRole.ADMIN.value, UserRole.DOCTOR.value, UserRole.RADIOLOGIST.value)
def get_stats():
    total_predictions = PredictionHistory.query.count()
    
    avg_confidence = db.session.query(func.avg(PredictionHistory.confidence)).scalar() or 0.0
    
    counts = db.session.query(
        PredictionHistory.predicted_class, 
        func.count(PredictionHistory.id)
    ).group_by(PredictionHistory.predicted_class).all()

    class_counts = {
        "NonDemented": 0,
        "VeryMildDemented": 0,
        "MildDemented": 0,
        "ModerateDemented": 0
    }

    for cls, count in counts:
        if cls in class_counts:
            class_counts[cls] = count

    recent_query = PredictionHistory.query.order_by(PredictionHistory.created_at.desc()).limit(5).all()
    recent_predictions = [item.to_dict() for item in recent_query]

    most_common = max(class_counts, key=class_counts.get) if total_predictions > 0 else "None"

    return jsonify({
        "success": True,
        "total_predictions": total_predictions,
        "average_confidence": round(float(avg_confidence), 4),
        "most_common_class": most_common,
        "class_counts": class_counts,
        "recent_predictions": recent_predictions
    }), 200
