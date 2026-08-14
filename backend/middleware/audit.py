"""
Audit logging middleware — helper to log events.
"""
from flask import request

from extensions import db
from database.models.audit import AuditLog


def log_event(
    action: str,
    actor=None,
    target_type: str = None,
    target_id: int = None,
    metadata: dict = None,
):
    """
    Persist an audit log entry.

    Args:
        action: Event identifier e.g. 'USER_LOGIN', 'PATIENT_CREATE'
        actor: User model instance (or None for anonymous)
        target_type: e.g. 'patient', 'prediction', 'report'
        target_id: PK of the target object
        metadata: Extra key-value data (not for sensitive medical content)
    """
    try:
        entry = AuditLog(
            actor_id=actor.id if actor else None,
            actor_role=actor.role if actor else None,
            actor_email=actor.email if actor else None,
            action=action,
            target_type=target_type,
            target_id=target_id,
            ip_address=request.remote_addr if request else None,
            user_agent=(
                request.user_agent.string[:512]
                if request and request.user_agent
                else None
            ),
            metadata=metadata,
        )
        db.session.add(entry)
        db.session.commit()
    except Exception as exc:
        # Audit logging must never break the main request
        db.session.rollback()
        print(f"[AUDIT] Failed to log event '{action}': {exc}")
