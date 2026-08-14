"""
RBAC middleware — decorator-based role authorization.
All role checks are enforced server-side.
"""
from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from database.models.user import User


def require_roles(*roles: str):
    """
    Decorator that enforces JWT authentication + role check.
    Usage:
        @require_roles("admin", "doctor")
        def my_endpoint(): ...
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # Verify JWT first
            verify_jwt_in_request()

            user_id = get_jwt_identity()
            user = User.query.get(int(user_id))

            if not user:
                return jsonify({
                    "success": False,
                    "error": "User not found.",
                }), 404

            if not user.is_active:
                return jsonify({
                    "success": False,
                    "error": "Account is deactivated. Contact an administrator.",
                }), 403

            if user.role not in roles:
                return jsonify({
                    "success": False,
                    "error": (
                        f"Access denied. Required role(s): {', '.join(roles)}. "
                        f"Your role: {user.role}."
                    ),
                }), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator


def get_current_user():
    """
    Helper: returns the authenticated User object.
    Must be called within a jwt_required context.
    """
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))


def get_current_user_or_none():
    """
    Helper: returns User or None without raising on missing token.
    """
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            return User.query.get(int(user_id))
    except Exception:
        pass
    return None
