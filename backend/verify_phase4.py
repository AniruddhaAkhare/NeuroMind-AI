"""
Headless Verification Script for Phase 4:
Validates the upgraded 6-Pillar Gemini Clinical Intelligence Engine
and the ReportLab PDF Dossier Generator.
"""
import os
import sys

def run_phase4_verification():
    print("=" * 60)
    print("Running Phase 4 Headless Verification Suite")
    print("=" * 60)

    from app import create_app
    app = create_app()

    with app.app_context():
        # 1. Test GeminiService Comprehensive Dossier
        from services.gemini_service import GeminiService
        gemini_svc = GeminiService()

        dummy_patient = {
            "full_name": "Eleanor Vance",
            "date_of_birth": "1952-04-12",
            "gender": "Female",
        }
        dummy_pred = {
            "predicted_class": "MildDemented",
            "confidence": 0.942,
            "risk_score": 0.72,
        }

        dossier = gemini_svc.generate_comprehensive_dossier(
            patient_data=dummy_patient,
            prediction_data=dummy_pred,
            risk_level="HIGH",
            region_importance=[{"region": "Bilateral Medial Temporal Lobe", "percentage": 89.2}]
        )

        assert isinstance(dossier, dict), "Dossier should be a dictionary"
        assert "pillar_1_diagnostic_assessment" in dossier, "Missing Pillar 1"
        assert "pillar_2_cautions_and_risks" in dossier, "Missing Pillar 2"
        assert "pillar_3_caregiver_daily_protocol" in dossier, "Missing Pillar 3"
        assert "pillar_4_ayurvedic_integrative_regimens" in dossier, "Missing Pillar 4"
        assert "pillar_5_medical_prescriptions_and_pharmacotherapy" in dossier, "Missing Pillar 5"
        assert "pillar_6_hospital_specialist_findings" in dossier, "Missing Pillar 6"

        print("[PASS] 6-Pillar Clinical Dossier generated successfully:")
        print(f"       Executive Summary: {dossier.get('summary')[:80]}...")
        print(f"       Pillar 1 Staging: {dossier['pillar_1_diagnostic_assessment']['clinical_dementia_rating']}")
        print(f"       Pillar 4 Herbs: {[h['herb'] for h in dossier['pillar_4_ayurvedic_integrative_regimens']['herbal_medhya_rasayana']]}")
        print(f"       Pillar 5 Rx: {[d['medication'] for d in dossier['pillar_5_medical_prescriptions_and_pharmacotherapy']['first_line_pharmacotherapy']]}")

        # 2. Test ReportLab PDF Generation
        from database.models import PredictionHistory, ClinicalReport
        from extensions import db
        import json

        # Create or fetch a test prediction record in DB
        test_pred = PredictionHistory.query.first()
        if not test_pred:
            test_pred = PredictionHistory(
                image_filename="test_axial_mri.jpg",
                predicted_class="MildDemented",
                confidence=0.942,
                non_demented_probability=0.01,
                very_mild_demented_probability=0.03,
                mild_demented_probability=0.942,
                moderate_demented_probability=0.018,
                image_path="/uploads/test_axial_mri.jpg",
                gradcam_path="/uploads/gradcam/test_overlay.png",
                risk_level="HIGH",
                risk_score=0.72,
            )
            db.session.add(test_pred)
            db.session.commit()

        from services.report_service import ReportService
        report_svc = ReportService()

        # Build PDF directly
        test_pdf_path = os.path.join(app.config["REPORTS_FOLDER"], "test_phase4_dossier.pdf")
        os.makedirs(app.config["REPORTS_FOLDER"], exist_ok=True)

        # Mock clinical report record
        mock_report = ClinicalReport.query.filter_by(prediction_id=test_pred.id).first()
        if not mock_report:
            mock_report = ClinicalReport(
                prediction_id=test_pred.id,
                ai_narrative=json.dumps(dossier),
                status="FINAL"
            )
            db.session.add(mock_report)
            db.session.commit()
        else:
            mock_report.ai_narrative = json.dumps(dossier)
            db.session.commit()

        report_svc._build_pdf(
            file_path=test_pdf_path,
            report=mock_report,
            prediction=test_pred,
            patient=None
        )

        assert os.path.exists(test_pdf_path), "PDF file was not created"
        file_size = os.path.getsize(test_pdf_path)
        assert file_size > 1000, f"PDF file size too small: {file_size} bytes"

        print(f"[PASS] ReportLab PDF Dossier compiled successfully!")
        print(f"       Output Path: {test_pdf_path} ({file_size} bytes)")

    print("=" * 60)
    print("ALL PHASE 4 BACKEND VERIFICATION CHECKS PASSED (100% GREEN)")
    print("=" * 60)
    os._exit(0)

if __name__ == "__main__":
    run_phase4_verification()
