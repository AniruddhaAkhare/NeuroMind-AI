"""
RAG - Medical documents and chunks for vector search.
"""
from datetime import datetime, timezone

from extensions import db


class MedicalDocument(db.Model):
    __tablename__ = "medical_documents"

    id = db.Column(db.Integer, primary_key=True)

    uploaded_by_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    title = db.Column(db.String(512), nullable=False)
    description = db.Column(db.Text, nullable=True)
    document_type = db.Column(db.String(100), nullable=True)
    # e.g. WHO_Guideline / Research_Paper / Clinical_Protocol / Case_Study

    file_path = db.Column(db.String(512), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer, nullable=True)   # bytes
    mime_type = db.Column(db.String(100), nullable=True)

    # Indexing status
    indexing_status = db.Column(db.String(30), default="PENDING")
    # PENDING → PROCESSING → INDEXED → FAILED

    chunk_count = db.Column(db.Integer, default=0)

    indexing_error = db.Column(db.Text, nullable=True)

    indexed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    is_deleted = db.Column(db.Boolean, default=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    uploaded_by = db.relationship("User", foreign_keys=[uploaded_by_id])

    chunks = db.relationship(
        "DocumentChunk",
        back_populates="document",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "document_type": self.document_type,
            "file_name": self.file_name,
            "file_size": self.file_size,
            "mime_type": self.mime_type,
            "indexing_status": self.indexing_status,
            "chunk_count": self.chunk_count,
            "indexed_at": (
                self.indexed_at.isoformat() if self.indexed_at else None
            ),
            "uploaded_by": (
                self.uploaded_by.full_name if self.uploaded_by else None
            ),
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
        }


class DocumentChunk(db.Model):
    __tablename__ = "document_chunks"

    id = db.Column(db.Integer, primary_key=True)

    document_id = db.Column(
        db.Integer,
        db.ForeignKey("medical_documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    chunk_index = db.Column(db.Integer, nullable=False)

    content = db.Column(db.Text, nullable=False)

    # Stored as JSON array of floats; for FAISS we rely on the index file,
    # but we persist the text so we can reconstruct and cite.
    metadata_json = db.Column(db.JSON, nullable=True)

    page_number = db.Column(db.Integer, nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    document = db.relationship("MedicalDocument", back_populates="chunks")

    def to_dict(self):
        return {
            "id": self.id,
            "document_id": self.document_id,
            "chunk_index": self.chunk_index,
            "content": self.content[:300] + "..." if len(self.content) > 300 else self.content,
            "page_number": self.page_number,
        }
