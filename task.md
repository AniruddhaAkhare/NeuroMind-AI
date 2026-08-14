# NeuroMind AI — Task Tracker

## Phase 1 — Foundation (RBAC, Models, Migrations, Auth)
- [x] 1.1 Update requirements.txt with all new dependencies
- [x] 1.2 Create backend/database/models/ module (split from monolith)
- [x] 1.3 Extend User model with role, profile fields
- [x] 1.4 Create all new DB models (patient, report, appointment, rag, notification, audit)
- [x] 1.5 Setup Alembic / Flask-Migrate (done in extensions/app)
- [x] 1.6 Add RBAC middleware (decorators)
- [x] 1.7 Extend auth routes (refresh token, role in response)
- [x] 1.8 Fix existing bugs (fetchStats naming, missing @jwt_required on history)
- [x] 1.9 Update config.py with all new env vars
- [x] 1.10 Update extensions.py (add Limiter, APScheduler)
- [x] 1.11 Update app.py (register all new blueprints)

## Phase 2 — Patient Management
- [x] 2.1 Patient model routes (CRUD)
- [x] 2.2 Medical history, family history, lifestyle, medications, clinical notes routes
- [ ] 2.3 Frontend patient management pages

## Phase 3 — MRI + ML Extension
- [x] 3.1 Link predictions to patients
- [x] 3.2 Risk calculator utility
- [x] 3.3 Auth on prediction/history routes

## Phase 4 — XAI
- [x] 4.1 xai_results table + service
- [ ] 4.2 Frontend Grad-CAM UI with opacity control

## Phase 5 — Clinical Reports
- [x] 5.1 PDF report generation (ReportLab)
- [x] 5.2 Gemini narrative layer
- [x] 5.3 Report routes
- [ ] 5.4 Frontend report pages

## Phase 6 — RAG + Gemini Assistant
- [x] 6.1 LangChain + FAISS + sentence-transformers setup
- [x] 6.2 Document ingestion pipeline
- [x] 6.3 Retrieval + Gemini answer generation
- [x] 6.4 RAG routes
- [ ] 6.5 Frontend chat UI

## Phase 7 — Brain Viewer
- [ ] 7.1 Enhanced MRI viewer (pan/zoom/overlay)

## Phase 8 — Analytics
- [x] 8.1 Analytics aggregation endpoints
- [ ] 8.2 Recharts dashboard

## Phase 9 — Doctor/Hospital Discovery
- [x] 9.1 Mapbox integration
- [x] 9.2 Doctor/hospital routes
- [ ] 9.3 Frontend map

## Phase 10 — Appointments
- [x] 10.1 Slot management, booking, conflict prevention
- [ ] 10.2 Frontend appointment pages

## Phase 11 — Follow-Up + Notifications
- [x] 11.1 APScheduler reminder jobs
- [x] 11.2 Persisted notifications
- [ ] 11.3 Frontend notification bell

## Phase 12 — Multilingual + Voice
- [ ] 12.1 react-i18next (en/hi/mr)
- [ ] 12.2 Web Speech API integration

## Phase 13 — Role Dashboards
- [ ] 13.1 Admin dashboard
- [ ] 13.2 Doctor dashboard
- [ ] 13.3 Radiologist dashboard
- [ ] 13.4 Lab Tech dashboard
- [ ] 13.5 Receptionist dashboard
- [ ] 13.6 Patient dashboard

## Phase 14 — Security + Tests
- [x] 14.1 Rate limiting, audit logging, file auth
- [ ] 14.2 Backend tests (pytest)
- [ ] 14.3 Frontend tests

## Phase 15 — Docker + README
- [ ] 15.1 Dockerfile (backend)
- [ ] 15.2 docker-compose
- [ ] 15.3 README + IMPLEMENTATION_STATUS.md
