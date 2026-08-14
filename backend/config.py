import os
from pathlib import Path

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
    raise RuntimeError(
        "DATABASE_URL is not configured.\n"
        "Create backend/.env and add:\n"
        "DATABASE_URL=postgresql://username:password@localhost:5432/alzheimer_ai"
    )


# ============================================================
# FLASK
# ============================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "development-secret-key"
)


# ============================================================
# UPLOAD CONFIGURATION
# ============================================================

MAX_CONTENT_LENGTH = int(
    os.getenv(
        "MAX_CONTENT_LENGTH",
        10 * 1024 * 1024
    )
)


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

UPLOAD_FOLDER = BASE_DIR / "uploads"

UPLOAD_FOLDER.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# GRAD-CAM DIRECTORY
# ============================================================

GRADCAM_FOLDER = UPLOAD_FOLDER / "gradcam"

GRADCAM_FOLDER.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# ALLOWED IMAGE EXTENSIONS
# ============================================================

ALLOWED_EXTENSIONS = {
    "jpg",
    "jpeg",
    "png"
}


# ============================================================
# ALLOWED MIME TYPES
# ============================================================

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png"
}


# ============================================================
# MODEL CONFIGURATION
# ============================================================

MODEL_FOLDER = BASE_DIR / "exported_model"

MODEL_PATH = MODEL_FOLDER / "model.pth"

CLASS_LABELS_PATH = MODEL_FOLDER / "class_labels.json"

PREPROCESSING_CONFIG_PATH = (
    MODEL_FOLDER / "preprocessing_config.json"
)

MODEL_INFO_PATH = (
    MODEL_FOLDER / "model_info.json"
)


# ============================================================
# FLASK CONFIGURATION
# ============================================================

class Config:

    SECRET_KEY = SECRET_KEY

    SQLALCHEMY_DATABASE_URI = DATABASE_URL

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    MAX_CONTENT_LENGTH = MAX_CONTENT_LENGTH

    UPLOAD_FOLDER = str(
        UPLOAD_FOLDER
    )

    GRADCAM_FOLDER = str(
        GRADCAM_FOLDER
    )

    ALLOWED_EXTENSIONS = ALLOWED_EXTENSIONS

    ALLOWED_MIME_TYPES = ALLOWED_MIME_TYPES

    MODEL_FOLDER = str(
        MODEL_FOLDER
    )

    MODEL_PATH = str(
        MODEL_PATH
    )

    CLASS_LABELS_PATH = str(
        CLASS_LABELS_PATH
    )

    PREPROCESSING_CONFIG_PATH = str(
        PREPROCESSING_CONFIG_PATH
    )

    MODEL_INFO_PATH = str(
        MODEL_INFO_PATH
    )

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "change-this-secret-in-production"
    )

    JWT_ACCESS_TOKEN_EXPIRES = 60 * 60 * 24