from flask import Blueprint, request, jsonify

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)

from extensions import db
from database.models import User


auth_bp = Blueprint(
    "auth",
    __name__
)


# ============================================================
# SIGNUP
# ============================================================

@auth_bp.route(
    "/auth/signup",
    methods=["POST"]
)
def signup():

    data = request.get_json(
        silent=True
    ) or {}

    full_name = (
        data.get("full_name") or ""
    ).strip()

    email = (
        data.get("email") or ""
    ).strip().lower()

    password = (
        data.get("password") or ""
    )

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    if not full_name:
        return jsonify({
            "success": False,
            "error": "Full name is required."
        }), 400

    if not email:
        return jsonify({
            "success": False,
            "error": "Email is required."
        }), 400

    if not password:
        return jsonify({
            "success": False,
            "error": "Password is required."
        }), 400

    if len(password) < 8:
        return jsonify({
            "success": False,
            "error": (
                "Password must contain at least "
                "8 characters."
            )
        }), 400

    # --------------------------------------------------------
    # CHECK EXISTING USER
    # --------------------------------------------------------

    existing_user = User.query.filter_by(
        email=email
    ).first()

    if existing_user:

        return jsonify({
            "success": False,
            "error": (
                "An account with this email "
                "already exists."
            )
        }), 409

    # --------------------------------------------------------
    # CREATE USER
    # --------------------------------------------------------

    password_hash = generate_password_hash(
        password
    )

    user = User(
        full_name=full_name,
        email=email,
        password_hash=password_hash
    )

    db.session.add(user)
    db.session.commit()

    # --------------------------------------------------------
    # CREATE TOKEN
    # --------------------------------------------------------

    access_token = create_access_token(
        identity=str(user.id)
    )

    return jsonify({
        "success": True,
        "message": "Account created successfully.",
        "access_token": access_token,
        "user": user.to_dict()
    }), 201


# ============================================================
# LOGIN
# ============================================================

@auth_bp.route(
    "/auth/login",
    methods=["POST"]
)
def login():

    data = request.get_json(
        silent=True
    ) or {}

    email = (
        data.get("email") or ""
    ).strip().lower()

    password = (
        data.get("password") or ""
    )

    if not email or not password:

        return jsonify({
            "success": False,
            "error": (
                "Email and password are required."
            )
        }), 400

    user = User.query.filter_by(
        email=email
    ).first()

    if not user or not check_password_hash(
        user.password_hash,
        password
    ):

        return jsonify({
            "success": False,
            "error": "Invalid email or password."
        }), 401

    access_token = create_access_token(
        identity=str(user.id)
    )

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "access_token": access_token,
        "user": user.to_dict()
    }), 200


# ============================================================
# CURRENT USER
# ============================================================

@auth_bp.route(
    "/auth/me",
    methods=["GET"]
)
@jwt_required()
def current_user():

    user_id = get_jwt_identity()

    user = User.query.get(
        int(user_id)
    )

    if not user:

        return jsonify({
            "success": False,
            "error": "User not found."
        }), 404

    return jsonify({
        "success": True,
        "user": user.to_dict()
    }), 200