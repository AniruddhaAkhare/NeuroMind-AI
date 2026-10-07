"""
Admin Blueprint — System audit logs, user role governance, and health diagnostics.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from extensions import db
from database.models.user import User, UserRole
from database.models.audit import AuditLog
from database.models.prediction import PredictionHistory
from database.models.patient import Patient
from middleware.auth import require_roles, get_current_user
from middleware.audit import log_event

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/admin/stats", methods=["GET"])
@jwt_required()
@require_roles(UserRole.ADMIN.value)
def get_admin_stats():
    """System-level statistics for administration."""
    total_users = User.query.filter_by(is_active=True).count()
    total_patients = Patient.query.filter_by(is_deleted=False).count()
    total_predictions = PredictionHistory.query.count()
    total_audit_events = AuditLog.query.count()

    users_by_role = {}
    for role in UserRole:
        users_by_role[role.value] = User.query.filter_by(role=role, is_active=True).count()

    return jsonify({
        "success": True,
        "stats": {
            "total_users": total_users,
            "total_patients": total_patients,
            "total_predictions": total_predictions,
            "total_audit_events": total_audit_events,
            "users_by_role": users_by_role,
        }
    }), 200


@admin_bp.route("/admin/audit-logs", methods=["GET"])
@jwt_required()
@require_roles(UserRole.ADMIN.value)
def get_audit_logs():
    """Retrieve immutable system audit trail with pagination and filtering."""
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    action_filter = request.args.get("action")

    query = AuditLog.query
    if action_filter:
        query = query.filter(AuditLog.action.ilike(f"%{action_filter}%"))

    query = query.order_by(AuditLog.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "success": True,
        "logs": [entry.to_dict() for entry in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": page,
    }), 200


@admin_bp.route("/admin/users", methods=["GET"])
@jwt_required()
@require_roles(UserRole.ADMIN.value)
def get_users_list():
    """Retrieve user accounts for administrative management."""
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    role_filter = request.args.get("role")

    query = User.query.filter_by(is_active=True)
    if role_filter:
        query = query.filter(User.role == role_filter)

    query = query.order_by(User.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "success": True,
        "users": [u.to_dict() for u in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": page,
    }), 200
