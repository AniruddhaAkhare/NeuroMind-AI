import os
import uuid

from flask import current_app
from PIL import Image

from database.models import PredictionHistory, XAIResult
from extensions import db
from utils.preprocessing import validate_image_file
from utils.risk_calculator import calculate_risk


class PredictionService:

    def __init__(self, model_service, gradcam_service):
        self.model_service = model_service
        self.gradcam_service = gradcam_service
        self.config = current_app.config

    def process_prediction(self, file, patient_id=None, uploaded_by_id=None, scan_type="MRI", is_emergency=False):

        # ==================================================
        # VALIDATE FILE
        # ==================================================
        is_valid, error_msg = validate_image_file(
            file,
            self.config["ALLOWED_EXTENSIONS"],
            self.config.get("ALLOWED_MIME_TYPES"),
            self.config["MAX_CONTENT_LENGTH"]
        )

        if not is_valid:
            return None, error_msg, 400

        # ==================================================
        # CREATE UNIQUE FILE NAME
        # ==================================================
        original_filename = file.filename or "mri_image.jpg"
        ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else "jpg"
        unique_id = str(uuid.uuid4())
        image_filename = f"{unique_id}.{ext}"
        
        upload_folder = self.config["UPLOAD_FOLDER"]
        os.makedirs(upload_folder, exist_ok=True)
        image_save_path = os.path.join(upload_folder, image_filename)

        # ==================================================
        # SAVE & LOAD IMAGE (DICOM, NIfTI, JPEG, PNG)
        # ==================================================
        try:
            file.save(image_save_path)
            # Universal medical image loader handles DICOM slices, NIfTI 3D central slice, and standard formats
            image = self.model_service.load_medical_image(image_save_path)

            # For DICOM or NIfTI files, generate an optimized web preview JPEG for the UI
            display_filename = image_filename
            if ext in ["dcm", "nii", "gz"] or original_filename.lower().endswith(".nii.gz"):
                preview_filename = f"{unique_id}_preview.jpg"
                preview_path = os.path.join(upload_folder, preview_filename)
                image.save(preview_path, "JPEG", quality=95)
                display_filename = preview_filename
        except Exception as exc:
            print(f"Image processing error: {exc}")
            return None, "Unable to save or read the uploaded medical scan.", 500

        # ==================================================
        # MODEL PREDICTION
        # ==================================================
        try:
            pred_result = self.model_service.predict(image)
        except Exception as exc:
            print(f"Model prediction error: {exc}")
            return None, "Failed to run the MRI prediction.", 500

        # ==================================================
        # RISK CALCULATION
        # ==================================================
        probabilities = pred_result["class_probabilities"]
        risk_info = calculate_risk(probabilities)

        # ==================================================
        # GRAD-CAM
        # ==================================================
        gradcam_success = False
        relative_gradcam_url = None
        relative_heatmap_url = None
        gradcam_data = None

        try:
            gradcam_folder = self.config["GRADCAM_FOLDER"]
            os.makedirs(gradcam_folder, exist_ok=True)
            gradcam_filename = f"gradcam_{unique_id}.png"
            heatmap_filename = f"raw_heatmap_{unique_id}.png"
            gradcam_save_path = os.path.join(gradcam_folder, gradcam_filename)
            heatmap_save_path = os.path.join(gradcam_folder, heatmap_filename)

            gradcam_data = self.gradcam_service.generate_gradcam(
                image=image,
                output_gradcam_path=gradcam_save_path,
                output_heatmap_path=heatmap_save_path,
                target_category_idx=pred_result["predicted_index"]
            )

            if gradcam_data and gradcam_data.get("success"):
                gradcam_success = True
                relative_gradcam_url = f"/uploads/gradcam/{gradcam_filename}"
                relative_heatmap_url = f"/uploads/gradcam/{heatmap_filename}"

        except Exception as exc:
            print(f"Grad-CAM generation failed: {exc}")
            gradcam_success = False

        relative_image_url = f"/uploads/{display_filename}"

        # ==================================================
        # SAVE TO POSTGRESQL / SQLITE
        # ==================================================
        try:
            history_entry = PredictionHistory(
                patient_id=patient_id,
                uploaded_by_id=uploaded_by_id,
                image_filename=original_filename,
                predicted_class=pred_result["predicted_class"],
                confidence=pred_result["confidence"],
                non_demented_probability=probabilities["NonDemented"],
                very_mild_demented_probability=probabilities["VeryMildDemented"],
                mild_demented_probability=probabilities["MildDemented"],
                moderate_demented_probability=probabilities["ModerateDemented"],
                image_path=relative_image_url,
                gradcam_path=relative_gradcam_url,
                model_name="EfficientNet-B3",
                model_version="1.0.0",
                risk_level=risk_info["level"],
                risk_score=risk_info["score"],
                follow_up_recommendation=risk_info["recommendation"],
                scan_type=scan_type,
                is_emergency=is_emergency,
            )
            db.session.add(history_entry)
            db.session.flush() # To get history_entry.id for XAIResult

            if gradcam_success and gradcam_data:
                region_payload = {
                    "regions": gradcam_data.get("region_importance", []),
                    "peak_coordinates": gradcam_data.get("peak_coordinates"),
                    "hemispheric_asymmetry": gradcam_data.get("hemispheric_asymmetry"),
                    "saliency_coverage": gradcam_data.get("saliency_coverage"),
                }
                xai_result = XAIResult(
                    prediction_id=history_entry.id,
                    method="GradCAM",
                    target_class=pred_result["predicted_class"],
                    target_class_index=pred_result["predicted_index"],
                    heatmap_path=relative_heatmap_url,
                    overlay_path=relative_gradcam_url,
                    region_importance=region_payload,
                    cam_max_value=gradcam_data.get("cam_max_value"),
                    cam_mean_value=gradcam_data.get("cam_mean_value"),
                )
                db.session.add(xai_result)

            # Auto-generate comprehensive 6-Pillar Clinical Dossier with Longitudinal History
            try:
                from database.models import ClinicalReport, Patient
                from services.gemini_service import GeminiService
                patient_obj = Patient.query.get(patient_id) if patient_id else None
                patient_dict = patient_obj.to_dict() if patient_obj else None

                # Query prior longitudinal scans for rate-of-progression analysis
                prior_scans_summary = []
                if patient_id:
                    priors = PredictionHistory.query.filter(
                        PredictionHistory.patient_id == patient_id,
                        PredictionHistory.id != history_entry.id
                    ).order_by(PredictionHistory.created_at.desc()).limit(3).all()
                    prior_scans_summary = [
                        {
                            "id": p.id,
                            "date": p.created_at.strftime("%Y-%m-%d") if p.created_at else "Prior",
                            "predicted_class": p.predicted_class,
                            "confidence": p.confidence,
                            "risk_level": p.risk_level
                        }
                        for p in priors
                    ]

                gemini_svc = GeminiService()
                dossier_json = gemini_svc.generate_clinical_narrative(
                    patient_data=patient_dict,
                    prediction_data={
                        "predicted_class": pred_result["predicted_class"],
                        "confidence": pred_result["confidence"],
                        "risk_score": risk_info["score"],
                        "uncertainty_margin": pred_result.get("uncertainty_margin", 0.0),
                        "certainty_tier": pred_result.get("clinical_certainty_tier", "High"),
                        "prior_scans": prior_scans_summary,
                    },
                    risk_level=risk_info["level"],
                    region_importance=gradcam_data.get("region_importance") if gradcam_data else None,
                )
                clinical_report = ClinicalReport(
                    prediction_id=history_entry.id,
                    patient_id=patient_id,
                    generated_by_id=uploaded_by_id,
                    ai_narrative=dossier_json,
                    status="DRAFT",
                )
                db.session.add(clinical_report)
            except Exception as rep_err:
                print(f"Warning: Auto-generation of initial clinical report skipped: {rep_err}")

            db.session.commit()

        except Exception as exc:
            db.session.rollback()
            print(f"Database error: {exc}")
            return None, "Prediction was generated, but saving the result to database failed.", 500

        # ==================================================
        # RESPONSE (Compatible with both data.prediction_id and data.prediction.id)
        # ==================================================
        pred_dict = history_entry.to_dict()
        pred_dict["uncertainty_margin"] = pred_result.get("uncertainty_margin", 0.0)
        pred_dict["entropy_score"] = pred_result.get("entropy_score", 0.0)
        pred_dict["clinical_certainty_tier"] = pred_result.get("clinical_certainty_tier", "High")
        pred_dict["anatomical_validation"] = pred_result.get("anatomical_validation", {})
        if gradcam_data:
            pred_dict["hemispheric_asymmetry"] = gradcam_data.get("hemispheric_asymmetry")
            pred_dict["saliency_coverage"] = gradcam_data.get("saliency_coverage")

        response_data = {
            "success": True,
            "prediction_id": history_entry.id,
            "prediction": pred_dict,
            "uncertainty_metrics": {
                "uncertainty_margin": pred_result.get("uncertainty_margin", 0.0),
                "entropy_score": pred_result.get("entropy_score", 0.0),
                "clinical_certainty_tier": pred_result.get("clinical_certainty_tier", "High"),
                "anatomical_validation": pred_result.get("anatomical_validation", {}),
            },
            "hemispheric_asymmetry": gradcam_data.get("hemispheric_asymmetry") if gradcam_data else None,
            "saliency_coverage": gradcam_data.get("saliency_coverage") if gradcam_data else None,
        }

        return response_data, None, 200