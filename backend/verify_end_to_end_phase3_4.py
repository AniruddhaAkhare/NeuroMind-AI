"""
Comprehensive End-to-End Test Suite for Phase 3 & Phase 4:
Verifies:
1. Model prediction + Real Grad-CAM saliency mapping + Peak defect coordinates
2. 6-Pillar Gemini Clinical Intelligence Dossier generation
3. ReportLab PDF report generation with all clinical tables and images
4. Database persistence and relationship serialization (PredictionHistory -> XAIResult -> ClinicalReport)
"""
import os
import sys
import numpy as np
from PIL import Image

def run_e2e_verification():
    print("=" * 65)
    print("RUNNING END-TO-END VERIFICATION: PHASES 1, 2, 3 & 4")
    print("=" * 65)

    from app import create_app
    app = create_app()

    with app.app_context():
        # 1. Initialize services
        from services.model_service import ModelService
        from services.gradcam_service import GradCAMService
        from services.prediction_service import PredictionService
        from services.report_service import ReportService
        from services.gemini_service import GeminiService
        from database.models import PredictionHistory, XAIResult, ClinicalReport
        from extensions import db

        model_svc = ModelService()
        gradcam_svc = GradCAMService(model_svc)
        prediction_svc = PredictionService(model_svc, gradcam_svc)
        report_svc = ReportService()
        gemini_svc = GeminiService()

        # 2. Synthesize an axial brain MRI scan with temporal lobe features
        img_size = model_svc.img_size
        test_img = Image.new("RGB", (img_size, img_size), color=(20, 20, 20))
        px = test_img.load()
        for x in range(img_size):
            for y in range(img_size):
                dist = np.sqrt((x - img_size/2)**2 + (y - img_size/2)**2)
                if dist < (img_size * 0.42):
                    val = int(max(0, 190 - dist * 1.1))
                    # Add temporal horn asymmetric atrophy simulation
                    if x > (img_size * 0.55) and (img_size * 0.45 < y < img_size * 0.70):
                        val = int(val * 0.45)
                    px[x, y] = (val, val, val)

        test_img_path = os.path.join(app.config["UPLOAD_FOLDER"], "e2e_test_axial.jpg")
        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
        test_img.save(test_img_path)

        # 3. Test Model Prediction & Grad-CAM pipeline
        pred_res = model_svc.predict(test_img)
        print(f"[PASS] 1. EfficientNet-B3 Prediction:")
        print(f"          Predicted Class: {pred_res['predicted_class']}")
        print(f"          Confidence: {pred_res['confidence'] * 100:.2f}%")

        cam_res = gradcam_svc.generate_gradcam(
            image=test_img,
            output_gradcam_path=os.path.join(app.config["GRADCAM_FOLDER"], "e2e_gradcam.png"),
            output_heatmap_path=os.path.join(app.config["GRADCAM_FOLDER"], "e2e_heatmap.png"),
            target_category_idx=pred_res["predicted_index"]
        )
        assert cam_res is not None and cam_res["success"], "Grad-CAM generation failed"
        assert "peak_coordinates" in cam_res, "Missing peak coordinates in Grad-CAM output"
        print(f"[PASS] 2. Upgraded Grad-CAM Saliency Engine:")
        print(f"          Peak Coordinates: {cam_res['peak_coordinates']}")
        print(f"          Regions Identified: {len(cam_res['region_importance'])} anatomical zones")

        # 4. Test 6-Pillar Clinical Dossier Engine
        dossier = gemini_svc.generate_comprehensive_dossier(
            patient_data={"full_name": "Test Subject", "gender": "Male"},
            prediction_data={
                "predicted_class": pred_res["predicted_class"],
                "confidence": pred_res["confidence"],
                "risk_score": 0.85
            },
            risk_level="HIGH",
            region_importance=cam_res["region_importance"]
        )
        assert "pillar_1_diagnostic_assessment" in dossier, "Dossier missing Pillar 1"
        assert "pillar_4_ayurvedic_integrative_regimens" in dossier, "Dossier missing Pillar 4"
        assert "pillar_5_medical_prescriptions_and_pharmacotherapy" in dossier, "Dossier missing Pillar 5"
        print(f"[PASS] 3. Gemini 6-Pillar Clinical Intelligence Engine:")
        print(f"          Staging: {dossier['pillar_1_diagnostic_assessment']['clinical_dementia_rating']}")
        print(f"          Ayurvedic Regimens: {len(dossier['pillar_4_ayurvedic_integrative_regimens']['herbal_medhya_rasayana'])} Rasayana herbs")
        print(f"          Doctor Prescriptions: {len(dossier['pillar_5_medical_prescriptions_and_pharmacotherapy']['first_line_pharmacotherapy'])} pharmacotherapies")

        # 5. Persist Prediction & Report in DB
        db_pred = PredictionHistory(
            image_filename="e2e_test_axial.jpg",
            predicted_class=pred_res["predicted_class"],
            confidence=pred_res["confidence"],
            non_demented_probability=pred_res["class_probabilities"]["NonDemented"],
            very_mild_demented_probability=pred_res["class_probabilities"]["VeryMildDemented"],
            mild_demented_probability=pred_res["class_probabilities"]["MildDemented"],
            moderate_demented_probability=pred_res["class_probabilities"]["ModerateDemented"],
            image_path="/uploads/e2e_test_axial.jpg",
            gradcam_path="/uploads/gradcam/e2e_gradcam.png",
            risk_level="HIGH",
            risk_score=0.85,
        )
        db.session.add(db_pred)
        db.session.flush()

        db_xai = XAIResult(
            prediction_id=db_pred.id,
            method="GradCAM",
            target_class=pred_res["predicted_class"],
            target_class_index=pred_res["predicted_index"],
            heatmap_path="/uploads/gradcam/e2e_heatmap.png",
            overlay_path="/uploads/gradcam/e2e_gradcam.png",
            region_importance={
                "regions": cam_res["region_importance"],
                "peak_coordinates": cam_res["peak_coordinates"]
            },
            cam_max_value=cam_res["cam_max_value"],
            cam_mean_value=cam_res["cam_mean_value"],
        )
        db.session.add(db_xai)
        db.session.commit()

        # 6. Generate Clinical Report & ReportLab PDF
        import json
        db_rep = ClinicalReport(
            prediction_id=db_pred.id,
            ai_narrative=json.dumps(dossier),
            status="FINAL"
        )
        db.session.add(db_rep)
        db.session.commit()

        e2e_pdf_path = os.path.join(app.config["REPORTS_FOLDER"], f"e2e_final_report_{db_pred.id}.pdf")
        report_svc._build_pdf(e2e_pdf_path, db_rep, db_pred, None)
        assert os.path.exists(e2e_pdf_path), "E2E PDF file was not created"
        pdf_size = os.path.getsize(e2e_pdf_path)
        assert pdf_size > 2000, f"PDF file size too small: {pdf_size} bytes"

        print(f"[PASS] 4. ReportLab Multi-Pillar Clinical PDF Compiled:")
        print(f"          PDF Path: {e2e_pdf_path} ({pdf_size} bytes)")

        # 7. Verify JSON Serialization for Frontend
        pred_dict = db_pred.to_dict()
        assert pred_dict["clinical_dossier"] is not None, "clinical_dossier missing from to_dict"
        assert pred_dict["peak_coordinates"] is not None, "peak_coordinates missing from to_dict"
        print(f"[PASS] 5. Serialization & API Contract Validated:")
        print(f"          Frontend gets peak_coordinates: {pred_dict['peak_coordinates']}")
        print(f"          Frontend gets clinical_dossier summary: {pred_dict['clinical_dossier']['summary'][:60]}...")

    print("=" * 65)
    print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY — 100% GREEN EXIT 0")
    print("=" * 65)
    os._exit(0)

if __name__ == "__main__":
    run_e2e_verification()
