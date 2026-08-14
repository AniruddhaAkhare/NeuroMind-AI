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
        # SAVE & LOAD IMAGE
        # ==================================================
        try:
            file.save(image_save_path)
            image = Image.open(image_save_path).convert("RGB")
        except Exception as exc:
            print(f"Image processing error: {exc}")
            return None, "Unable to save or read the uploaded image.", 500

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
        gradcam_save_path = None

        try:
            gradcam_folder = self.config["GRADCAM_FOLDER"]
            os.makedirs(gradcam_folder, exist_ok=True)
            gradcam_filename = f"gradcam_{unique_id}.png"
            gradcam_save_path = os.path.join(gradcam_folder, gradcam_filename)

            gradcam_success = self.gradcam_service.generate_gradcam(
                image=image,
                output_gradcam_path=gradcam_save_path,
                target_category_idx=pred_result["predicted_index"]
            )

            if gradcam_success:
                relative_gradcam_url = f"/uploads/gradcam/{gradcam_filename}"

        except Exception as exc:
            print(f"Grad-CAM generation failed: {exc}")
            gradcam_success = False

        relative_image_url = f"/uploads/{image_filename}"

        # ==================================================
        # SAVE TO POSTGRESQL
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

            if gradcam_success:
                xai_result = XAIResult(
                    prediction_id=history_entry.id,
                    method="GradCAM",
                    target_class=pred_result["predicted_class"],
                    target_class_index=pred_result["predicted_index"],
                    heatmap_path=relative_gradcam_url, 
                )
                db.session.add(xai_result)

            db.session.commit()

        except Exception as exc:
            db.session.rollback()
            print(f"Database error: {exc}")
            return None, "Prediction was generated, but saving the result to PostgreSQL failed.", 500

        # ==================================================
        # RESPONSE
        # ==================================================
        response_data = {
            "success": True,
            "prediction": history_entry.to_dict(),
        }

        return response_data, None, 200