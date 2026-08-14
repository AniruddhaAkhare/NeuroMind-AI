import os
import torch
import torch.nn as nn
import torchvision.models as models

def initialize_model_checkpoint(save_path):
    print(f"Initializing EfficientNet-B3 model checkpoint at {save_path}...")
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    model = models.efficientnet_b3(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.4, inplace=True),
        nn.Linear(in_features, 256),
        nn.ReLU(),
        nn.Dropout(p=0.3),
        nn.Linear(256, 4)
    )
    
    checkpoint = {
        'model_state_dict': model.state_dict(),
        'architecture': 'efficientnet_b3',
        'classes': ["NonDemented", "VeryMildDemented", "MildDemented", "ModerateDemented"]
    }
    torch.save(checkpoint, save_path)
    print("Checkpoint successfully created and saved.")

if __name__ == '__main__':
    target_path = os.path.join(os.path.dirname(__file__), 'model.pth')
    initialize_model_checkpoint(target_path)
