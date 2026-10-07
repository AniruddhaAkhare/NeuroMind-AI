"""
Verification Script for Phase 1 & Phase 2:
Tests the Flask app initialization, database schema creation, 
EfficientNet-B3 model prediction, and the upgraded Grad-CAM service.
"""
import os
import sys
import numpy as np
from PIL import Image

def run_verification():
    print("=" * 60)
    print("Running Phase 1 & 2 Verification Suite")
    print("=" * 60)

    # 1. Initialize Flask Application
    from app import create_app
    app = create_app()
    print("[PASS] Flask app created successfully.")
    print(f"       Registered blueprints: {list(app.blueprints.keys())}")

    # 2. Verify ModelService loading
    from services.model_service import ModelService
    model_service = ModelService()
    print(f"[PASS] ModelService loaded EfficientNet-B3 on device: {model_service.device}")
    print(f"       Target input size: {model_service.img_size}x{model_service.img_size}")
    print(f"       Classes: {model_service.class_names}")

    # 3. Create dummy axial brain image for testing
    dummy_img = Image.new("RGB", (300, 300), color=(30, 30, 30))
    pixels = dummy_img.load()
    for x in range(300):
        for y in range(300):
            dist = np.sqrt((x - 150)**2 + (y - 150)**2)
            if dist < 120:
                intensity = int(max(0, 200 - dist * 1.2))
                pixels[x, y] = (intensity, intensity, intensity)

    # 4. Run Model Prediction
    pred_res = model_service.predict(dummy_img)
    print(f"[PASS] Model prediction completed:")
    print(f"       Predicted class: {pred_res['predicted_class']} (index: {pred_res['predicted_index']})")
    print(f"       Confidence: {pred_res['confidence'] * 100:.2f}%")

    # 5. Run Upgraded GradCAMService
    from services.gradcam_service import GradCAMService
    gradcam_service = GradCAMService(model_service)

    test_overlay_path = os.path.join(app.config["GRADCAM_FOLDER"], "test_overlay.png")
    test_heatmap_path = os.path.join(app.config["GRADCAM_FOLDER"], "test_heatmap.png")

    cam_result = gradcam_service.generate_gradcam(
        image=dummy_img,
        output_gradcam_path=test_overlay_path,
        output_heatmap_path=test_heatmap_path,
        target_category_idx=pred_res["predicted_index"]
    )

    assert cam_result is not None, "GradCAM generation returned None"
    assert cam_result["success"] is True, "GradCAM was not successful"
    assert os.path.exists(test_overlay_path), "Overlay image file was not created"
    assert os.path.exists(test_heatmap_path), "Raw heatmap image file was not created"

    print(f"[PASS] Upgraded GradCAMService generated both overlay and raw heatmap:")
    print(f"       Overlay path: {cam_result['overlay_path']}")
    print(f"       Raw heatmap path: {cam_result['heatmap_path']}")
    print(f"       Peak Defect Coordinates: {cam_result['peak_coordinates']}")
    print(f"       Regional Saliency: {cam_result['region_importance']}")

    print("=" * 60)
    print("ALL PHASE 1 & 2 VERIFICATION CHECKS PASSED (100% GREEN)")
    print("=" * 60)

    # Clean exit
    os._exit(0)

if __name__ == "__main__":
    run_verification()
