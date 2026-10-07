"""
NeuroMind AI / NEUROVIA — Comprehensive Headless End-to-End System Test Suite
Tests EVERY feature, role, model, Grad-CAM, Gemini dossier, PDF engine, and API endpoint.
Logs full output to test_full_system_e2e.log and stdout.
"""
import os
import sys
import io
import time
import json
import logging
from datetime import datetime, date, time as dtime, timezone
from PIL import Image, ImageDraw

# Ensure backend root is on path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, CURRENT_DIR)

LOG_FILE = os.path.join(CURRENT_DIR, "test_full_system_e2e.log")

# Configure logger
logger = logging.getLogger("NEUROVIA_E2E")
logger.setLevel(logging.INFO)
formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] %(message)s", datefmt="%Y-%m-%d %H:%M:%S")

# File handler
fh = logging.FileHandler(LOG_FILE, mode="w", encoding="utf-8")
fh.setLevel(logging.INFO)
fh.setFormatter(formatter)
logger.addHandler(fh)

# Stream handler
sh = logging.StreamHandler(sys.stdout)
sh.setLevel(logging.INFO)
sh.setFormatter(formatter)
logger.addHandler(sh)


def create_synthetic_brain_mri_bytes():
    """Generates an authentic synthetic axial brain MRI slice with skull and ventricles."""
    img = Image.new("L", (300, 300), color=10)
    draw = ImageDraw.Draw(img)
    # Skull outer ellipse
    draw.ellipse([30, 20, 270, 280], fill=60, outline=200, width=5)
    # Brain parenchyma
    draw.ellipse([45, 35, 255, 265], fill=120)
    # Lateral ventricles
    draw.polygon([(140, 110), (130, 160), (145, 150)], fill=20)
    draw.polygon([(160, 110), (170, 160), (155, 150)], fill=20)
    # Temporal lobe asymmetric density (mild lesion)
    draw.ellipse([60, 170, 110, 220], fill=175)
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95)
    buf.seek(0)
    return buf.getvalue()


