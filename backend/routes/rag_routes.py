"""
RAG Assistant routes (Gemini QA and document ingestion).
"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required

from extensions import db
from database.models.rag import MedicalDocument
from database.models.user import UserRole
from services.rag_service import RAGService
from middleware.auth import get_current_user, require_roles
from middleware.audit import log_event

rag_bp = Blueprint("rag", __name__)

CLINICAL_ROLES = (
    UserRole.ADMIN.value,
    UserRole.DOCTOR.value,
    UserRole.RADIOLOGIST.value,
)

# Initialize service globally for the blueprint
rag_service = None

def get_rag_service():
    global rag_service
    if not rag_service:
        rag_service = RAGService()
    return rag_service

# ============================================================
# QUERY ASSISTANT (RAG + GEMINI)
# ============================================================

@rag_bp.route("/assistant/query", methods=["POST"])
@jwt_required()
def query_assistant():
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}
    
    question = data.get("question")
    if not question:
        return jsonify({"success": False, "error": "Question is required."}), 400
        
    service = get_rag_service()
    result, status = service.query(question)
    
    # Log clinical queries
    if current_user.role in CLINICAL_ROLES:
        log_event("RAG_QUERY", actor=current_user, metadata={"question_length": len(question)})
        
    return jsonify(result), status

# ============================================================
# UPLOAD DOCUMENT FOR RAG
# ============================================================

@rag_bp.route("/assistant/documents", methods=["POST"])
@require_roles(*CLINICAL_ROLES)
def upload_document():
    current_user = get_current_user()
    
    if "document" not in request.files:
        return jsonify({"success": False, "error": "No document file provided."}), 400

    file = request.files["document"]
    if not file or not file.filename:
        return jsonify({"success": False, "error": "No file selected."}), 400

    title = request.form.get("title")
    doc_type = request.form.get("document_type", "Guideline")
    
    service = get_rag_service()
    result, status = service.ingest_document(
        file=file,
        user_id=current_user.id,
        title=title,
        doc_type=doc_type
    )
    
    if result.get("success"):
        log_event("DOCUMENT_UPLOADED", actor=current_user, target_type="document", target_id=result["document"]["id"])
        
    return jsonify(result), status

# ============================================================
# LIST DOCUMENTS
# ============================================================

@rag_bp.route("/assistant/documents", methods=["GET"])
@require_roles(*CLINICAL_ROLES)
def list_documents():
    docs = MedicalDocument.query.filter_by(is_deleted=False).order_by(MedicalDocument.created_at.desc()).all()
    return jsonify({
        "success": True,
        "documents": [d.to_dict() for d in docs]
    }), 200

# ============================================================
# DELETE DOCUMENT
# ============================================================

@rag_bp.route("/assistant/documents/<int:doc_id>", methods=["DELETE"])
@require_roles(UserRole.ADMIN.value)
def delete_document(doc_id):
    current_user = get_current_user()
    doc = MedicalDocument.query.get(doc_id)
    
    if not doc:
        return jsonify({"success": False, "error": "Document not found."}), 404
        
    doc.is_deleted = True
    db.session.commit()
    
    # Note: We don't remove from FAISS immediately in this architecture, 
    # as FAISS deletion is tricky without full index rebuild.
    # In production, we'd trigger a celery task to rebuild the index.
    
    log_event("DOCUMENT_DELETED", actor=current_user, target_type="document", target_id=doc_id)
    
    return jsonify({"success": True, "message": "Document marked as deleted."}), 200
