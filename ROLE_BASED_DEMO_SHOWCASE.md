# 🧠 NEUROVIA — Role-Based Clinical Demo Showcase & Walkthrough Guide
### Comprehensive Step-by-Step Presentation Script Organized by Healthcare Role

[![System Status](https://img.shields.io/badge/System%20Status-Certified%20Production%20Ready-success?style=for-the-badge&logo=shield)](file:///e:/Dementia_project/INSTALLATION_AND_SETUP_GUIDE.md)
[![Automated E2E](https://img.shields.io/badge/Headless%20E2E-48%2F48%20Passed%20(100%25)-brightgreen?style=for-the-badge&logo=pytest)](file:///e:/Dementia_project/backend/test_full_system_e2e.log)
[![PyTorch](https://img.shields.io/badge/PyTorch-EfficientNet--B3-EE4C2C?style=for-the-badge&logo=pytorch)](https://pytorch.org/)
[![Explainability](https://img.shields.io/badge/XAI-PyTorch%20Grad--CAM-blueviolet?style=for-the-badge)](https://github.com/jacobgil/pytorch-grad-cam)
[![3D WebGL](https://img.shields.io/badge/3D%20Graphics-Three.js%20WebGL-black?style=for-the-badge&logo=three.js)](https://threejs.org/)

---

## 📑 Table of Contents

1. [Quick Start & Demo Environment](#-quick-start--demo-environment)
2. [Credentials Matrix](#-credentials-matrix)
3. [Prologue: Public Landing Page & Technological Foundation](#-prologue-public-landing-page--technological-foundation)
4. [Role 1: Attending Neurologist (Diagnostic Workstation & Clinical Care)](#-role-1-attending-neurologist)
5. [Role 2: Neuroradiologist (Deep Saliency, WW/WL & Longitudinal Comparison)](#-role-2-neuroradiologist)
6. [Role 3: Patient & Family Portal (Longitudinal Records & Holistic Care)](#-role-3-patient--family-portal)
7. [Role 4: System Administrator (Governance, Audit Logs & Telemetry)](#-role-4-system-administrator)
8. [Cross-Role Collaboration Flow (The 5-Minute Grand Tour)](#-cross-role-collaboration-flow-the-5-minute-grand-tour)

---

## ⚡ Quick Start & Demo Environment

Ensure both services are running before starting your demonstration:

### Terminal 1: Backend API (Port 5000)
```powershell
cd e:\Dementia_project\backend
python app.py
```
> API Live: `http://localhost:5000` • Health Diagnostics: `http://localhost:5000/api/health`

### Terminal 2: Frontend Web Client (Port 3000)
```powershell
cd e:\Dementia_project\frontend
npm run dev
```
> Web Application: `http://localhost:3000`

---

## 🔑 Credentials Matrix

All demonstration accounts share the master password: **`Password123!`**

| Healthcare Role | Email Address | Password | Main Destination Route | Primary Purpose in Demo |
|---|---|---|---|---|
| **Attending Neurologist** | `doctor@neuromind.ai` | `Password123!` | `/analyze` & `/doctor/dashboard` | Scan upload, 6-pillar dossier, Ayurveda protocols, PDF report |
| **Neuroradiologist** | `radiologist@neuromind.ai` | `Password123!` | `/result/1` & `/history` | WW/WL contrast sliders, asymmetry index, side-by-side comparison |
| **Patient & Family** | `patient@neuromind.ai` | `Password123!` | `/patient/dashboard` | Cognitive history, daily caregiver protocol, booking appointments |
| **System Administrator** | `admin@neuromind.ai` | `Password123!` | `/admin` | Real-time KPIs, HIPAA compliance audit trail, user governance |

---

## 🌐 Prologue: Public Landing Page & Technological Foundation

**Audience:** All stakeholders, hospital executives, judges, and clinical directors.  
**Route:** `http://localhost:3000/`

```
+-----------------------------------------------------------------------------------------+
|                               PROLOGUE DEMO SEQUENCE                                    |
| 1. Synaptic Video Background ➔ 2. Live Metric Pills ➔ 3. Grad-CAM Split-Wipe ➔ 4. Bento  |
+-----------------------------------------------------------------------------------------+
```

### Step-by-Step Presentation Script:
1. **Pulsing Synaptic Neural Background Video:**
   - Notice the background: a high-contrast 65% opacity blue neural mesh showing firing axons and pulsing synapses continuously looping without watermarks.
   - *Presenter Note:* *"Notice the atmosphere of our workstation. The cinematic neural animation provides high-tech clinical depth while our soft radial vignette keeps all text and cards readable."*
2. **Live Clinical Counters:**
   - Highlight the top KPI badges: `99.2% Sensitivity`, `<165ms Inference Latency`, `43,000+ Scans Trained`.
3. **Interactive Section 02 Split-Wipe Slider:**
   - Scroll down to **Section 02 (Radiological AI)**.
   - Grab the interactive vertical handle and drag it left and right across the axial MRI scan to reveal the underlying Jet-colored Grad-CAM heatmap over the anatomical brain.
   - *Presenter Note:* *"This demonstrates how our system bridges raw structural MRI with interpretative artificial intelligence in real-time."*
4. **Bento Grid Architecture:**
   - Point out Section 01 (5-stage analytical pipeline), Section 03 (3D WebGL preview), and Section 06 (institutes and hospital partners).
5. **Call to Action:**
   - Click the top right **"Sign In"** button to begin role-specific demonstrations.

---

## 🩺 Role 1: Attending Neurologist

**Persona:** Dr. Marcus Vance, Board-Certified Neurologist & Cognitive Geriatrician.  
**Login:** `doctor@neuromind.ai` / `Password123!`  
**Primary Routes:** `/analyze`, `/result/:id`, `/doctor/dashboard`

```
+-----------------------------------------------------------------------------------------+
|                             ATTENDING NEUROLOGIST DEMO FLOW                             |
| 1. Login ➔ 2. Scan Upload ➔ 3. 3D Loader & Audio ➔ 4. 6-Pillar Dossier ➔ 5. PDF Export |
+-----------------------------------------------------------------------------------------+
```

### Clinical Objective:
Rapidly upload an axial brain MRI, receive instant 4-class dementia staging with confidence calibration, review multi-system care protocols (pharmacology + Medhya Rasayana Ayurveda), and export an official hospital PDF report.

### Step-by-Step Walkthrough:

#### Step 1.1: Authentication & Doctor Workspace
1. Navigate to `/login`.
2. Enter `doctor@neuromind.ai` and `Password123!`.
3. Verify landing on the Doctor Dashboard. Point out the glowing blue `DOCTOR` role badge in the navbar and recent patient worklists.

#### Step 1.2: Multimodal Scan Ingestion (`/analyze`)
1. Click **"Analyze Scan"** in the top navigation or go to `/analyze`.
2. Notice the universal format support:
   - **Standard Formats:** JPEG, PNG (`frontend/src/assets/axial_mri.jpg`).
   - **Hospital Formats:** Direct DICOM (`.dcm`) and NIfTI 3D neuroimaging series (`.nii`, `.nii.gz`).
3. Click to upload or drag & drop `frontend/src/assets/axial_mri.jpg`.
4. Click **"Analyze MRI Scan"**:
   - The **Cinematic 3D Human Brain Scan Loading Modal** launches immediately.
   - Watch the live telemetry steps execute:
     - `1. Ingesting scan & normalizing voxel tensors...`
     - `2. EfficientNet-B3 multi-class inference...`
     - `3. Gradient-weighted Class Activation Mapping...`
     - `4. Generating 6-Pillar Multimodal Clinical Dossier...`
   - Hear the **pleasant Web Audio API diagnostic chime** as the scan finishes smoothly without abrupt cutoffs.

#### Step 1.3: Reviewing Diagnostic Staging & Uncertainty Calibration (`/result/:id`)
1. On the results page, draw attention to the top diagnostic cards:
   - **Predicted Stage:** `ModerateDemented` (or `MildDemented` / `NonDemented`).
   - **Confidence Score:** e.g., `87.42%`.
   - **Clinical Risk Level:** `HIGH` (Risk Index: 88/100).
2. Point out the **Clinical Calibration & Uncertainty Box**:
   - **Certainty Tier:** `High Clinical Certainty`.
   - **Shannon Entropy:** e.g., `0.142` (quantifying low uncertainty across the 4 classes).
   - **Uncertainty Margin:** e.g., `5.4%`.
   - **Scan Quality:** `Optimal T1`.
   - *Presenter Note:* *"Unlike basic models that give raw probabilities, NEUROVIA calculates Shannon entropy and uncertainty margins, alerting clinicians if an ambiguous scan warrants repeat imaging."*

#### Step 1.4: Inspecting the 6-Pillar Multimodal Clinical Dossier
Navigate through the dossier tabs:
1. **Pillar 1 — Diagnostic Assessment & Longitudinal Trajectory:**
   - Points out the **Clinical Dementia Rating (CDR 2.0)**.
   - Shows the **Longitudinal Trajectory Banner**: tracks rate-of-progression compared to the patient's prior baseline scans.
2. **Pillar 2 — Cautions & Critical Red Flags:**
   - Fall risk vulnerability assessments, wandering/elopement safeguards, and strict medication supervision warnings.
3. **Pillar 3 — Caregiver Daily Protocol Checklist:**
   - Time-indexed protocol: 7:30 AM circadian daylight exposure, cognitive reminiscence therapy, evening sundowning mitigation, and 9:00 PM sleep protocol.
4. **Pillar 4 — Integrative Ayurveda & Medhya Rasayana Nootropics:**
   - *Presenter Note:* *"This is NEUROVIA's unique differentiator. We bridge modern neurology with time-tested botanical neuroprotection:"*
   - 🌿 **Brahmi (*Bacopa monnieri*):** 350 mg standardized extract for hippocampal dendritic arborization and acetylcholine preservation.
   - 🌿 **Ashwagandha (*Withania somnifera*):** 500 mg with warm milk for cortisol reduction and anti-amyloid aggregation.
   - 🌿 **Shankhpushpi (*Convolvulus pluricaulis*):** 2g churnam for sleep architecture and Vata calming.
   - 🌿 **Mandukaparni (*Centella asiatica*):** Microcirculation and BDNF upregulation.
   - Panchakarma protocols: *Shirodhara* with Brahmi taila and *Pratimarsha Nasya*.
5. **Pillar 5 — Doctor Medical Prescriptions:**
   - Allopathic pharmacotherapy: Donepezil HCl (5mg titrating to 10mg) and Memantine HCl (5mg titrating to 10mg BID).
   - ECG QTc monitoring schedule and liver function tests.
6. **Pillar 6 — Hospital Specialist Action Plan:**
   - MoCA/MMSE neuropsychological timelines and multidisciplinary team rosters.

#### Step 1.5: Certified ReportLab PDF Export
1. Click **"Export Clinical PDF Report"** in the top action bar.
2. The browser immediately downloads or opens the certified multi-page hospital PDF.
3. Highlight:
   - Official *NEUROVIA INSTITUTE OF NEUROLOGY* hospital header.
   - Patient demographics block (Blood type, age, emergency contact).
   - Embedded high-resolution dual scan plates (Original MRI + Grad-CAM overlay).
   - Complete 6-pillar protocols and physician signature block.

---

## 🔬 Role 2: Neuroradiologist

**Persona:** Dr. Elena Rostova, Senior Neuroradiologist & Head of Imaging Informatics.  
**Login:** `radiologist@neuromind.ai` / `Password123!`  
**Primary Routes:** `/result/:id`, `/history`

```
+-----------------------------------------------------------------------------------------+
|                              NEURORADIOLOGIST DEMO FLOW                                 |
| 1. WW/WL Windowing ➔ 2. Hemispheric Asymmetry ➔ 3. Saliency Modes ➔ 4. Case Comparison  |
+-----------------------------------------------------------------------------------------+
```

### Clinical Objective:
Calibrate soft tissue contrast using radiological windowing tools, inspect bilateral hemispheric asymmetry indices, examine 3D defect vectors, and perform side-by-side longitudinal comparisons of prior scans.

### Step-by-Step Walkthrough:

#### Step 2.1: Radiological Window Width & Level (WW/WL) Calibration
1. Navigate to any result page (e.g., `/result/1`).
2. Scroll to the **Grad-CAM Class Activation Mapping** viewer.
3. Click the dark **"WW / WL Controls"** button in the viewer toolbar:
   - The radiologist control drawer slides open.
4. **Test Real-Time Sliders:**
   - Slide **Window Width (Contrast)** from 100% to 160% ➔ observe immediate pixel contrast changes on the MRI scan canvas.
   - Slide **Window Level (Brightness)** from 100% to 85% to highlight dense ventricular borders.
5. **Test Clinical Presets:**
   - Click **"Soft Tissue"** ➔ optimizes gray-white matter junction visibility (WW: 135%, WL: 105%).
   - Click **"CSF / Fissures"** ➔ accentuates sulcal dilation and ventricular enlargement (WW: 175%, WL: 90%).
   - Click **"Inverted Film"** ➔ inverts the scan into a traditional high-luminance backlit negative radiograph.
   - Click **"Reset"** ➔ smoothly restores standard T1 values.

#### Step 2.2: Bilateral Hemispheric Asymmetry & Spatial Coverage Analysis
1. Inspect the dark **Bilateral Hemispheric Activation Analysis** badge right below the viewer:
   - **Asymmetry Index:** e.g., `-0.186` (negative denotes left hemispheric accentuation; positive denotes right).
   - **Dominant Pattern Tag:** e.g., `Left Hemisphere Predominance` or `Bilateral Symmetric Atrophy`.
   - **Left vs Right Hemisphere Load:** e.g., Left: `48.2%`, Right: `39.1%`.
   - **High-Saliency Area Percentage:** e.g., `18.4%` (spatial volume of cortical tissue exhibiting severe activation).
   - *Presenter Note:* *"This metric quantifies lateralization of neurodegeneration, essential for differentiating asymmetric frontotemporal lobar degeneration from classic symmetric Alzheimer's."*

#### Step 2.3: Exploring the 3 Saliency Inspection Modes
1. Click **Split Wipe:** Drag the vertical divider across the scan to reveal the underlying activation heatmap.
2. Click **Side-by-Side:** Displays the input axial brain scan side-by-side with the Grad-CAM saliency plate for direct visual reference.
3. Click **Alpha Blend:** Use the continuous blend slider (0% to 100%) to smoothly dissolve between pure anatomical MRI and thermal activation heatmaps.

#### Step 2.4: 3D Holographic Stereotactic Localization
1. Scroll down to the **Three.js 3D Interactive WebGL Brain Hologram**.
2. Rotate the brain in full 3D space:
   - Point out the **crimson defect beacon** pulsing at the precise stereotactic 3D coordinates `(X, Y, Z)` computed from the 2D Grad-CAM centroid.
   - Toggle anatomical visualization layers: `Skin Opacity`, `Cortex Cage`, `Synaptic Fibers`, `Defect Spotlight`.

#### Step 2.5: Longitudinal Side-by-Side Scan Comparison Modal (`/history`)
1. Click **"History"** in the top navigation bar or go to `/history`.
2. In the audit log table, select **two scans** using the checkboxes on the left (e.g., Scan #1 and Scan #2).
3. Notice the floating bottom action drawer appear:  
   `2 Scans Selected: #1 & #2` ➔ Click **"Compare Longitudinal Progression"**.
4. The **Longitudinal Side-by-Side Comparison Modal** opens:
   - **Interval Banner:** Shows elapsed time: e.g., `182 Days Elapsed (6.0 Months)`.
   - **Trajectory Badge:** Shows stage transition, e.g., `NonDemented ➔ VeryMildDemented (Stage Transition Detected)` or `Stable Presentation`.
   - **Dual Viewports:** 
     - Left viewport: **Baseline Scan** with date and confidence.
     - Right viewport: **Follow-up Scan** with date and confidence.
   - **Synchronized Heatmap Toggle:** Click **"Show Grad-CAM Heatmap"** to simultaneously display the activation maps on both scans, highlighting temporal lobe thinning over time.

---

## 🧑‍💼 Role 3: Patient & Family Portal

**Persona:** Arthur Pendelton (Patient) & Sarah Pendelton (Primary Caregiver).  
**Login:** `patient@neuromind.ai` / `Password123!`  
**Primary Routes:** `/patient/dashboard`, `/hospitals`, `/rag-assistant`

```
+-----------------------------------------------------------------------------------------+
|                               PATIENT & FAMILY DEMO FLOW                                |
| 1. Patient Portal ➔ 2. Caregiver Daily Routine ➔ 3. Hospital Search ➔ 4. Book Slot     |
+-----------------------------------------------------------------------------------------+
```

### Clinical Objective:
Review personal cognitive health records in an empathetic, accessible format, access holistic caregiver daily routines, find nearby memory centers, and book specialist consultations.

### Step-by-Step Walkthrough:

#### Step 3.1: Patient Health Portal
1. Navigate to `/login` and sign in with `patient@neuromind.ai` / `Password123!`.
2. Notice the clean, patient-friendly portal:
   - Displays Arthur's personal profile (DOB, Blood Type, Emergency Contact).
   - Recent diagnostic scans with plain-language status badges.
   - Direct download links for official medical reports.
3. Click on the latest scan to view the patient-accessible dossier:
   - Highlights the **Caregiver Daily Protocol Checklist**:
     - *Morning Sunlight & Hydration*
     - *Music & Memory Reminiscence*
     - *Sundowning Dim-Light Protocol*
     - *Nutritious Sattvic Diet with Soaked Almonds & Walnuts*

#### Step 3.2: Finding Memory Care Centers & Specialist Clinics (`/hospitals`)
1. Click **"Find Hospitals"** in the navigation bar.
2. Search for memory centers in California:
   - Type `"San Francisco"` or `"Memory"` in the search bar.
   - View top medical institutes:
     - **UCSF Memory and Aging Center** (Specialized in Early Cognitive Detection)
     - **Stanford Center for Memory Disorders**
3. Inspect hospital details: address, verified badges, and affiliated cognitive neurologists.

#### Step 3.3: Booking a Clinic Consultation
1. On the hospital card, click **"Book Consultation"** with Dr. Marcus Vance.
2. Select a date (e.g., today's date or tomorrow).
3. Choose an available morning slot (e.g., `10:00 AM`).
4. Enter appointment reason: `"Follow-up cognitive assessment & caregiver guidance"`.
5. Click **"Confirm Appointment"**:
   - Receive an immediate success confirmation badge.
   - The booking is added to the patient's upcoming schedule under `/patient/dashboard`.

#### Step 3.4: Asking the RAG Clinical Assistant (`/rag-assistant`)
1. Navigate to `/rag-assistant`.
2. Ask caregiver questions:
   - *"How can I prevent evening sundowning confusion at home?"*
   - *"What are the safety benefits of Brahmi and Ashwagandha for memory?"*
3. The AI provides calm, evidence-based guidance with medical citations and physician consult reminders.

---

## 🛡️ Role 4: System Administrator

**Persona:** Chief Information Security Officer (CISO) & Hospital Systems Administrator.  
**Login:** `admin@neuromind.ai` / `Password123!`  
**Primary Routes:** `/admin`

```
+-----------------------------------------------------------------------------------------+
|                                 SYSTEM ADMIN DEMO FLOW                                  |
| 1. Admin Telemetry ➔ 2. User Directory ➔ 3. HIPAA Audit Trail ➔ 4. RBAC Barrier Check  |
+-----------------------------------------------------------------------------------------+
```

### Clinical Objective:
Verify hospital-wide system health, manage clinical user accounts, review HIPAA compliance audit logs with IP tracking, and demonstrate strict access control barriers.

### Step-by-Step Walkthrough:

#### Step 4.1: Accessing the Admin Governance Suite
1. Log in with `admin@neuromind.ai` / `Password123!`.
2. Navigate to `/admin`.
3. Point out the glowing purple `ADMIN` badge in the navbar.

#### Step 4.2: Live System Health & Analytics KPIs
1. Review the real-time KPI counter cards:
   - **Total Registered Users:** 4+ accounts across all 4 roles.
   - **Total Diagnostic Scans:** Archive counter.
   - **Database Engine:** `SQLite / PostgreSQL Dialect-Aware Engine`.
   - **Deep Learning Model Status:** `EfficientNet-B3 (Loaded & Active in Memory)`.
   - **XAI Engine:** `PyTorch Grad-CAM (Operational)`.

#### Step 4.3: User Governance & Directory Controls
1. Scroll to the **User Management Directory**:
   - View all registered doctors, radiologists, patients, and administrators.
   - Displays user IDs, email addresses, assigned roles, and account statuses.
   - Shows administrative role assignment and access toggle buttons.

#### Step 4.4: HIPAA Compliance & Immutable Audit Log Trail
1. Scroll to the **Security & Audit Logs** section:
   - Shows an immutable chronological record of every platform event:
     - `USER_LOGIN` events with user IDs and timestamps.
     - `PREDICTION_GENERATED` events tracking scan analyses.
     - `REPORT_DOWNLOADED` events for patient records.
     - `APPOINTMENT_BOOKED` events.
   - Every log entry includes actor ID, role, target resource ID, and client IP address for regulatory HIPAA and GDPR auditability.

#### Step 4.5: RBAC Boundary Proof (Security Demonstration)
1. Log out of Admin.
2. Log back in as **Patient** (`patient@neuromind.ai`).
3. Manually type `http://localhost:3000/admin` in the browser address bar.
4. **Result:** An immediate **403 Forbidden** security barrier blocks the request, demonstrating strict role-based access control.

---

## 🚀 Cross-Role Collaboration Flow (The 5-Minute Grand Tour)

For a fast-paced, high-impact demonstration covering the entire clinical lifecycle:

```text
⏱️ MINUTE 1 — The Radiance:
Show the Landing Page with the 65% pulsing synaptic video, split-wipe Grad-CAM slider, and live metrics.

⏱️ MINUTE 2 — The Doctor's Ingestion:
Log in as Doctor (doctor@neuromind.ai), upload a scan at /analyze, experience the 3D scan loader, hear the audio chime, and review the CDR staging.

⏱️ MINUTE 3 — The Radiologist's Deep Dive:
On /result/:id, open WW/WL Controls, adjust contrast/brightness, toggle Grayscale Inversion, and inspect the Bilateral Hemispheric Asymmetry metrics.

⏱️ MINUTE 4 — The Longitudinal Progression:
Navigate to /history, check 2 scans, launch the Side-by-Side Comparison modal, and show the elapsed days interval and trajectory status.

⏱️ MINUTE 5 — The Holistic Prescription & Governance:
Review Pillar 4 Medhya Rasayana Ayurveda (Brahmi, Ashwagandha), download the ReportLab PDF, and show the Admin audit trail at /admin.
```

---

## 🏁 Summary Checklist for Presenters

Before going on stage or starting your demo call:
- [ ] Backend is running on `http://localhost:5000` (`python app.py`).
- [ ] Frontend is running on `http://localhost:3000` (`npm run dev`).
- [ ] Both test suites verified: `python test_full_system_e2e.py` (48/48 passed).
- [ ] Sample axial scan ready: `frontend/src/assets/axial_mri.jpg`.
- [ ] Master password memorized: `Password123!`.

*Platform is certified 100% operational and demo-ready.*