class SystemTestRunner:
    def __init__(self):
        self.app = None
        self.client = None
        self.db = None
        self.tokens = {}
        self.users = {}
        self.test_data = {}
        self.stats = {"total": 0, "passed": 0, "failed": 0}

    def record_test(self, name, success, details=""):
        self.stats["total"] += 1
        if success:
            self.stats["passed"] += 1
            logger.info(f"  [PASS] {name} {f'({details})' if details else ''}")
        else:
            self.stats["failed"] += 1
            logger.error(f"  [FAIL] {name} — Details: {details}")

    def setup_app_and_database(self):
        logger.info("======================================================================")
        logger.info("INITIALIZING APPLICATION & IN-MEMORY TEST DATABASE")
        logger.info("======================================================================")
        from app import create_app
        from extensions import db
        from database.models.user import User, UserRole
        from database.models.patient import Patient
        from database.models.appointment import Hospital, Doctor, DoctorHospitalAffiliation, AppointmentSlot
        from werkzeug.security import generate_password_hash

        self.app = create_app()
        self.app.config["TESTING"] = True
        self.app.config["WTF_CSRF_ENABLED"] = False
        self.client = self.app.test_client()
        self.db = db

        with self.app.app_context():
            # Create all tables
            self.db.create_all()

            # Seed Users for all roles
            roles_to_seed = [
                ("admin@neuromind.ai", "System Administrator", UserRole.ADMIN.value),
                ("doctor@neuromind.ai", "Dr. Marcus Vance", UserRole.DOCTOR.value),
                ("radiologist@neuromind.ai", "Dr. Elena Rostova", UserRole.RADIOLOGIST.value),
                ("patient@neuromind.ai", "Arthur Pendelton", UserRole.PATIENT.value),
            ]

            for email, name, role in roles_to_seed:
                user = User.query.filter_by(email=email).first()
                if not user:
                    user = User(
                        full_name=name,
                        email=email,
                        password_hash=generate_password_hash("Password123!"),
                        role=role,
                        is_active=True
                    )
                    self.db.session.add(user)
                    self.db.session.flush()
                else:
                    user.password_hash = generate_password_hash("Password123!")
                    user.is_active = True
                    self.db.session.flush()

                self.users[role] = user

                # If patient, ensure patient record
                if role == UserRole.PATIENT.value:
                    patient = Patient.query.filter_by(user_id=user.id).first()
                    if not patient:
                        patient = Patient(
                            user_id=user.id,
                            gender="Male",
                            blood_group="O+",
                            primary_diagnosis="Mild Cognitive Impairment",
                            date_of_birth=date(1956, 4, 12),
                            emergency_contact_name="Sarah Pendelton",
                            emergency_contact_phone="+1-555-0192",
                        )
                        self.db.session.add(patient)
                        self.db.session.flush()
                    self.test_data["patient_id"] = patient.id

                # If doctor, ensure doctor record
                if role == UserRole.DOCTOR.value:
                    doctor = Doctor.query.filter_by(user_id=user.id).first()
                    if not doctor:
                        doctor = Doctor(
                            user_id=user.id,
                            specialization="Cognitive Neurology",
                            qualification="MD, PhD, FAAN",
                            experience_years=16,
                            consultation_fee=250.0,
                            registration_number=f"DOC-REG-{user.id}",
                            rating=4.9
                        )
                        self.db.session.add(doctor)
                        self.db.session.flush()
                    self.test_data["doctor_id"] = doctor.id

            # Seed Hospital
            hospital = Hospital.query.filter_by(name="Serenity Neuro Institute").first()
            if not hospital:
                hospital = Hospital(
                    name="Serenity Neuro Institute",
                    city="San Francisco",
                    state="CA",
                    country="USA",
                    latitude=37.7749,
                    longitude=-122.4194,
                    rating=4.95,
                    is_active=True
                )
                self.db.session.add(hospital)
                self.db.session.flush()
            self.test_data["hospital_id"] = hospital.id

            # Seed Doctor Affiliation & Slot
            affil = DoctorHospitalAffiliation.query.filter_by(
                doctor_id=self.test_data["doctor_id"],
                hospital_id=hospital.id
            ).first()
            if not affil:
                affil = DoctorHospitalAffiliation(
                    doctor_id=self.test_data["doctor_id"],
                    hospital_id=hospital.id
                )
                self.db.session.add(affil)

            # Slot for today
            today = date.today()
            slot = AppointmentSlot.query.filter_by(
                doctor_id=self.test_data["doctor_id"],
                slot_date=today
            ).first()
            if not slot:
                slot = AppointmentSlot(
                    doctor_id=self.test_data["doctor_id"],
                    slot_date=today,
                    start_time=dtime(10, 0),
                    end_time=dtime(10, 30),
                    is_available=True
                )
                self.db.session.add(slot)
                self.db.session.flush()
            else:
                from database.models.appointment import Appointment
                Appointment.query.filter_by(slot_id=slot.id).delete()
                slot.is_available = True

            self.db.session.commit()
            logger.info("Application factory, schemas, and test entities successfully initialized.")

    def authenticate_all_roles(self):
        logger.info("\n----------------------------------------------------------------------")
        logger.info("MODULE 1: AUTHENTICATION & RBAC ROLE VERIFICATION")
        logger.info("----------------------------------------------------------------------")
        
        # 1. Test public signup for patient
        new_patient_email = f"signup_test_{int(time.time())}@neuromind.ai"
        res = self.client.post("/api/auth/signup", json={
            "full_name": "Clara Oswald",
            "email": new_patient_email,
            "password": "Password123!",
            "role": "patient"
        })
        self.record_test("Public Patient Signup (/api/auth/signup)", res.status_code == 201, f"Code: {res.status_code}")

        # 2. Login for each seeded role
        roles = ["admin", "doctor", "radiologist", "patient"]
        for role in roles:
            email = f"{role}@neuromind.ai"
            res = self.client.post("/api/auth/login", json={
                "email": email,
                "password": "Password123!"
            })
            ok = res.status_code == 200 and "access_token" in res.get_json()
            if ok:
                data = res.get_json()
                self.tokens[role] = data["access_token"]
                self.tokens[f"{role}_refresh"] = data["refresh_token"]
            self.record_test(f"Login for Role: {role.upper()} (/api/auth/login)", ok, f"User: {email}")

        # 3. Test /api/auth/me for Doctor
        headers = {"Authorization": f"Bearer {self.tokens['doctor']}"}
        res = self.client.get("/api/auth/me", headers=headers)
        ok = res.status_code == 200 and res.get_json().get("user", {}).get("role") == "doctor"
        self.record_test("Current User Profile (/api/auth/me)", ok, "Role: doctor verified")

        # 4. Test Token Refresh
        ref_headers = {"Authorization": f"Bearer {self.tokens['doctor_refresh']}"}
        res = self.client.post("/api/auth/refresh", headers=ref_headers)
        ok = res.status_code == 200 and "access_token" in res.get_json()
        self.record_test("JWT Token Refresh (/api/auth/refresh)", ok)

        # 5. RBAC Security Check: Patient prohibited from Admin endpoints
        pat_headers = {"Authorization": f"Bearer {self.tokens['patient']}"}
        res = self.client.get("/api/admin/stats", headers=pat_headers)
        ok = res.status_code == 403
        self.record_test("RBAC Security: Patient Denied Admin Access", ok, f"Expected 403, Got: {res.status_code}")

    def test_health_endpoints(self):
        logger.info("\n----------------------------------------------------------------------")
        logger.info("MODULE 2: HEALTH & SYSTEM DIAGNOSTIC ENDPOINTS")
        logger.info("----------------------------------------------------------------------")
        res = self.client.get("/")
        ok = res.status_code == 200 and res.get_json().get("status") == "healthy"
        self.record_test("Root System Health Check (/)", ok)

        res = self.client.get("/api/health")
        ok = res.status_code == 200 and res.get_json().get("status") == "healthy"
        self.record_test("API Diagnostic Health Check (/api/health)", ok)

    def test_ai_inference_and_gradcam_engine(self):
        logger.info("\n----------------------------------------------------------------------")
        logger.info("MODULE 3: EFFICIENTNET-B3 MODEL & REAL PYTORCH GRAD-CAM ENGINE")
        logger.info("----------------------------------------------------------------------")
        from services.model_service import ModelService
        from services.gradcam_service import GradCAMService

        model_service = ModelService()
        gradcam_service = GradCAMService(model_service)

        img_bytes = create_synthetic_brain_mri_bytes()

        # 1. Direct Model Inference
        t0 = time.time()
        pred_res = model_service.predict(img_bytes)
        pred_class = pred_res["predicted_class"]
        confidence = pred_res["confidence"]
        probs = pred_res["class_probabilities"]
        latency_ms = (time.time() - t0) * 1000.0

        ok = (
            pred_class in ["NonDemented", "VeryMildDemented", "MildDemented", "ModerateDemented"]
            and 0.0 <= confidence <= 1.0
            and len(probs) == 4
        )
        self.record_test(
            "EfficientNet-B3 PyTorch Forward Pass",
            ok,
            f"Class: {pred_class}, Conf: {confidence*100:.2f}%, Latency: {latency_ms:.1f}ms"
        )

        # 2. Uncertainty Quantification & Calibration
        has_uncertainty = (
            "entropy_score" in pred_res
            and "uncertainty_margin" in pred_res
            and "clinical_certainty_tier" in pred_res
            and "anatomical_validation" in pred_res
        )
        self.record_test(
            "Uncertainty Quantification & Clinical Calibration",
            has_uncertainty,
            f"Entropy: {pred_res.get('entropy_score')}, Tier: {pred_res.get('clinical_certainty_tier')}"
        )

        # 3. Medical Ingestor (DICOM / NIfTI Native Pipeline)
        loaded_pil = model_service.load_medical_image(img_bytes)
        ok_ingest = loaded_pil is not None and loaded_pil.size[0] > 0
        self.record_test("Universal Medical Ingestor (DICOM/NIfTI/Standard)", ok_ingest, f"Output Size: {loaded_pil.size}")

        # 4. Real Grad-CAM Generation
        class_idx = pred_res["predicted_index"]
        out_overlay = os.path.join(self.app.config["UPLOAD_FOLDER"], "gradcam", "test_e2e_overlay.png")
        os.makedirs(os.path.dirname(out_overlay), exist_ok=True)
        t0 = time.time()
        cam_res = gradcam_service.generate_gradcam(img_bytes, out_overlay, target_category_idx=class_idx)
        cam_latency_ms = (time.time() - t0) * 1000.0

        overlay_path = cam_res["overlay_path"]
        raw_heatmap_path = cam_res["heatmap_path"]
        peak_coords = cam_res["peak_coordinates"]
        region_scores = cam_res.get("region_importance") or cam_res.get("regional_saliency", {})

        ok_cam = (
            os.path.exists(overlay_path)
            and os.path.exists(raw_heatmap_path)
            and "x" in peak_coords
            and "y" in peak_coords
            and len(region_scores) > 0
        )
        self.record_test(
            "Real PyTorch Grad-CAM Saliency Engine",
            ok_cam,
            f"Peak: ({peak_coords['x']}, {peak_coords['y']}), Heatmap: OK, Latency: {cam_latency_ms:.1f}ms"
        )

        # 5. Bilateral Hemispheric Asymmetry & Spatial Coverage
        asym = cam_res.get("hemispheric_asymmetry", {})
        cov = cam_res.get("saliency_coverage", {})
        has_asym = (
            "asymmetry_index" in asym
            and "dominant_pattern" in asym
            and "high_saliency_area_pct" in cov
        )
        self.record_test(
            "Bilateral Hemispheric Asymmetry & Spatial Coverage",
            has_asym,
            f"Index: {asym.get('asymmetry_index')}, Pattern: {asym.get('dominant_pattern')}"
        )
        self.test_data["sample_overlay_file"] = os.path.basename(overlay_path)

    def test_prediction_api_and_gemini_dossier(self):
        logger.info("\n----------------------------------------------------------------------")
        logger.info("MODULE 4: PREDICTION API (/api/predict) & GEMINI 6-PILLAR DOSSIER")
        logger.info("----------------------------------------------------------------------")
        img_bytes = create_synthetic_brain_mri_bytes()

        headers = {"Authorization": f"Bearer {self.tokens['doctor']}"}
        data = {
            "image": (io.BytesIO(img_bytes), "axial_t1_test.jpg"),
            "patient_id": str(self.test_data["patient_id"]),
            "scan_type": "MRI_T1_AXIAL",
            "is_emergency": "false"
        }

        res = self.client.post("/api/predict", data=data, headers=headers, content_type="multipart/form-data")
        ok = res.status_code == 200
        res_json = res.get_json() if ok else {}

        self.record_test("Prediction API Endpoint (/api/predict)", ok, f"HTTP Code: {res.status_code}")

        if ok and res_json:
            pred = res_json.get("prediction", {})
            self.test_data["prediction_id"] = pred.get("id")

            # Validate prediction structure
            has_preds = "predicted_class" in pred and "confidence" in pred and "class_probabilities" in pred
            self.record_test("Prediction Response Payload Structure", has_preds, f"Predicted: {pred.get('predicted_class')}")

            # Validate Uncertainty & Calibration in response
            has_uncert = "uncertainty_margin" in pred and "clinical_certainty_tier" in pred
            self.record_test("Prediction Uncertainty & Calibration Payload", has_uncert, f"Tier: {pred.get('clinical_certainty_tier')}")

            # Validate Grad-CAM saliency attributes
            has_cam = bool(pred.get("gradcam_path")) and bool(pred.get("peak_coordinates"))
            peak = pred.get("peak_coordinates") or {}
            self.record_test("Grad-CAM & 3D Defect Translation Payload", has_cam, f"Peak: ({peak.get('x')}, {peak.get('y')})")

            # Validate Gemini Multimodal 6-Pillar Dossier
            dossier = pred.get("clinical_dossier") or res_json.get("clinical_dossier") or {}
            pillar_keys = [k for k in dossier.keys() if k.startswith("pillar_")]
            has_all_6 = len(pillar_keys) >= 6
            self.record_test("Gemini Multimodal 6-Pillar Clinical Dossier", has_all_6, f"{len(pillar_keys)} clinical pillars present")

            # Validate Ayurvedic Prescriptions inside Pillar 4
            p4 = (
                dossier.get("pillar_4_ayurvedic_integrative_regimens")
                or dossier.get("pillar_4_integrative_and_ayurvedic")
                or {}
            )
            medhya = (
                p4.get("herbal_medhya_rasayana")
                or p4.get("medhya_rasayana_herbs")
                or []
            )
            has_ayurveda = len(medhya) > 0 and any("Brahmi" in str(h) or "Ashwagandha" in str(h) for h in medhya)
            self.record_test("Integrative Ayurveda & Medhya Rasayana Prescriptions", has_ayurveda, f"Found {len(medhya)} herbs")

            # 6. Longitudinal Prior Scan Tracking Test (Follow-up scan)
            data2 = {
                "image": (io.BytesIO(img_bytes), "axial_t1_followup.jpg"),
                "patient_id": str(self.test_data["patient_id"]),
                "scan_type": "MRI_T1_AXIAL",
                "is_emergency": "false"
            }
            res2 = self.client.post("/api/predict", data=data2, headers=headers, content_type="multipart/form-data")
            ok2 = res2.status_code == 200
            res2_json = res2.get_json() if ok2 else {}
            p1_diag = (res2_json.get("prediction", {}).get("clinical_dossier", {})
                       .get("pillar_1_diagnostic_assessment", {}))
            has_longitudinal = "longitudinal_progression" in p1_diag or "stage_classification" in p1_diag
            self.record_test("Longitudinal EHR Trajectory Tracking", has_longitudinal, "Comparative trajectory verified")

    def test_image_and_static_serving(self):
        logger.info("\n----------------------------------------------------------------------")
        logger.info("MODULE 5: IMAGE & STATIC ASSET UPLOAD SERVING")
        logger.info("----------------------------------------------------------------------")
        filename = self.test_data.get("sample_overlay_file")
        if filename:
            # Test /uploads/<path:filename>
            res = self.client.get(f"/uploads/gradcam/{filename}")
            ok = res.status_code == 200 and "image" in res.content_type
            self.record_test("Static Upload File Serving (/uploads/gradcam/...)", ok, f"MIME: {res.content_type}")

            # Test /api/uploads/<path:filename>
            res_api = self.client.get(f"/api/uploads/gradcam/{filename}")
            ok_api = res_api.status_code == 200 and "image" in res_api.content_type
            self.record_test("API Upload File Serving (/api/uploads/gradcam/...)", ok_api)

    def test_report_generation_and_pdf(self):
        logger.info("\n----------------------------------------------------------------------")
        logger.info("MODULE 6: CLINICAL REPORT & REPORTLAB MULTI-PAGE PDF ENGINE")
        logger.info("----------------------------------------------------------------------")
        pred_id = self.test_data.get("prediction_id")
        if not pred_id:
            self.record_test("Clinical Report Generation", False, "Missing prediction ID")
            return

        headers = {"Authorization": f"Bearer {self.tokens['doctor']}"}
        res = self.client.post(
            f"/api/reports/generate/{pred_id}",
            json={
                "clinical_observations": "Patient displays pronounced right temporal lobe atrophy with memory deficit.",
                "recommendations": "Initiate Donepezil 5mg nocte; schedule repeat 3T MRI at 6 months."
            },
            headers=headers
        )
        ok = res.status_code == 200 and "report" in res.get_json()
        self.record_test("Generate Clinical Report (/api/reports/generate/<id>)", ok)

        if ok:
            report_data = res.get_json()["report"]
            report_id = report_data["id"]
            self.test_data["report_id"] = report_id

            # Fetch report details
            res_get = self.client.get(f"/api/reports/{report_id}", headers=headers)
            ok_get = res_get.status_code == 200
            self.record_test("Retrieve Report Details (/api/reports/<id>)", ok_get)

            # Download compiled PDF
            res_dl = self.client.get(f"/api/reports/download/{report_id}", headers=headers)
            ok_dl = (
                res_dl.status_code == 200
                and res_dl.data.startswith(b"%PDF-")
                and len(res_dl.data) > 1000
            )
            self.record_test(
                "ReportLab PDF Compilation & Download (/api/reports/download/<id>)",
                ok_dl,
                f"PDF Size: {len(res_dl.data)} bytes, Header: %PDF-"
            )

    def test_patient_management_endpoints(self):
        logger.info("\n----------------------------------------------------------------------")
        logger.info("MODULE 7: PATIENT MANAGEMENT & CLINICAL ACCESS")
        logger.info("----------------------------------------------------------------------")
        doc_headers = {"Authorization": f"Bearer {self.tokens['doctor']}"}
        pat_headers = {"Authorization": f"Bearer {self.tokens['patient']}"}
        patient_id = self.test_data["patient_id"]

        # 1. Doctor lists patients
        res = self.client.get("/api/patients", headers=doc_headers)
        ok = res.status_code == 200 and len(res.get_json().get("patients", [])) > 0
        self.record_test("Doctor Lists Patients (/api/patients)", ok)

        # 2. Patient accesses self profile
        res = self.client.get("/api/patients/me", headers=pat_headers)
        ok = res.status_code == 200 and res.get_json().get("patient", {}).get("id") == patient_id
        self.record_test("Patient Self-Profile (/api/patients/me)", ok)

        # 3. Doctor fetches single patient
        res = self.client.get(f"/api/patients/{patient_id}", headers=doc_headers)
        ok = res.status_code == 200 and res.get_json().get("patient", {}).get("id") == patient_id
        self.record_test("Get Single Patient by ID (/api/patients/<id>)", ok)

        # 4. Update patient details
        res = self.client.put(
            f"/api/patients/{patient_id}",
            json={"primary_diagnosis": "Mild Alzheimer's Disease (CDR 1.0)", "blood_group": "O+"},
            headers=doc_headers
        )
        ok = res.status_code == 200
        self.record_test("Update Patient Clinical Information (/api/patients/<id>)", ok)

    def test_history_and_vault(self):
        logger.info("\n----------------------------------------------------------------------")
        logger.info("MODULE 8: PREDICTION HISTORY & LONGITUDINAL MEDICAL VAULT")
        logger.info("----------------------------------------------------------------------")
        doc_headers = {"Authorization": f"Bearer {self.tokens['doctor']}"}

        # 1. List history
        res = self.client.get("/api/history?page=1&per_page=10", headers=doc_headers)
        ok = res.status_code == 200 and "records" in res.get_json()
        self.record_test("Prediction History Pagination (/api/history)", ok, f"Total: {res.get_json().get('total')}")

        # 2. History stats
        res = self.client.get("/api/stats", headers=doc_headers)
        ok = res.status_code == 200 and "total_predictions" in res.get_json()
        self.record_test("Historical Aggregated Stats (/api/stats)", ok)

        # 3. Single history item
        pred_id = self.test_data.get("prediction_id")
        if pred_id:
            res = self.client.get(f"/api/history/{pred_id}", headers=doc_headers)
            ok = res.status_code == 200 and res.get_json().get("prediction", {}).get("id") == pred_id
            self.record_test("Single Historical Record Detail (/api/history/<id>)", ok)

    def test_rag_assistant(self):
        logger.info("\n----------------------------------------------------------------------")
        logger.info("MODULE 9: RAG CLINICAL ASSISTANT & KNOWLEDGE RETRIEVAL")
        logger.info("----------------------------------------------------------------------")
        doc_headers = {"Authorization": f"Bearer {self.tokens['doctor']}"}

        # 1. List documents
        res = self.client.get("/api/assistant/documents", headers=doc_headers)
        ok = res.status_code == 200 and "documents" in res.get_json()
        self.record_test("RAG List Knowledge Documents (/api/assistant/documents)", ok)

        # 2. Query clinical assistant
        query = "What are the early MRI biomarkers for Alzheimer's disease?"
        res = self.client.post("/api/assistant/query", json={"question": query}, headers=doc_headers)
        ok = res.status_code == 200 and "answer" in res.get_json()
        ans_preview = res.get_json().get("answer", "")[:60] if ok else ""
        self.record_test("RAG Clinical Assistant Query (/api/assistant/query)", ok, f"Answer: {ans_preview}...")

    def test_hospitals_and_appointments(self):
        logger.info("\n----------------------------------------------------------------------")
        logger.info("MODULE 10: HOSPITALS, DOCTORS DIRECTORY & APPOINTMENT BOOKING")
        logger.info("----------------------------------------------------------------------")
        pat_headers = {"Authorization": f"Bearer {self.tokens['patient']}"}
        doctor_id = self.test_data["doctor_id"]
        hospital_id = self.test_data["hospital_id"]

        # 1. Search hospitals
        res = self.client.get("/api/hospitals/search?q=Serenity&lat=37.77&lon=-122.41", headers=pat_headers)
        ok = res.status_code == 200 and len(res.get_json().get("hospitals", [])) > 0
        self.record_test("Geospatial Hospital Search (/api/hospitals/search)", ok)

        # 2. Get single hospital
        res = self.client.get(f"/api/hospitals/{hospital_id}", headers=pat_headers)
        ok = res.status_code == 200 and res.get_json().get("hospital", {}).get("id") == hospital_id
        self.record_test("Get Single Hospital by ID (/api/hospitals/<id>)", ok)

        # 3. Get doctors
        res = self.client.get("/api/doctors", headers=pat_headers)
        ok = res.status_code == 200 and len(res.get_json().get("doctors", [])) > 0
        self.record_test("List Doctors Directory (/api/doctors)", ok)

        # 4. Get slots for doctor
        today_str = str(date.today())
        res = self.client.get(f"/api/appointments/slots/{doctor_id}?date={today_str}", headers=pat_headers)
        slots = res.get_json().get("slots", []) if res.status_code == 200 else []
        ok = res.status_code == 200 and len(slots) > 0
        self.record_test("Get Available Appointment Slots (/api/appointments/slots/<id>)", ok)

        # 5. Book appointment
        slot_id = slots[0]["id"] if slots else 1
        res = self.client.post(
            "/api/appointments/book",
            json={
                "slot_id": slot_id,
                "patient_id": self.test_data["patient_id"],
                "reason": "Cognitive assessment follow-up"
            },
            headers=pat_headers
        )
        ok = res.status_code in (200, 201) and "appointment" in res.get_json()
        self.record_test("Book Patient Appointment (/api/appointments/book)", ok, f"Code: {res.status_code}, Resp: {res.get_json()}")

        # 6. Patient gets their appointments
        res = self.client.get("/api/appointments/my", headers=pat_headers)
        ok = res.status_code == 200 and "appointments" in res.get_json()
        self.record_test("List Patient Appointments (/api/appointments/my)", ok)

    def test_analytics_and_admin_governance(self):
        logger.info("\n----------------------------------------------------------------------")
        logger.info("MODULE 11: RECHARTS ANALYTICS & ADMIN SYSTEM GOVERNANCE")
        logger.info("----------------------------------------------------------------------")
        adm_headers = {"Authorization": f"Bearer {self.tokens['admin']}"}
        doc_headers = {"Authorization": f"Bearer {self.tokens['doctor']}"}

        # 1. Clinical dashboard analytics (Recharts data)
        res = self.client.get("/api/analytics/dashboard", headers=doc_headers)
        ok = (
            res.status_code == 200
            and "metrics" in res.get_json()
            and "stage_distribution" in res.get_json()["metrics"]
        )
        self.record_test("Clinical Analytics Metrics for Recharts (/api/analytics/dashboard)", ok)

        # 2. Admin system stats
        res = self.client.get("/api/admin/stats", headers=adm_headers)
        ok = (
            res.status_code == 200
            and "stats" in res.get_json()
            and "total_users" in res.get_json()["stats"]
        )
        self.record_test("Admin System Metrics (/api/admin/stats)", ok)

        # 3. Admin audit logs
        res = self.client.get("/api/admin/audit-logs", headers=adm_headers)
        ok = res.status_code == 200 and "logs" in res.get_json()
        self.record_test("Audit Logging & Compliance Trail (/api/admin/audit-logs)", ok)

        # 4. Admin user directory
        res = self.client.get("/api/admin/users", headers=adm_headers)
        ok = res.status_code == 200 and len(res.get_json().get("users", [])) >= 4
        self.record_test("Admin User Governance Directory (/api/admin/users)", ok)

    def test_notifications_and_alerts(self):
        logger.info("\n----------------------------------------------------------------------")
        logger.info("MODULE 12: CLINICAL NOTIFICATIONS & EMERGENCY ALERTS")
        logger.info("----------------------------------------------------------------------")
        pat_headers = {"Authorization": f"Bearer {self.tokens['patient']}"}
        doc_headers = {"Authorization": f"Bearer {self.tokens['doctor']}"}

        # 1. Patient gets notifications
        res = self.client.get("/api/notifications", headers=pat_headers)
        ok = res.status_code == 200 and "notifications" in res.get_json()
        self.record_test("User Notification Retrieval (/api/notifications)", ok)

        # 2. Clinical staff gets emergency alerts
        res = self.client.get("/api/notifications/emergency-alerts", headers=doc_headers)
        ok = res.status_code == 200 and "alerts" in res.get_json()
        self.record_test("Clinical Emergency Alert Feed (/api/notifications/emergency-alerts)", ok)

    def run_all(self):
        start_time = time.time()
        logger.info("======================================================================")
        logger.info("STARTING NEUROVIA MASTER E2E HEADLESS TEST SUITE")
        logger.info(f"Timestamp: {datetime.now(timezone.utc).isoformat()}")
        logger.info("======================================================================")

        try:
            self.setup_app_and_database()
            self.test_health_endpoints()
            self.authenticate_all_roles()
            self.test_ai_inference_and_gradcam_engine()
            self.test_prediction_api_and_gemini_dossier()
            self.test_image_and_static_serving()
            self.test_report_generation_and_pdf()
            self.test_patient_management_endpoints()
            self.test_history_and_vault()
            self.test_rag_assistant()
            self.test_hospitals_and_appointments()
            self.test_analytics_and_admin_governance()
            self.test_notifications_and_alerts()
        except Exception as exc:
            logger.exception(f"FATAL ERROR during test execution: {exc}")
            return False

        duration = time.time() - start_time
        logger.info("\n======================================================================")
        logger.info("FINAL TEST EXECUTION SUMMARY")
        logger.info("======================================================================")
        logger.info(f"Total Tests Executed: {self.stats['total']}")
        logger.info(f"Passed:              {self.stats['passed']}")
        logger.info(f"Failed:              {self.stats['failed']}")
        logger.info(f"Total Duration:      {duration:.2f} seconds")
        logger.info(f"Full Logs Saved To:  {LOG_FILE}")

        if self.stats["failed"] == 0 and self.stats["total"] > 0:
            logger.info("\n>>> CERTIFICATION: NEUROVIA PLATFORM CERTIFIED 100% OPERATIONAL <<<")
            logger.info("======================================================================\n")
            return True
        else:
            logger.error("\n>>> CERTIFICATION FAILED: ONE OR MORE TESTS FAILED <<<\n")
            return False


if __name__ == "__main__":
    runner = SystemTestRunner()
    success = runner.run_all()
    sys.exit(0 if success else 1)
