from flask import Blueprint, request, jsonify

from services.model_service import ModelService
from services.gradcam_service import GradCAMService
from services.prediction_service import PredictionService


prediction_bp = Blueprint(
    "prediction",
    __name__
)


# ============================================================
# LOAD MODEL ONCE
# ============================================================

model_service = ModelService()

gradcam_service = GradCAMService(
    model_service
)


# ============================================================
# PREDICTION ENDPOINT
# ============================================================

@prediction_bp.route(
    "/predict",
    methods=["POST"]
)
def predict():

    # --------------------------------------------------------
    # CHECK IMAGE
    # --------------------------------------------------------

    if "image" not in request.files:

        return jsonify({
            "success": False,
            "error": "No image file provided in request."
        }), 400

    file = request.files["image"]

    if not file or not file.filename:

        return jsonify({
            "success": False,
            "error": "No image selected."
        }), 400

    # --------------------------------------------------------
    # PROCESS PREDICTION
    # --------------------------------------------------------

    try:

        prediction_service = PredictionService(
            model_service,
            gradcam_service
        )

        result, error, status_code = (
            prediction_service.process_prediction(
                file
            )
        )

        if error:

            return jsonify({
                "success": False,
                "error": error
            }), status_code

        return jsonify(
            result
        ), status_code

    except Exception as exc:

        print(
            f"Prediction endpoint error: {exc}"
        )

        return jsonify({
            "success": False,
            "error": (
                "An unexpected error occurred "
                "while processing the MRI."
            )
        }), 500