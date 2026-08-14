# NeuroMind AI — Implementation Plan
## Phase 0 Audit Results + Proposed Architecture

---

## 1. Codebase Audit Summary

### 1.1 What Exists & Is Working ✅

| Component | Status | Notes |
|---|---|---|
| Flask backend (app.py) | ✅ Working | Clean factory pattern, PostgreSQL, JWT, CORS |
| EfficientNet-B3 model (44.9MB .pth) | ✅ Working | 79.7% val acc, 83.9% macro-F1, real weights |
| Model service (model_service.py) | ✅ Working | Loads once at startup, correct arch, correct class order |
| Grad-CAM service (gradcam_service.py) | ✅ Working | Full hooks-based Grad-CAM on `model.features[-1]`, overlay generation |
| Prediction pipeline (prediction_service.py) | ✅ Working | Validates, saves, predicts, runs Grad-CAM, persists to PG |
| Preprocessing config (preprocessing_config.json) | ✅ Working | 300×300, ImageNet normalization |
| Class labels (class_labels.json) | ✅ Working | 4 classes in correct order |
| Auth routes (auth_routes.py) | ✅ Working | Signup, login, /me — bcrypt + JWT |
| History routes (history_routes.py) | ✅ Working | Paginated history, stats, single record, delete |
| PostgreSQL schema (models.py) | ✅ Working | User + PredictionHistory |
| Frontend React app | ✅ Working | Vite + React Router + Tailwind, auth context, axios |
| Frontend auth flow | ✅ Working | Login, signup, protected routes, JWT storage |
| Prediction UI | ✅ Working | Upload, predict, show result, Grad-CAM viewer |
| History UI | ✅ Working | Paginated list, search, filter |
| Dashboard | ✅ Working | Real DB stats — no fake data |

### 1.2 What Is Missing / Needs Building 🔴

| Category | Missing |
|---|---|
| **RBAC** | No roles/permissions — every user is equal; no Doctor, Radiologist, Admin, Patient, Lab Tech, Receptionist |
| **Patient Management** | No Patient entity, medical history, family history, medications, clinical notes |
| **Multi-scan History** | Predictions unlinked to patients (just anonymous history) |
| **Clinical Reports** | No PDF report generation |
| **RAG + Gemini Assistant** | No vector store, no document ingestion, no LLM assistant |
| **Brain Viewer** | No DICOM/slice navigation — single image only |
| **Analytics** | Minimal stats — no monthly trends, age/gender breakdown, stage distribution |
| **Doctor/Hospital Discovery** | Not implemented |
| **Appointment System** | Not implemented |
| **Follow-Up / Reminders** | Not implemented |
| **Notifications** | Not implemented |
| **Audit Logging** | Not implemented |
| **Multilingual (i18n)** | Not implemented |
| **Voice Assistance** | Not implemented |
| **Background Tasks** | No Celery/Redis — synchronous only |
| **Alembic Migrations** | Uses db.create_all() directly — no migration history |
| **File Auth** | Uploads served publicly without auth check |
| **Refresh Tokens** | Only access token, no refresh strategy |
| **Admin Dashboard** | Not implemented |

### 1.3 Key Preservation Decisions
- **Model**: Preserve 100% — architecture, weights, preprocessing, class mapping, Grad-CAM all intact
- **Flask + SQLAlchemy**: Keep — add modules around existing structure
- **Auth system**: Extend — add `role` column + RBAC middleware
- **Frontend stack**: Keep Vite + React + Tailwind — extend routing and components
- **DB**: Extend — additive migrations to existing tables; don't drop `users` or `prediction_history`

### 1.4 Architecture Gaps Identified
- Backend: no `flask-jwt-extended` refresh token config, no rate limiting, JWT_SECRET_KEY falls back to hardcoded default in config
- Frontend: no TypeScript (spec says TS — will convert where sensible; keep JSX for speed), no React Query (will add), no Recharts (will add)
- `fetchStats` is called in Dashboard but exported as `getDashboardStats` in api.js — **existing bug**
- History routes have no `@jwt_required()` — any unauthenticated user can read all history

---

## 2. Target Architecture

