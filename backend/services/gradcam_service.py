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
        target_category_idx=None
    ):

        model = self.model_service.model
        device = self.model_service.device

        model.eval()

        gradients = []
        activations = []

        try:

            # ==================================================
            # PREPROCESS
            # ==================================================

            transform = (
                self.model_service.get_transform()
            )

            input_tensor = (
                transform(image)
                .unsqueeze(0)
                .to(device)
            )

            # ==================================================
            # TARGET LAYER
            # ==================================================

            target_layer = model.features[-1]

            # ==================================================
            # FORWARD HOOK
            # ==================================================

            def forward_hook(
                module,
                module_input,
                output
            ):
                activations.append(
                    output
                )

            # ==================================================
            # BACKWARD HOOK
            # ==================================================

            def backward_hook(
                module,
                grad_input,
                grad_output
            ):
                gradients.append(
                    grad_output[0]
                )

            forward_handle = (
                target_layer.register_forward_hook(
                    forward_hook
                )
            )

            backward_handle = (
                target_layer.register_full_backward_hook(
                    backward_hook
                )
            )

            try:

                # ==================================================
                # FORWARD
                # ==================================================

                model.zero_grad()

                outputs = model(
                    input_tensor
                )

                # ==================================================
                # TARGET CLASS
                # ==================================================

                if target_category_idx is None:

                    target_category_idx = int(
                        torch.argmax(
                            outputs,
                            dim=1
                        ).item()
                    )

                target_score = outputs[
                    0,
                    target_category_idx
                ]

                # ==================================================
                # BACKWARD
                # ==================================================

                target_score.backward()

                if not activations:
                    raise RuntimeError(
                        "Grad-CAM activations were not captured."
                    )

                if not gradients:
                    raise RuntimeError(
                        "Grad-CAM gradients were not captured."
                    )

                # ==================================================
                # CONVERT TO NUMPY
                # ==================================================

                activation = (
                    activations[0]
                    .detach()
                    .cpu()
                    .numpy()[0]
                )

                gradient = (
                    gradients[0]
                    .detach()
                    .cpu()
                    .numpy()[0]
                )

                # ==================================================
                # CHANNEL WEIGHTS
                # ==================================================

                weights = np.mean(
                    gradient,
                    axis=(1, 2)
                )

                # ==================================================
                # CAM
                # ==================================================

                cam = np.zeros(
                    activation.shape[1:],
                    dtype=np.float32
                )

                for channel, weight in enumerate(
                    weights
                ):

                    cam += (
                        weight
                        * activation[channel]
                    )

                # ==================================================
                # RELU
                # ==================================================

                cam = np.maximum(
                    cam,
                    0
                )

                # ==================================================
                # NORMALIZE
                # ==================================================

                max_value = cam.max()

                if max_value > 0:
                    cam = cam / max_value

                # ==================================================
                # RESIZE
                # ==================================================

                img_size = (
                    self.model_service.img_size
                )

                cam = cv2.resize(
                    cam,
                    (
                        img_size,
                        img_size
                    )
                )

                # ==================================================
                # HEATMAP
                # ==================================================

                heatmap = cv2.applyColorMap(
                    np.uint8(
                        255 * cam
                    ),
                    cv2.COLORMAP_JET
                )

                heatmap = cv2.cvtColor(
                    heatmap,
                    cv2.COLOR_BGR2RGB
                )

                # ==================================================
                # ORIGINAL IMAGE
                # ==================================================

                original = (
                    image
                    .convert("RGB")
                    .resize(
                        (
                            img_size,
                            img_size
                        )
                    )
                )

                original_np = np.array(
                    original
                ).astype(
                    np.float32
                ) / 255.0

                # ==================================================
                # OVERLAY
                # ==================================================

                heatmap_float = (
                    heatmap.astype(
                        np.float32
                    ) / 255.0
                )

                overlay = (
                    0.6 * original_np
                    + 0.4 * heatmap_float
                )

                overlay = np.clip(
                    overlay,
                    0,
                    1
                )

                overlay = np.uint8(
                    overlay * 255
                )

                # ==================================================
                # SAVE
                # ==================================================

                output_directory = (
                    os.path.dirname(
                        output_gradcam_path
                    )
                )

                if output_directory:

                    os.makedirs(
                        output_directory,
                        exist_ok=True
                    )

                success = cv2.imwrite(
                    output_gradcam_path,
                    cv2.cvtColor(
                        overlay,
                        cv2.COLOR_RGB2BGR
                    )
                )

                if not success:

                    raise RuntimeError(
                        "OpenCV could not save "
                        "the Grad-CAM image."
                    )

                print(
                    f"Grad-CAM saved: "
                    f"{output_gradcam_path}"
                )

                return True

            finally:

                forward_handle.remove()
                backward_handle.remove()

        except Exception as exc:

            print(
                f"Grad-CAM generation failed: {exc}"
            )

            return False