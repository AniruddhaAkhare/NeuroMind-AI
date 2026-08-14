"""
Authentication routes — signup, login, refresh, logout, /me
"""
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)

from extensions import db, limiter
from database.models.user import User, UserRole
from middleware.audit import log_event


auth_bp = Blueprint("auth", __name__)


# ============================================================
# SIGNUP
# ============================================================

@auth_bp.route("/auth/signup", methods=["POST"])
@limiter.limit("10 per hour")
def signup():

    data = request.get_json(silent=True) or {}

    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "")
    role = (data.get("role") or UserRole.PATIENT.value).strip().lower()

    # ---- Validation ----------------------------------------

    if not full_name:
        return jsonify({"success": False, "error": "Full name is required."}), 400
    if not email:
        return jsonify({"success": False, "error": "Email is required."}), 400
    if not password:
        return jsonify({"success": False, "error": "Password is required."}), 400
    if len(password) < 8:
        return jsonify({"success": False, "error": "Password must be at least 8 characters."}), 400

    # Only allow patient self-registration via public signup
    # Admin/Doctor/Radiologist must be created by an admin
    allowed_self_register_roles = {UserRole.PATIENT.value}
    if role not in allowed_self_register_roles:
        role = UserRole.PATIENT.value

    # ---- Duplicate check -----------------------------------

    if User.query.filter_by(email=email).first():
        return jsonify({
            "success": False,
            "error": "An account with this email already exists.",
        }), 409

    # ---- Create user ---------------------------------------

    user = User(
        full_name=full_name,
        email=email,
        password_hash=generate_password_hash(password),
        role=role,
    )

    db.session.add(user)
    db.session.commit()

    # ---- Create patient profile if role is patient ---------
    if user.role == UserRole.PATIENT.value:
        from database.models.patient import Patient
        patient = Patient(user_id=user.id)
        db.session.add(patient)
        db.session.commit()

    # ---- Tokens --------------------------------------------
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    log_event("USER_SIGNUP", actor=user, metadata={"role": user.role})

    return jsonify({
        "success": True,
        "message": "Account created successfully.",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict(),
    }), 201


# ============================================================
# LOGIN
# ============================================================

@auth_bp.route("/auth/login", methods=["POST"])
@limiter.limit("20 per hour")
def login():

    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "")

    if not email or not password:
        return jsonify({"success": False, "error": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"success": False, "error": "Invalid email or password."}), 401

    if not user.is_active:
        return jsonify({"success": False, "error": "Account is deactivated. Contact an administrator."}), 403

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    log_event("USER_LOGIN", actor=user)

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict(),
    }), 200


# ============================================================
# REFRESH TOKEN
# ============================================================

@auth_bp.route("/auth/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user or not user.is_active:
        return jsonify({"success": False, "error": "User not found or inactive."}), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "success": True,
        "access_token": access_token,
    }), 200


# ============================================================
# CURRENT USER (/me)
# ============================================================

@auth_bp.route("/auth/me", methods=["GET"])
@jwt_required()
def current_user():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"success": False, "error": "User not found."}), 404

    return jsonify({"success": True, "user": user.to_dict()}), 200


# ============================================================
# UPDATE PROFILE
# ============================================================

@auth_bp.route("/auth/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"success": False, "error": "User not found."}), 404

    data = request.get_json(silent=True) or {}

    if "full_name" in data and data["full_name"].strip():
        user.full_name = data["full_name"].strip()

    if "phone" in data:
        user.phone = (data["phone"] or "").strip() or None

    db.session.commit()

    log_event("PROFILE_UPDATE", actor=user)

    return jsonify({"success": True, "user": user.to_dict()}), 200


# ============================================================
# CHANGE PASSWORD
# ============================================================

@auth_bp.route("/auth/change-password", methods=["POST"])
@jwt_required()
@limiter.limit("5 per hour")
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"success": False, "error": "User not found."}), 404

    data = request.get_json(silent=True) or {}
    current_password = data.get("current_password", "")
    new_password = data.get("new_password", "")

    if not check_password_hash(user.password_hash, current_password):
        return jsonify({"success": False, "error": "Current password is incorrect."}), 401

    if len(new_password) < 8:
        return jsonify({"success": False, "error": "New password must be at least 8 characters."}), 400

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()

    log_event("PASSWORD_CHANGED", actor=user)

    return jsonify({"success": True, "message": "Password changed successfully."}), 200