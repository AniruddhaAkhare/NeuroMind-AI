import os
from pathlib import Path
from datetime import timedelta

from dotenv import load_dotenv


# ============================================================
# BASE DIRECTORY
# ============================================================

BASE_DIR = Path(__file__).resolve().parent


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv(BASE_DIR / ".env")


# ============================================================
# DATABASE
# ============================================================

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    DATABASE_URL = f"sqlite:///{BASE_DIR / 'alzheimer_ai.db'}"
elif DATABASE_URL.startswith("sqlite:///") and not DATABASE_URL.startswith("sqlite:////") and not (len(DATABASE_URL) > 11 and DATABASE_URL[10] == ":"):
    # Normalize relative sqlite path to BASE_DIR
    rel_path = DATABASE_URL.replace("sqlite:///", "")
    DATABASE_URL = f"sqlite:///{BASE_DIR / rel_path}"


# ============================================================
# FLASK
# ============================================================

SECRET_KEY = os.getenv("SECRET_KEY", "change-this-in-production-never-use-default")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-jwt-secret-in-production")

FLASK_ENV = os.getenv("FLASK_ENV", "development")

DEBUG = FLASK_ENV == "development"


# ============================================================
# GEMINI
# ============================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


# ============================================================
# MAPS
# ============================================================

MAPBOX_ACCESS_TOKEN = os.getenv("MAPBOX_ACCESS_TOKEN", "")


# ============================================================
# UPLOAD CONFIGURATION
# ============================================================

MAX_CONTENT_LENGTH = int(
    os.getenv("MAX_CONTENT_LENGTH", 20 * 1024 * 1024)   # 20 MB default
)

UPLOAD_FOLDER = BASE_DIR / "uploads"
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

GRADCAM_FOLDER = UPLOAD_FOLDER / "gradcam"
GRADCAM_FOLDER.mkdir(parents=True, exist_ok=True)

REPORTS_FOLDER = UPLOAD_FOLDER / "reports"
REPORTS_FOLDER.mkdir(parents=True, exist_ok=True)

DOCUMENTS_FOLDER = UPLOAD_FOLDER / "documents"
DOCUMENTS_FOLDER.mkdir(parents=True, exist_ok=True)

RAG_INDEX_FOLDER = BASE_DIR / "rag_index"
RAG_INDEX_FOLDER.mkdir(parents=True, exist_ok=True)


# ============================================================
# ALLOWED EXTENSIONS
# ============================================================

ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "dcm", "nii", "nii.gz"}

ALLOWED_IMAGE_MIMES = {
    "image/jpeg",
    "image/png",
    "application/dicom",
    "application/octet-stream",
    "application/gzip",
    "application/x-gzip",
}

ALLOWED_DOCUMENT_EXTENSIONS = {"pdf", "docx", "txt"}

ALLOWED_DOCUMENT_MIMES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
}


# ============================================================
# MODEL CONFIGURATION
# ============================================================

MODEL_FOLDER = BASE_DIR / "exported_model"
MODEL_PATH = MODEL_FOLDER / "model.pth"
CLASS_LABELS_PATH = MODEL_FOLDER / "class_labels.json"
PREPROCESSING_CONFIG_PATH = MODEL_FOLDER / "preprocessing_config.json"
MODEL_INFO_PATH = MODEL_FOLDER / "model_info.json"


# ============================================================
# CORS
# ============================================================

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173").split(",")


# ============================================================
# FLASK CONFIGURATION CLASS
# ============================================================

class Config:

    # Flask core
    SECRET_KEY = SECRET_KEY
    DEBUG = DEBUG

    # Database
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = (
        {"connect_args": {"check_same_thread": False}}
        if str(DATABASE_URL).startswith("sqlite")
        else {
            "pool_pre_ping": True,
            "pool_recycle": 300,
        }
    )

    # JWT
    JWT_SECRET_KEY = JWT_SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

    # Uploads
    MAX_CONTENT_LENGTH = MAX_CONTENT_LENGTH
    UPLOAD_FOLDER = str(UPLOAD_FOLDER)
    GRADCAM_FOLDER = str(GRADCAM_FOLDER)
    REPORTS_FOLDER = str(REPORTS_FOLDER)
    DOCUMENTS_FOLDER = str(DOCUMENTS_FOLDER)
    RAG_INDEX_FOLDER = str(RAG_INDEX_FOLDER)

    ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS
    ALLOWED_MIME_TYPES = ALLOWED_IMAGE_MIMES
    ALLOWED_DOCUMENT_EXTENSIONS = ALLOWED_DOCUMENT_EXTENSIONS
    ALLOWED_DOCUMENT_MIMES = ALLOWED_DOCUMENT_MIMES

    # Model
    MODEL_FOLDER = str(MODEL_FOLDER)
    MODEL_PATH = str(MODEL_PATH)
    CLASS_LABELS_PATH = str(CLASS_LABELS_PATH)
    PREPROCESSING_CONFIG_PATH = str(PREPROCESSING_CONFIG_PATH)
    MODEL_INFO_PATH = str(MODEL_INFO_PATH)

    # External APIs
    GEMINI_API_KEY = GEMINI_API_KEY
    GEMINI_MODEL = GEMINI_MODEL
    MAPBOX_ACCESS_TOKEN = MAPBOX_ACCESS_TOKEN

    # CORS
    CORS_ORIGINS = CORS_ORIGINS