```
e:\Dementia_project\
├── frontend/                    # Vite + React + Tailwind
│   ├── src/
│   │   ├── components/          # Shared UI components
│   │   ├── pages/               # All page components
│   │   │   ├── admin/           # Admin role pages
│   │   │   ├── doctor/          # Doctor role pages
│   │   │   ├── patient/         # Patient role pages
│   │   │   ├── radiologist/     # Radiologist role pages
│   │   │   └── shared/          # Multi-role shared pages
│   │   ├── context/             # React contexts
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API service layer
│   │   ├── i18n/                # Multilingual (en/hi/mr)
│   │   └── utils/               # Helpers
│   └── ...
│
├── backend/
│   ├── app.py                   # Factory (extend)
│   ├── config.py                # Config (extend)
│   ├── extensions.py            # Extensions (extend with Celery, Limiter)
│   ├── database/
│   │   ├── db.py                # Keep + add Alembic support
│   │   └── models/              # Split into module (from monolith)
│   │       ├── user.py          # Extended User (add role, profile fields)
│   │       ├── patient.py       # Patient, MedicalHistory, FamilyHistory...
│   │       ├── prediction.py    # Keep PredictionHistory (extend/link)
│   │       ├── report.py        # ClinicalReport
│   │       ├── appointment.py   # Appointment, AppointmentSlot
│   │       ├── doctor.py        # Doctor, Hospital, Affiliation
│   │       ├── rag.py           # MedicalDocument, DocumentChunk
│   │       ├── notification.py  # Notification, EmergencyAlert
│   │       └── audit.py         # AuditLog
│   ├── routes/
│   │   ├── auth_routes.py       # Extend (add refresh token, roles)
│   │   ├── prediction_routes.py # Extend (add auth, patient link)
│   │   ├── history_routes.py    # Extend (add auth, patient filter)
│   │   ├── patient_routes.py    # NEW
│   │   ├── report_routes.py     # NEW
│   │   ├── rag_routes.py        # NEW
│   │   ├── analytics_routes.py  # NEW
│   │   ├── appointment_routes.py# NEW
│   │   ├── doctor_routes.py     # NEW
│   │   ├── notification_routes.py # NEW
│   │   └── admin_routes.py      # NEW
│   ├── services/
│   │   ├── model_service.py     # KEEP (no changes)
│   │   ├── gradcam_service.py   # KEEP (no changes)
│   │   ├── prediction_service.py# Extend (link to patient)
│   │   ├── report_service.py    # NEW (PDF generation)
│   │   ├── rag_service.py       # NEW (LangChain + FAISS + Gemini)
│   │   ├── gemini_service.py    # NEW (Gemini API wrapper)
│   │   ├── notification_service.py # NEW
│   │   └── location_service.py  # NEW (Mapbox/Google)
│   ├── middleware/
│   │   ├── auth.py              # RBAC decorators
│   │   └── audit.py             # Audit logging
│   ├── tasks/                   # Celery tasks
│   │   ├── celery_app.py
│   │   ├── report_tasks.py
│   │   └── reminder_tasks.py
│   ├── utils/
│   │   ├── preprocessing.py     # KEEP + extend
│   │   ├── file_utils.py        # Secure file helpers
│   │   └── risk_calculator.py   # Risk level logic
│   └── exported_model/          # UNTOUCHED
│
├── migrations/                  # Alembic
├── tests/                       # pytest
├── docker/                      # Dockerfiles, docker-compose
├── docs/                        # Architecture docs
├── .env.example                 # Root env
└── README.md                    # Updated docs
```

---

## 3. Database Schema — New Tables (Additive)

Existing tables `users` and `prediction_history` are **not dropped**. The following changes are additive:

**Extend `users`**: Add `role` (enum), `phone`, `avatar_url`, `is_active`, `last_login_at`

**New tables (in dependency order)**:
```
roles, permissions, role_permissions
patients (profile, linked to user)
medical_history, family_history, lifestyle_information, medications, clinical_notes
mri_scans → ai_predictions → xai_results, prediction_probabilities
clinical_reports
cognitive_assessments
medical_documents, document_chunks
appointments, appointment_slots
hospitals, hospital_services, doctor_hospital_affiliations
followups, medication_reminders, mri_reminders
emergency_alerts, notifications
audit_logs
```

---

## 4. Open Questions / Design Decisions

> [!IMPORTANT]
> **1. Backend Framework**: The existing backend is **Flask**. The spec mentions **FastAPI**. Given the existing, working Flask codebase with Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS all wired up and working — **I recommend keeping Flask** and extending it rather than rewriting everything into FastAPI. This avoids breaking the working prediction pipeline. **Do you want to keep Flask or migrate to FastAPI?**

