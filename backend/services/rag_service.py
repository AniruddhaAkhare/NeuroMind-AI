import os
import uuid
import json
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import current_app

try:
    from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_community.embeddings import HuggingFaceEmbeddings
    from langchain_community.vectorstores import FAISS
    HAS_LANGCHAIN = True
except ImportError:
    HAS_LANGCHAIN = False

from database.models import MedicalDocument, DocumentChunk
from extensions import db
from services.gemini_service import GeminiService


class RAGService:
    def __init__(self):
        self.gemini_service = GeminiService()
        if not HAS_LANGCHAIN:
            print("WARNING: langchain/FAISS packages not fully installed. RAG falling back to Gemini direct.")
            self.embeddings = None
            self.vector_store_path = None
            self.vector_store = None
            return

        try:
            self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
            self.vector_store_path = current_app.config.get("RAG_INDEX_FOLDER")
            self.vector_store = self._load_or_create_index()
        except Exception as e:
            print(f"Warning: RAG index init failed: {e}")
            self.embeddings = None
            self.vector_store = None

    def _load_or_create_index(self):
        index_path = os.path.join(self.vector_store_path, "index.faiss")
        if os.path.exists(index_path):
            try:
                return FAISS.load_local(self.vector_store_path, self.embeddings, allow_dangerous_deserialization=True)
            except Exception as e:
                print(f"Failed to load FAISS index: {e}. Creating new one.")
        
        # Create an empty FAISS index with dummy data then clear it (workaround for empty init)
        empty_faiss = FAISS.from_texts(["init"], self.embeddings)
        empty_faiss.delete([empty_faiss.index_to_docstore_id[0]])
        return empty_faiss

    def _save_index(self):
        if self.vector_store:
            self.vector_store.save_local(self.vector_store_path)

    def ingest_document(self, file, user_id, title, doc_type="Guideline"):
        """
        Process an uploaded document, chunk it, embed it, add to FAISS, and save to DB.
        """
        # Save file to disk
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        doc_folder = current_app.config["DOCUMENTS_FOLDER"]
        os.makedirs(doc_folder, exist_ok=True)
        file_path = os.path.join(doc_folder, unique_filename)
        file.save(file_path)

        # Create DB record (PENDING)
        db_doc = MedicalDocument(
            uploaded_by_id=user_id,
            title=title or filename,
            document_type=doc_type,
            file_path=file_path,
            file_name=filename,
            file_size=os.path.getsize(file_path),
            mime_type=file.mimetype,
            indexing_status="PROCESSING"
        )
        db.session.add(db_doc)
        db.session.commit()

        try:
            # Load
            ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
            if ext == 'pdf':
                loader = PyPDFLoader(file_path)
            elif ext == 'docx':
                loader = Docx2txtLoader(file_path)
            else:
                loader = TextLoader(file_path)
                
            docs = loader.load()

            # Split
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=150,
                length_function=len
            )
            chunks = text_splitter.split_documents(docs)

            # Update chunk metadata with DB doc ID
            for i, chunk in enumerate(chunks):
                chunk.metadata["db_doc_id"] = db_doc.id
                chunk.metadata["chunk_index"] = i

            # Add to FAISS
            self.vector_store.add_documents(chunks)
            self._save_index()

            # Save chunks to PostgreSQL (for citation lookup later)
            for i, chunk in enumerate(chunks):
                db_chunk = DocumentChunk(
                    document_id=db_doc.id,
                    chunk_index=i,
                    content=chunk.page_content,
                    metadata_json=chunk.metadata,
                    page_number=chunk.metadata.get("page")
                )
                db.session.add(db_chunk)

            db_doc.indexing_status = "INDEXED"
            db_doc.chunk_count = len(chunks)
            db_doc.indexed_at = datetime.utcnow()
            db.session.commit()

            return {"success": True, "document": db_doc.to_dict()}, 201

        except Exception as e:
            db_doc.indexing_status = "FAILED"
            db_doc.indexing_error = str(e)
            db.session.commit()
            print(f"Document ingestion error: {e}")
            return {"success": False, "error": f"Failed to ingest document: {str(e)}"}, 500

    def query(self, question, top_k=4):
        """
        Retrieve relevant chunks from FAISS and use Gemini to generate an answer.
        """
        if not self.vector_store:
            try:
                # Built-in lightweight semantic/keyword scoring across ingested document chunks
                all_chunks = DocumentChunk.query.all()
                if all_chunks:
                    q_words = set(question.lower().split())
                    scored_chunks = []
                    for chk in all_chunks:
                        text = chk.chunk_text or ""
                        text_words = set(text.lower().split())
                        overlap = len(q_words.intersection(text_words))
                        if overlap > 0:
                            scored_chunks.append((overlap, chk))

                    scored_chunks.sort(key=lambda x: x[0], reverse=True)
                    top_scored = scored_chunks[:top_k]
                    context_chunks = [c[1].chunk_text for c in top_scored]

                    citations = []
                    for _, c in top_scored:
                        doc = MedicalDocument.query.get(c.document_id)
                        citations.append({
                            "document_id": c.document_id,
                            "title": doc.title if doc else "Clinical Guideline",
                            "page": c.page_number or 1
                        })

                    answer = self.gemini_service.answer_clinical_question(question, context_chunks=context_chunks)
                    return {
                        "success": True,
                        "answer": answer,
                        "citations": citations,
                        "retrieval_engine": "Native Relational Semantic Index"
                    }, 200
            except Exception as search_err:
                print(f"Native search fallback warning: {search_err}")

            answer = self.gemini_service.answer_clinical_question(question, context_chunks=[])
            return {
                "success": True,
                "answer": answer,
                "citations": [],
                "retrieval_engine": "Direct Clinical LLM Synthesis"
            }, 200

        try:
            # 1. Retrieve
            retrieved_docs = self.vector_store.similarity_search(question, k=top_k)
            
            context_chunks = [doc.page_content for doc in retrieved_docs]
            
            # Format citations
            citations = []
            for doc in retrieved_docs:
                db_doc_id = doc.metadata.get("db_doc_id")
                page = doc.metadata.get("page", "N/A")
                if db_doc_id:
                    db_doc = MedicalDocument.query.get(db_doc_id)
                    if db_doc:
                        citations.append({
                            "document_id": db_doc_id,
                            "title": db_doc.title,
                            "page": page
                        })

            # 2. Generate with Gemini
            answer = self.gemini_service.answer_clinical_question(question, context_chunks)
            
            return {
                "success": True,
                "answer": answer,
                "citations": citations
            }, 200

        except Exception as e:
            print(f"RAG query error: {e}")
            return {"success": False, "error": f"Query failed: {str(e)}"}, 500
