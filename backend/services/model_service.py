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

    def predict(self, image):

        transform = self.get_transform()

        image_tensor = transform(
            image
        )

        input_tensor = image_tensor.unsqueeze(
            0
        ).to(self.device)

        with torch.no_grad():

            outputs = self.model(
                input_tensor
            )

            probabilities = torch.softmax(
                outputs,
                dim=1
            )[0]

        predicted_index = int(
            torch.argmax(
                probabilities
            ).item()
        )

        predicted_class = (
            self.class_names[
                predicted_index
            ]
        )

        confidence = float(
            probabilities[
                predicted_index
            ].item()
        )

        class_probabilities = {

            class_name: float(
                probability
            )

            for class_name, probability
            in zip(
                self.class_names,
                probabilities.cpu().numpy()
            )
        }

        return {
            "predicted_class": predicted_class,
            "predicted_index": predicted_index,
            "confidence": confidence,
            "class_probabilities":
                class_probabilities
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