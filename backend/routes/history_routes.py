from flask import Blueprint, jsonify, request
from database.models import PredictionHistory
from extensions import db
from sqlalchemy import func

history_bp = Blueprint('history', __name__)

@history_bp.route('/history', methods=['GET'])
def get_history():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '', type=str)
    class_filter = request.args.get('class_filter', '', type=str)
    sort_by = request.args.get('sort_by', 'desc', type=str)

    query = PredictionHistory.query

    if search:
        query = query.filter(PredictionHistory.image_filename.ilike(f'%{search}%'))
    
    if class_filter and class_filter != 'All':
        query = query.filter(PredictionHistory.predicted_class == class_filter)

    if sort_by == 'asc':
        query = query.order_by(PredictionHistory.created_at.asc())
    else:
        query = query.order_by(PredictionHistory.created_at.desc())

    paginated = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'success': True,
        'records': [item.to_dict() for item in paginated.items],
        'total': paginated.total,
        'page': paginated.page,
        'pages': paginated.pages,
        'per_page': paginated.per_page
    })

@history_bp.route('/history/<int:id>', methods=['GET'])
def get_prediction_detail(id):
    prediction = PredictionHistory.query.get(id)
    if not prediction:
        return jsonify({'success': False, 'error': f'Prediction record #{id} not found'}), 404

    return jsonify({
        'success': True,
        'prediction': prediction.to_dict()
    })

@history_bp.route('/history/<int:id>', methods=['DELETE'])
def delete_prediction(id):
    prediction = PredictionHistory.query.get(id)
    if not prediction:
        return jsonify({'success': False, 'error': f'Prediction record #{id} not found'}), 404

    db.session.delete(prediction)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Prediction #{id} deleted successfully'
    })

@history_bp.route('/stats', methods=['GET'])
def get_stats():
    total_predictions = PredictionHistory.query.count()
    
    avg_confidence = db.session.query(func.avg(PredictionHistory.confidence)).scalar() or 0.0
    
    counts = db.session.query(
        PredictionHistory.predicted_class, 
        func.count(PredictionHistory.id)
    ).group_by(PredictionHistory.predicted_class).all()

    class_counts = {
        'NonDemented': 0,
        'VeryMildDemented': 0,
        'MildDemented': 0,
        'ModerateDemented': 0
    }

    for cls, count in counts:
        if cls in class_counts:
            class_counts[cls] = count

    recent_query = PredictionHistory.query.order_by(PredictionHistory.created_at.desc()).limit(5).all()
    recent_predictions = [item.to_dict() for item in recent_query]

    most_common = max(class_counts, key=class_counts.get) if total_predictions > 0 else "None"

    return jsonify({
        'success': True,
        'total_predictions': total_predictions,
        'average_confidence': round(float(avg_confidence), 4),
        'most_common_class': most_common,
        'class_counts': class_counts,
        'recent_predictions': recent_predictions
    })
