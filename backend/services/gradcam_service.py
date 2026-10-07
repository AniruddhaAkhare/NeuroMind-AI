import os
import cv2
import numpy as np
import torch


class GradCAMService:

    def __init__(self, model_service):
        self.model_service = model_service

    def generate_gradcam(
        self,
        image,
        output_gradcam_path,
        target_category_idx=None,
        output_heatmap_path=None
    ):
        """
        Generate real PyTorch gradient-weighted Class Activation Mapping (Grad-CAM),
        exporting both the blended overlay and raw saliency heatmap, as well as
        computing peak defect coordinates and anatomical region activations.
        """
        model = self.model_service.model
        device = self.model_service.device

        model.eval()

        gradients = []
        activations = []

        try:
            # ==================================================
            # PREPROCESS
            # ==================================================
            import io
            from PIL import Image

            if isinstance(image, bytes):
                image = Image.open(io.BytesIO(image)).convert("RGB")
            elif isinstance(image, str):
                image = Image.open(image).convert("RGB")
            elif not isinstance(image, Image.Image):
                try:
                    image = Image.open(image).convert("RGB")
                except Exception:
                    pass

            transform = self.model_service.get_transform()
            input_tensor = transform(image).unsqueeze(0).to(device)

            # ==================================================
            # TARGET LAYER (Last convolutional block of EfficientNet-B3)
            # ==================================================
            target_layer = model.features[-1]

            # ==================================================
            # FORWARD & BACKWARD HOOKS
            # ==================================================
            def forward_hook(module, module_input, output):
                activations.append(output)

            def backward_hook(module, grad_input, grad_output):
                gradients.append(grad_output[0])

            forward_handle = target_layer.register_forward_hook(forward_hook)
            backward_handle = target_layer.register_full_backward_hook(backward_hook)

            try:
                # ==================================================
                # FORWARD PASS
                # ==================================================
                model.zero_grad()
                outputs = model(input_tensor)

                # ==================================================
                # TARGET CLASS
                # ==================================================
                if target_category_idx is None:
                    target_category_idx = int(torch.argmax(outputs, dim=1).item())

                target_score = outputs[0, target_category_idx]

                # ==================================================
                # BACKWARD PASS
                # ==================================================
                target_score.backward()

                if not activations:
                    raise RuntimeError("Grad-CAM activations were not captured.")
                if not gradients:
                    raise RuntimeError("Grad-CAM gradients were not captured.")

                # ==================================================
                # CONVERT TO NUMPY
                # ==================================================
                activation = activations[0].detach().cpu().numpy()[0]
                gradient = gradients[0].detach().cpu().numpy()[0]

                # ==================================================
                # CHANNEL WEIGHTS & CAM POOLING
                # ==================================================
                weights = np.mean(gradient, axis=(1, 2))
                cam = np.zeros(activation.shape[1:], dtype=np.float32)

                for channel, weight in enumerate(weights):
                    cam += weight * activation[channel]

                # ==================================================
                # RELU & NORMALIZATION
                # ==================================================
                cam = np.maximum(cam, 0)
                max_value = float(cam.max())
                if max_value > 0:
                    cam = cam / max_value

                # ==================================================
                # RESIZE TO INPUT DIMENSIONS
                # ==================================================
                img_size = self.model_service.img_size
                cam = cv2.resize(cam, (img_size, img_size))

                # ==================================================
                # STATS & PEAK DEFECT LOCALIZATION
                # ==================================================
                min_val, max_cam, min_loc, max_loc = cv2.minMaxLoc(cam)
                peak_px_x, peak_px_y = max_loc
                norm_x = round(peak_px_x / float(img_size), 4)
                norm_y = round(peak_px_y / float(img_size), 4)
                mean_cam = float(np.mean(cam))

                # ==================================================
                # ANATOMICAL REGION SEGMENTATION (AXIAL MAPPING)
                # ==================================================
                h, w = cam.shape
                # 1. Temporal Lobe / Hippocampus (Mid-lower bilateral quadrants)
                temporal_sub = cam[int(0.45 * h):int(0.75 * h), int(0.20 * w):int(0.80 * w)]
                temporal_score = float(np.mean(temporal_sub)) if temporal_sub.size > 0 else 0.0

                # 2. Parietal Cortex (Upper-middle bilateral lateral regions)
                parietal_left = cam[int(0.25 * h):int(0.55 * h), :int(0.35 * w)]
                parietal_right = cam[int(0.25 * h):int(0.55 * h), int(0.65 * w):]
                parietal_combined = np.concatenate([parietal_left.flatten(), parietal_right.flatten()]) if (parietal_left.size > 0 and parietal_right.size > 0) else np.array([0.0])
                parietal_score = float(np.mean(parietal_combined))

                # 3. Ventricular Margin (Periventricular central region)
                ventricle_sub = cam[int(0.35 * h):int(0.65 * h), int(0.35 * w):int(0.65 * w)]
                ventricle_score = float(np.mean(ventricle_sub)) if ventricle_sub.size > 0 else 0.0

                # 4. Frontal Cortex (Anterior upper region)
                frontal_sub = cam[:int(0.35 * h), int(0.20 * w):int(0.80 * w)]
                frontal_score = float(np.mean(frontal_sub)) if frontal_sub.size > 0 else 0.0

                region_importance = [
                    {
                        "region": "Bilateral Medial Temporal Lobe (Hippocampus)",
                        "importance": round(min(1.0, temporal_score * 1.5), 4),
                        "percentage": round(min(100.0, temporal_score * 150.0), 1),
                        "is_estimated": True,
                    },
                    {
                        "region": "Lateral Ventricular Perimeter",
                        "importance": round(min(1.0, ventricle_score * 1.4), 4),
                        "percentage": round(min(100.0, ventricle_score * 140.0), 1),
                        "is_estimated": True,
                    },
                    {
                        "region": "Parietal Cortex",
                        "importance": round(min(1.0, parietal_score * 1.3), 4),
                        "percentage": round(min(100.0, parietal_score * 130.0), 1),
                        "is_estimated": True,
                    },
                    {
                        "region": "Frontal Cortex",
                        "importance": round(min(1.0, frontal_score * 1.2), 4),
                        "percentage": round(min(100.0, frontal_score * 120.0), 1),
                        "is_estimated": True,
                    },
                ]

                # ==================================================
                # COLOR HEATMAP & BLEND
                # ==================================================
                heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
                heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)

                # Prepare original image for blending
                original = image.convert("RGB").resize((img_size, img_size))
                original_np = np.array(original).astype(np.float32) / 255.0

                heatmap_float = heatmap.astype(np.float32) / 255.0
                overlay = 0.6 * original_np + 0.4 * heatmap_float
                overlay = np.clip(overlay, 0, 1)
                overlay = np.uint8(overlay * 255)

                # ==================================================
                # PERSIST ARTIFACTS
                # ==================================================
                out_dir = os.path.dirname(output_gradcam_path)
                if out_dir:
                    os.makedirs(out_dir, exist_ok=True)

                # 1. Save composite overlay
                success_overlay = cv2.imwrite(
                    output_gradcam_path,
                    cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR)
                )
                if not success_overlay:
                    raise RuntimeError("OpenCV could not save the Grad-CAM overlay image.")

                # 2. Save pure raw heatmap
                if not output_heatmap_path:
                    dir_name = os.path.dirname(output_gradcam_path)
                    base_name = os.path.basename(output_gradcam_path)
                    raw_name = base_name.replace("gradcam_", "raw_heatmap_")
                    if raw_name == base_name:
                        raw_name = f"raw_heatmap_{base_name}"
                    output_heatmap_path = os.path.join(dir_name, raw_name)

                cv2.imwrite(
                    output_heatmap_path,
                    cv2.cvtColor(heatmap, cv2.COLOR_RGB2BGR)
                )

                # 5. Bilateral Hemispheric Asymmetry & Spatial Coverage Metrics
                left_hemi = cam[:, :w // 2]
                right_hemi = cam[:, w // 2:]
                left_mean = float(np.mean(left_hemi)) if left_hemi.size > 0 else 0.0
                right_mean = float(np.mean(right_hemi)) if right_hemi.size > 0 else 0.0
                asymmetry_index = round((right_mean - left_mean) / (right_mean + left_mean + 1e-6), 3)

                if abs(asymmetry_index) < 0.08:
                    dominant_hemisphere = "Bilateral Symmetric Atrophy"
                elif asymmetry_index > 0:
                    dominant_hemisphere = "Right Hemisphere Predominance"
                else:
                    dominant_hemisphere = "Left Hemisphere Predominance"

                high_saliency_pct = round(float((cam > 0.5).mean() * 100.0), 2)
                focal_saliency_pct = round(float((cam > 0.75).mean() * 100.0), 2)

                print(f"Grad-CAM overlay saved: {output_gradcam_path}")
                print(f"Grad-CAM raw heatmap saved: {output_heatmap_path}")

                return {
                    "success": True,
                    "overlay_path": output_gradcam_path,
                    "heatmap_path": output_heatmap_path,
                    "peak_coordinates": {
                        "x": norm_x,
                        "y": norm_y,
                        "pixel_x": int(peak_px_x),
                        "pixel_y": int(peak_px_y),
                    },
                    "region_importance": region_importance,
                    "cam_max_value": round(float(max_cam), 4),
                    "cam_mean_value": round(float(mean_cam), 4),
                    "hemispheric_asymmetry": {
                        "asymmetry_index": asymmetry_index,
                        "left_hemisphere_load": round(left_mean, 4),
                        "right_hemisphere_load": round(right_mean, 4),
                        "dominant_pattern": dominant_hemisphere,
                    },
                    "saliency_coverage": {
                        "high_saliency_area_pct": high_saliency_pct,
                        "focal_saliency_area_pct": focal_saliency_pct,
                    }
                }

            finally:
                forward_handle.remove()
                backward_handle.remove()

        except Exception as exc:
            print(f"Grad-CAM generation failed: {exc}")
            return None