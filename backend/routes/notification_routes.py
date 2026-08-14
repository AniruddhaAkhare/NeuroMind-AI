"""
Notification routes.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from extensions import db
from database.models.notification import Notification, EmergencyAlert
from middleware.auth import get_current_user

notification_bp = Blueprint("notification", __name__)


# ============================================================
# LIST NOTIFICATIONS (My Notifications)
# ============================================================

@notification_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    current_user = get_current_user()
    
    include_archived = request.args.get("archived", "false").lower() == "true"
    
    query = Notification.query.filter_by(user_id=current_user.id)
    if not include_archived:
        query = query.filter_by(is_archived=False)
        
    notifications = query.order_by(Notification.created_at.desc()).limit(50).all()
    
    return jsonify({
        "success": True,
        "notifications": [n.to_dict() for n in notifications]
    }), 200

# ============================================================
# MARK AS READ
# ============================================================

@notification_bp.route("/notifications/<int:notification_id>/read", methods=["PUT"])
@jwt_required()
def mark_as_read(notification_id):
    current_user = get_current_user()
    
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first()
    if not notification:
        return jsonify({"success": False, "error": "Notification not found"}), 404
        
    from datetime import datetime, timezone
    
    notification.is_read = True
    notification.read_at = datetime.now(timezone.utc)
    db.session.commit()
    
    return jsonify({"success": True}), 200

# ============================================================
# GET EMERGENCY ALERTS (Clinical Staff Only)
# ============================================================

@notification_bp.route("/alerts", methods=["GET"])
@jwt_required()
def get_alerts():
    current_user = get_current_user()
    
    # Only clinical staff see system-wide alerts
    if current_user.is_patient():
        return jsonify({"success": False, "error": "Access denied"}), 403
        
    unacknowledged_only = request.args.get("unacknowledged_only", "true").lower() == "true"
    
    query = EmergencyAlert.query
    if unacknowledged_only:
        query = query.filter_by(is_acknowledged=False)
        
    alerts = query.order_by(EmergencyAlert.created_at.desc()).limit(20).all()
    
    return jsonify({
        "success": True,
        "alerts": [a.to_dict() for a in alerts]
    }), 200

# ============================================================
# ACKNOWLEDGE ALERT
# ============================================================

@notification_bp.route("/alerts/<int:alert_id>/acknowledge", methods=["PUT"])
@jwt_required()
def acknowledge_alert(alert_id):
    current_user = get_current_user()
    
    if current_user.is_patient():
        return jsonify({"success": False, "error": "Access denied"}), 403
        
    alert = EmergencyAlert.query.get(alert_id)
    if not alert:
        return jsonify({"success": False, "error": "Alert not found"}), 404
        
    from datetime import datetime, timezone
    
    alert.is_acknowledged = True
    alert.acknowledged_by_id = current_user.id
    alert.acknowledged_at = datetime.now(timezone.utc)
    
    db.session.commit()
    
    from middleware.audit import log_event
    log_event("ALERT_ACKNOWLEDGED", actor=current_user, target_type="alert", target_id=alert_id)
    
    return jsonify({"success": True}), 200
