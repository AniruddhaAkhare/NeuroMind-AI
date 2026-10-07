import os
from PIL import Image
import torchvision.transforms as transforms

def get_mri_transform():
    return transforms.Compose([
        transforms.Resize((300, 300)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

def preprocess_image(image_path):
    image = Image.open(image_path).convert('RGB')
    transform = get_mri_transform()
    tensor = transform(image).unsqueeze(0)
    return tensor, image

def validate_image_file(file, allowed_extensions, allowed_mimes, max_length):
    if not file or file.filename == '':
        return False, 'No file provided'
    
    filename = file.filename.lower()
    # Check for compound extensions like .nii.gz first
    ext = None
    if filename.endswith(".nii.gz"):
        ext = "nii.gz"
    elif '.' in filename:
        ext = filename.rsplit('.', 1)[-1]
    
    if not ext or ext not in allowed_extensions:
        return False, f'Unsupported file format .{ext}. Allowed: {", ".join(allowed_extensions)}'
    
    if file.mimetype and file.mimetype.lower() not in allowed_mimes:
        # Some OS upload DICOM/NIfTI as application/octet-stream or generic binary
        if ext not in ["dcm", "nii", "nii.gz"]:
            return False, f'Invalid file MIME type: {file.mimetype}'
        
    return True, None

