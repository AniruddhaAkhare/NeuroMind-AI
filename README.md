# NeuroMind AI

**Explainable Dementia Detection & Clinical Decision Support Platform**

NeuroMind AI is a full-stack medical intelligence platform that builds upon a convolutional neural network (CNN) model for Alzheimer's / Dementia detection using MRI scans. It provides a robust backend with Role-Based Access Control (RBAC), AI-generated clinical narratives via Gemini, Grad-CAM Explainable AI (XAI) overlays, Retrieval-Augmented Generation (RAG) for medical literature, and a geospatial hospital discovery system.

## Features

- **RBAC Authentication**: Separate flows and dashboards for Patients, Doctors, Radiologists, Lab Techs, Receptionists, and Admins.
- **MRI Inference & XAI**: Upload an MRI scan for 4-class Dementia classification (Non, Very Mild, Mild, Moderate). Includes Grad-CAM heatmap visualization.
- **AI Clinical Narratives**: Automatically generates a professional medical report using the Gemini LLM based on patient data, risk scores, and model output.
- **PDF Report Generation**: Exports complete A4 clinical reports using ReportLab.
- **RAG Clinical Assistant**: Embeds medical guidelines (PDF/Word) using LangChain & FAISS to answer doctor's queries with citations.
- **Patient Management & EHR**: Comprehensive tracking of medical history, family history, lifestyle, and medications.
- **Geospatial Discovery**: Mapbox integration for finding nearby hospitals and doctors.
- **Appointment Scheduling**: Real-time slot management and booking system.
- **Automated Reminders**: Built-in APScheduler tasks for follow-ups and MRI reminders.

## Tech Stack

- **Backend**: Python, Flask, SQLAlchemy (PostgreSQL), APScheduler, JWT
- **AI/ML**: PyTorch (EfficientNet-B3), Grad-CAM, LangChain, FAISS, Google Gemini (GenAI)
- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, React-Map-GL (Mapbox)
- **Deployment**: Docker, Docker Compose

## Quick Start (Docker)

1. Clone the repository.
2. Ensure you have Docker and Docker Compose installed.
3. Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
   ```
4. Run:
   ```bash
   docker-compose up --build
   ```
5. The API will be available at `http://localhost:5000` and the Frontend at `http://localhost:3000`.

## Local Development Setup

### Backend
1. Ensure PostgreSQL is running. Create a database `neuromind_ai`.
2. Create `backend/.env`:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/neuromind_ai
   JWT_SECRET_KEY=dev-secret
   GEMINI_API_KEY=your_key
   MAPBOX_ACCESS_TOKEN=your_key
   ```
3. Create virtual environment and install dependencies:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # (or .\venv\Scripts\activate on Windows)
   pip install -r requirements.txt
   ```
4. Run migrations and start server:
   ```bash
   flask db init
   flask db migrate -m "Init"
   flask db upgrade
   python app.py
   ```

### Frontend
1. Navigate to frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## License
MIT License
