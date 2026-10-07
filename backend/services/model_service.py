import json
from pathlib import Path

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image


class ModelService:

    def __init__(self, model_dir=None):

        # --------------------------------------------------
        # Model directory
        # --------------------------------------------------

        if model_dir is None:
            model_dir = (
                Path(__file__).resolve().parent.parent
                / "exported_model"
            )

        self.model_dir = Path(model_dir)

        # --------------------------------------------------
        # Required files
        # --------------------------------------------------

        self.model_path = (
            self.model_dir / "model.pth"
        )

        self.class_labels_path = (
            self.model_dir / "class_labels.json"
        )

        self.preprocessing_path = (
            self.model_dir / "preprocessing_config.json"
        )

        self.model_info_path = (
            self.model_dir / "model_info.json"
        )

        # --------------------------------------------------
        # Device
        # --------------------------------------------------

        self.device = torch.device(
            "cuda"
            if torch.cuda.is_available()
            else "cpu"
        )

        print(
            f"ModelService device: {self.device}"
        )

        # --------------------------------------------------
        # Make sure real model exists
        # --------------------------------------------------

        if not self.model_path.exists():

            raise FileNotFoundError(
                f"REAL trained model not found at: "
                f"{self.model_path}\n"
                f"Please place model.pth inside "
                f"backend/exported_model/"
            )

        # --------------------------------------------------
        # Load class labels
        # --------------------------------------------------

        if not self.class_labels_path.exists():
            raise FileNotFoundError(
                f"Missing class_labels.json: "
                f"{self.class_labels_path}"
            )

        with open(
            self.class_labels_path,
            "r"
        ) as f:

            class_config = json.load(f)

        self.class_names = class_config["classes"]

        # --------------------------------------------------
        # Verify expected classes
        # --------------------------------------------------

        expected_classes = [
            "NonDemented",
            "VeryMildDemented",
            "MildDemented",
            "ModerateDemented"
        ]

        if self.class_names != expected_classes:

            raise ValueError(
                "Class order does not match the trained model.\n"
                f"Expected: {expected_classes}\n"
                f"Found: {self.class_names}"
            )

        self.num_classes = len(
            self.class_names
        )

        # --------------------------------------------------
        # Load preprocessing configuration
        # --------------------------------------------------

        if not self.preprocessing_path.exists():
            raise FileNotFoundError(
                f"Missing preprocessing_config.json: "
                f"{self.preprocessing_path}"
            )

        with open(
            self.preprocessing_path,
            "r"
        ) as f:

            self.preprocessing_config = json.load(f)

        self.img_size = int(
            self.preprocessing_config["input_size"]
        )

        self.mean = self.preprocessing_config[
            "mean"
        ]

        self.std = self.preprocessing_config[
            "std"
        ]

        # --------------------------------------------------
        # Build EXACT trained architecture
        # --------------------------------------------------

        self.model = self._build_model()

        # --------------------------------------------------
        # Load REAL trained weights
        # --------------------------------------------------

        print(
            f"Loading trained model from:\n"
            f"{self.model_path}"
        )

        checkpoint = torch.load(
            self.model_path,
            map_location=self.device
        )

        # The exported checkpoint contains:
        # model_state_dict
        if "model_state_dict" not in checkpoint:

            raise ValueError(
                "model.pth does not contain "
                "'model_state_dict'. "
                "This does not appear to be the expected "
                "trained model checkpoint."
            )

        self.model.load_state_dict(
            checkpoint["model_state_dict"]
        )

        self.model.to(
            self.device
        )

        self.model.eval()

        print(
            "SUCCESS: Final trained "
            "EfficientNet-B3 model loaded."
        )

        print(
            f"Classes: {self.class_names}"
        )

        print(
            f"Input size: "
            f"{self.img_size} x {self.img_size}"
        )

    # ======================================================
    # BUILD MODEL
    # ======================================================

    def _build_model(self):

        model = models.efficientnet_b3(
            weights=None
        )

        in_features = (
            model.classifier[1].in_features
        )

        # EXACT classifier used during training
        model.classifier = nn.Sequential(

            nn.Dropout(
                p=0.4,
                inplace=True
            ),

            nn.Linear(
                in_features,
                256
            ),

            nn.ReLU(),

            nn.Dropout(
                p=0.3
            ),

            nn.Linear(
                256,
                self.num_classes
            )
        )

        return model

    # ======================================================
    # IMAGE TRANSFORM
    # ======================================================

    def get_transform(self):

        return transforms.Compose([

            transforms.Resize(
                (
                    self.img_size,
                    self.img_size
                )
            ),

            transforms.ToTensor(),

            transforms.Normalize(
                mean=self.mean,
                std=self.std
            )
        ])

    # ======================================================
    # PREDICT
    # ======================================================

    def load_medical_image(self, image_input):
        """
        Universal medical image ingestor supporting:
        - DICOM files (.dcm) via pydicom
        - NIfTI 3D neuroimaging files (.nii, .nii.gz) via nibabel
        - Standard image bytes and file paths (JPEG, PNG) via PIL
        """
        import io
        import numpy as np
        from PIL import Image

        # 1. Byte stream inspection for DICOM or standard image
        if isinstance(image_input, bytes):
            # Check for DICOM magic header
            if len(image_input) > 132 and image_input[128:132] == b"DICM":
                try:
                    import pydicom
                    dcm = pydicom.dcmread(io.BytesIO(image_input))
                    arr = dcm.pixel_array.astype(np.float32)
                    arr = (arr - arr.min()) / (arr.max() - arr.min() + 1e-6) * 255.0
                    return Image.fromarray(arr.astype(np.uint8)).convert("RGB")
                except Exception as e:
                    print(f"DICOM bytes parse fallback: {e}")
            return Image.open(io.BytesIO(image_input)).convert("RGB")

        # 2. String file path
        elif isinstance(image_input, str):
            path_lower = image_input.lower()
            if path_lower.endswith(".dcm"):
                try:
                    import pydicom
                    dcm = pydicom.dcmread(image_input)
                    arr = dcm.pixel_array.astype(np.float32)
                    arr = (arr - arr.min()) / (arr.max() - arr.min() + 1e-6) * 255.0
                    return Image.fromarray(arr.astype(np.uint8)).convert("RGB")
                except Exception as e:
                    print(f"DICOM file path load fallback: {e}")
            elif path_lower.endswith(".nii") or path_lower.endswith(".nii.gz"):
                try:
                    import nibabel as nib
                    nii = nib.load(image_input)
                    data = nii.get_fdata()
                    # Extract central axial slice
                    mid_slice = data[:, :, data.shape[2] // 2]
                    mid_slice = (mid_slice - mid_slice.min()) / (mid_slice.max() - mid_slice.min() + 1e-6) * 255.0
                    return Image.fromarray(mid_slice.astype(np.uint8)).convert("RGB")
                except Exception as e:
                    print(f"NIfTI file path load fallback: {e}")
            return Image.open(image_input).convert("RGB")

        # 3. Existing PIL Image or generic object
        elif isinstance(image_input, Image.Image):
            return image_input.convert("RGB")
        else:
            try:
                return Image.open(image_input).convert("RGB")
            except Exception:
                return image_input

    def predict(self, image):
        import numpy as np

        # Normalize across DICOM, NIfTI, bytes, or PIL Image
        image = self.load_medical_image(image)

        transform = self.get_transform()
        image_tensor = transform(image)
        input_tensor = image_tensor.unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(input_tensor)
            probabilities = torch.softmax(outputs, dim=1)[0]

        predicted_index = int(torch.argmax(probabilities).item())
        predicted_class = self.class_names[predicted_index]
        confidence = float(probabilities[predicted_index].item())

        probs_np = probabilities.cpu().numpy()
        class_probabilities = {
            class_name: float(probability)
            for class_name, probability in zip(self.class_names, probs_np)
        }

        # Shannon Entropy & Clinical Uncertainty Quantification
        # Normalized entropy across 4 classes: H in [0.0, 1.0]
        entropy = float(-np.sum([p * np.log2(p + 1e-12) for p in probs_np]) / 2.0)
        uncertainty_margin = round(float((1.0 - confidence) * 100), 2)

        if confidence >= 0.85 and entropy < 0.35:
            certainty_tier = "High Clinical Certainty"
        elif confidence >= 0.65:
            certainty_tier = "Moderate Clinical Certainty"
        else:
            certainty_tier = "Borderline / Clinical Review Recommended"

        # Anatomical Brain Sanity Validation
        img_np = np.array(image.convert("L"))
        mean_val = float(np.mean(img_np))
        std_val = float(np.std(img_np))
        is_valid_brain = bool(std_val > 10.0 and 10.0 < mean_val < 245.0)

        return {
            "predicted_class": predicted_class,
            "predicted_index": predicted_index,
            "confidence": confidence,
            "class_probabilities": class_probabilities,
            "uncertainty_margin": uncertainty_margin,
            "entropy_score": round(entropy, 4),
            "clinical_certainty_tier": certainty_tier,
            "anatomical_validation": {
                "is_valid_brain_mri": is_valid_brain,
                "mean_intensity": round(mean_val, 1),
                "contrast_std": round(std_val, 1),
                "scan_quality": "Optimal" if std_val > 25.0 else "Adequate",
            }
        }

    # ======================================================
    # GET MODEL
    # ======================================================

    def get_model(self):
        return self.model

    # ======================================================
    # GET DEVICE
    # ======================================================

    def get_device(self):
        return self.device

    # ======================================================
    # GET CLASS NAMES
    # ======================================================

    def get_class_names(self):
        return self.class_names