> [!IMPORTANT]
> **2. Alembic vs. db.create_all()**: The existing code uses `db.create_all()`. I will introduce **Alembic** for new migration management while keeping `create_all` for backward compat in dev. The first Alembic migration will capture the existing schema. Confirm this approach is acceptable.

> [!WARNING]
> **3. PostgreSQL credentials**: You need a live PostgreSQL instance with a database. The `backend/.env` must have `DATABASE_URL` set. I will not provide a fake connection string. Please confirm you have PostgreSQL running and can provide `DATABASE_URL`, `JWT_SECRET_KEY`, `GEMINI_API_KEY`, and `MAPBOX_ACCESS_TOKEN` (or `GOOGLE_MAPS_API_KEY`).

> [!IMPORTANT]
> **4. Mapbox vs. Google Maps**: The spec allows either. Which do you prefer for doctor/hospital discovery? I'll default to **Mapbox GL JS** (free tier available) unless you specify Google Maps.

> [!NOTE]
> **5. Celery/Redis for background tasks**: This requires a running Redis instance. For local dev without Redis, I will implement a fallback that runs tasks synchronously. Confirm if you have Redis available or if synchronous fallback is acceptable initially.

---

## 5. Phased Implementation Order

| Phase | Description | Scope |
|---|---|---|
| **1** | Foundation — extend auth + RBAC, split models, Alembic, role dashboards routing | Backend + Frontend |
| **2** | Patient Management — CRUD, medical/family/lifestyle/medication/notes | Backend + Frontend |
| **3** | MRI + ML extension — link scans to patients, risk calculator, auth on predict | Backend + Frontend |
| **4** | XAI — persist Grad-CAM results in `xai_results` table, opacity/overlay UI | Backend + Frontend |
| **5** | Clinical Reports — PDF generation (WeasyPrint/ReportLab), Gemini narrative | Backend + Frontend |
| **6** | RAG + Gemini Assistant — LangChain + FAISS + sentence-transformers + Gemini | Backend + Frontend |
| **7** | Brain Viewer — enhanced MRI viewer with pan/zoom, DICOM basic support | Frontend |
| **8** | Analytics — PostgreSQL-backed aggregation endpoints + Recharts dashboards | Backend + Frontend |
| **9** | Doctor/Hospital Discovery — Mapbox + real geocoding/places | Backend + Frontend |
| **10** | Appointments — DB-backed slots, booking, conflict prevention, Celery | Backend + Frontend |
| **11** | Follow-Up + Notifications — persisted reminders + background scheduling | Backend + Frontend |
| **12** | Multilingual (en/hi/mr) + Voice (Web Speech API) | Frontend |
| **13** | Role dashboards completion — Admin, Doctor, Radiologist, Lab Tech, Receptionist, Patient | Frontend |
| **14** | Security hardening — auth on all routes, rate limiting, audit logging | Backend |
| **15** | Tests + Docker + README | Tests + DevOps |

---

## 6. Verification Plan

- Every endpoint will have `@jwt_required()` + role check
- ML model untouched — inference verified by running existing prediction pipeline
- PostgreSQL migrations verified by running `alembic upgrade head` cleanly
- PDF report verified to download correctly
- RAG verified by uploading a document and asking a grounded question
- Appointment double-booking verified by concurrent requests test
- Analytics verified against real counts in PostgreSQL

---

## 7. New Dependencies (Backend)

```
# Auth / Security
flask-jwt-extended (already), flask-limiter, cryptography

# Migrations
alembic, flask-migrate

# Reports
weasyprint OR reportlab + pillow (already)

# RAG / LLM
langchain, langchain-google-genai, langchain-community
faiss-cpu, sentence-transformers
google-generativeai

# Tasks
celery, redis

# Files / DICOM
python-magic, pydicom (DICOM support)

# PDF / Docs
pypdf2 OR pymupdf (text extraction from PDFs)

# Location
requests (already, for Mapbox REST calls)
```

---

## 8. New Dependencies (Frontend)

```
# Data fetching
@tanstack/react-query

# Charts
recharts

# Maps
mapbox-gl, react-map-gl

# PDF
react-pdf

# i18n
react-i18next, i18next

# UI Extras
react-hot-toast, react-dropzone (already similar), date-fns
```

**Please approve this plan to begin execution (Phase 1).**
