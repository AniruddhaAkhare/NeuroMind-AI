"""
Analytics endpoints for Recharts dashboards.
"""
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from sqlalchemy import func

from extensions import db
from database.models.prediction import PredictionHistory
from database.models.patient import Patient
from database.models.user import UserRole
from middleware.auth import require_roles

analytics_bp = Blueprint("analytics", __name__)

CLINICAL_ROLES = (
    UserRole.ADMIN.value,
    UserRole.DOCTOR.value,
    UserRole.RADIOLOGIST.value,
)

@analytics_bp.route("/analytics/dashboard", methods=["GET"])
@require_roles(*CLINICAL_ROLES)
def get_dashboard_analytics():
    """
    Returns aggregated metrics for the analytics dashboard (charts).
    """
    # 1. Total counts
    total_patients = Patient.query.filter_by(is_deleted=False).count()
    total_predictions = PredictionHistory.query.count()
    
    # 2. Stage Distribution (for Pie Chart)
    stage_counts = db.session.query(
        PredictionHistory.predicted_class, 
        func.count(PredictionHistory.id)
    ).group_by(PredictionHistory.predicted_class).all()
    
    stage_distribution = [
        {"name": cls, "value": count} for cls, count in stage_counts
    ]

    # 3. Risk Level Distribution (for Bar Chart)
    risk_counts = db.session.query(
        PredictionHistory.risk_level, 
        func.count(PredictionHistory.id)
    ).group_by(PredictionHistory.risk_level).all()
    
    risk_distribution = [
        {"name": lvl or "UNKNOWN", "value": count} for lvl, count in risk_counts
    ]

    # 4. Monthly Trend (last 6 months, for Line Chart)
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    try:
        if db.engine.name == 'sqlite':
            monthly_trend_query = db.session.query(
                func.strftime('%Y-%m', PredictionHistory.created_at).label('month'),
                func.count(PredictionHistory.id).label('count')
            ).filter(
                PredictionHistory.created_at >= six_months_ago
            ).group_by('month').order_by('month').all()
            monthly_trend = [
                {"month": str(month) if month else "Unknown", "predictions": count}
                for month, count in monthly_trend_query
            ]
        else:
            monthly_trend_query = db.session.query(
                func.date_trunc('month', PredictionHistory.created_at).label('month'),
                func.count(PredictionHistory.id).label('count')
            ).filter(
                PredictionHistory.created_at >= six_months_ago
            ).group_by('month').order_by('month').all()
            monthly_trend = [
                {"month": month.strftime("%Y-%m") if hasattr(month, "strftime") else str(month), "predictions": count}
                for month, count in monthly_trend_query
            ]
    except Exception:
        monthly_trend = []

    # 5. Gender Demographics
    gender_counts = db.session.query(
        Patient.gender, 
        func.count(Patient.id)
    ).filter_by(is_deleted=False).group_by(Patient.gender).all()
    
    gender_distribution = [
        {"name": gender or "Unknown", "value": count} for gender, count in gender_counts
    ]

    return jsonify({
        "success": True,
        "metrics": {
            "total_patients": total_patients,
            "total_predictions": total_predictions,
            "stage_distribution": stage_distribution,
            "risk_distribution": risk_distribution,
            "monthly_trend": monthly_trend,
            "gender_distribution": gender_distribution
        }
    }), 200
