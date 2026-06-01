# orchestrator.py
# Single-file orchestrator that calls the three models in sequence:
# 1) skull vs animal classifier
# 2) if human -> gender classifier
# 3) pass skull + gender to reconstructor to produce face
#
# Place this file in the same project folder as:
# - skull_classifier.pth
# - class_names.json        (from training the classifier)
# - skull_gender_model.pth
# - saved_models/reconstructor.pth
#
# Usage examples:
#   python orchestrator.py path/to/skull.jpg
#   python orchestrator.py data/train/skulls/011.jpeg
#
# NOTE: If your gender classifier's class->index mapping is different,
# edit GENDER_LABEL_MAP accordingly.

import sys
import os
import json
from PIL import Image


import torch
import torch.nn as nn
from torchvision import transforms, models

# -----------------------------
# Config (edit if necessary)
# -----------------------------
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
SKULL_CLASSIFIER_PTH = os.path.join(MODEL_DIR, "skull_classifier.pth")
CLASS_NAMES_JSON = os.path.join(os.path.dirname(MODEL_DIR), "class_names.json")
GENDER_MODEL_PTH = os.path.join(MODEL_DIR, "skull_gender_model.pth")
RECONSTRUCTOR_PTH = os.path.join(MODEL_DIR, "reconstructor.pth")

# Map gender-model output index -> string label.
# ImageFolder loads alphabetically: female (0), male (1)
GENDER_LABEL_MAP = {0: "female", 1: "male"}

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -----------------------------
# Helper transforms
# -----------------------------
clf_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

gender_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

recon_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
])

# -----------------------------
# Recreate architectures (no changes to your model code logic)
# -----------------------------
def build_skull_vs_animal_model(num_classes):
    model = models.resnet18(weights=None)
    # Unfreeze last block + fc was used during training — for inference it's fine
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    return model

def build_gender_model():
    # replicate the training architecture: resnet50 with custom fc ending in LogSoftmax
    model = models.resnet50(pretrained=False)
    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_ftrs, 512),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(512, 2),
        nn.LogSoftmax(dim=1)
    )
    return model

# Recreate your SkullToFaceModel exactly as in your generate_face code:
class SkullToFaceModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder = models.resnet18(weights=None)
        self.encoder.fc = nn.Identity()
        self.fc_gender = nn.Linear(1, 64)
        self.decoder = nn.Sequential(
            nn.Linear(512 + 64, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 3 * 256 * 256),
            nn.Sigmoid()
        )

    def forward(self, skull, gender):
        feat = self.encoder(skull)
        g_feat = self.fc_gender(gender.unsqueeze(1))
        out = self.decoder(torch.cat([feat, g_feat], dim=1))
        return out.view(-1, 3, 256, 256)

# -----------------------------
# Load helpers
# -----------------------------
def load_class_names(json_path):
    # Try to locate the class names JSON with several fallbacks to be robust
    candidates = [json_path,
                  os.path.join(os.path.dirname(json_path), "class_names.json"),
                  os.path.join(os.path.dirname(os.path.dirname(json_path)), "class_names.json"),
                  "class_names.json"]
    for p in candidates:
        if p and os.path.exists(p):
            try:
                with open(p, "r") as f:
                    classes = json.load(f)
                return classes
            except Exception:
                continue
    # As a last resort, fall back to a sensible default to avoid crashes in production
    default = ["animal_skull", "human_skull"]
    print(f"Warning: class_names.json not found at any candidate paths {candidates}. Using default: {default}")
    return default

def load_skull_classifier(path, class_names):
    model = build_skull_vs_animal_model(len(class_names)).to(device)
    state = torch.load(path, map_location=device)
    model.load_state_dict(state)
    model.eval()
    return model

def load_gender_classifier(path):
    model = build_gender_model().to(device)
    state = torch.load(path, map_location=device)
    model.load_state_dict(state)
    model.eval()
    return model

def load_reconstructor(path):
    model = SkullToFaceModel().to(device)
    state = torch.load(path, map_location=device)
    model.load_state_dict(state)
    model.eval()
    return model

# -----------------------------
# Orchestration pipeline
# -----------------------------
def predict_skull_vs_animal(model, pil_img):
    x = clf_transform(pil_img).unsqueeze(0).to(device)
    with torch.no_grad():
        logits = model(x)
        probs = torch.softmax(logits, dim=1)
        pred_idx = torch.argmax(probs, dim=1).item()
        pred_prob = probs[0, pred_idx].item()
    return pred_idx, pred_prob

def predict_gender(model, pil_img):
    x = gender_transform(pil_img).unsqueeze(0).to(device)
    with torch.no_grad():
        log_probs = model(x)                # model outputs LogSoftmax
        pred_idx = torch.argmax(log_probs, dim=1).item()
    return pred_idx

def reconstruct_face(reconstructor, pil_img, gender_label, out_path="reconstructed_face.png"):
    skull_tensor = recon_transform(pil_img).unsqueeze(0).to(device)
    # map gender_label ("male"/"female") to float 0/1 to match training scheme used in your reconstruct code
    gender_map = {"male": 0.0, "female": 1.0}
    if gender_label.lower() not in gender_map:
        raise ValueError(f"Unknown gender label '{gender_label}'. Expected one of {list(gender_map.keys())}")
    gender_tensor = torch.tensor([gender_map[gender_label.lower()]], dtype=torch.float32).to(device)

    with torch.no_grad():
        face = reconstructor(skull_tensor, gender_tensor)
    face_img = transforms.ToPILImage()(face.squeeze().cpu())
    face_img.save(out_path)
    return out_path, face_img

# -----------------------------
# Main runner
# -----------------------------
def run_pipeline(input_image_path, visualize=True):
    if not os.path.exists(input_image_path):
        raise FileNotFoundError(f"Input image not found: {input_image_path}")

    # Load resources
    class_names = load_class_names(CLASS_NAMES_JSON)
    skull_clf = load_skull_classifier(SKULL_CLASSIFIER_PTH, class_names)
    gender_clf = load_gender_classifier(GENDER_MODEL_PTH)
    reconstructor = load_reconstructor(RECONSTRUCTOR_PTH)

    pil_img = Image.open(input_image_path).convert("RGB")

    # Step 1: skull vs animal classifier
    pred_idx, pred_prob = predict_skull_vs_animal(skull_clf, pil_img)
    predicted_label = class_names[pred_idx]
    print(f"[1] Skull classifier -> predicted: '{predicted_label}' (prob: {pred_prob:.3f})")

    if "human" not in predicted_label.lower():
        # Treat any non-human label as animal (stop here)
        print("Result: detected an animal skull (no further processing).")
        return {
            "stage": "animal_detected",
            "label": predicted_label,
            "prob": float(pred_prob),
            "skull_prob": float(pred_prob),
            "skull_label": predicted_label
        }

    # Step 2: gender classification
    gender_idx = predict_gender(gender_clf, pil_img)
    gender_label = GENDER_LABEL_MAP.get(gender_idx, f"idx_{gender_idx}")
    print(f"[2] Gender classifier -> predicted index: {gender_idx} -> label: '{gender_label}'")

    # Step 3: reconstruction
    out_path, face_img = reconstruct_face(reconstructor, pil_img, gender_label, out_path="reconstructed_face.png")
    print(f"[3] Reconstruction -> saved to: {out_path}")

    if visualize:
        try:
            import matplotlib.pyplot as plt
        except ImportError:
            print("matplotlib is not installed; skipping visualization")
        else:
            plt.figure(figsize=(8,4))
            plt.subplot(1,2,1); plt.title("Input Skull"); plt.imshow(pil_img); plt.axis("off")
            plt.subplot(1,2,2); plt.title(f"Reconstructed Face ({gender_label})"); plt.imshow(face_img); plt.axis("off")
            plt.show()

    # Return a consistent result dict for API consumers (include keys frontend expects)
    return {
        "stage": "reconstruction",
        "label": predicted_label,
        "prob": float(pred_prob),
        "skull_prob": float(pred_prob),
        "skull_label": predicted_label,
        "gender": gender_label,
        "gender_label": gender_label,
        "reconstruction_path": os.path.abspath(out_path)
    }

# -----------------------------
# CLI entrypoint
# -----------------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python orchestrator.py path/to/skull_image.jpg")
        sys.exit(1)

    #img_path = sys.argv[1]
    result = run_pipeline("teating image 1m.jpeg")
    print("Pipeline result:", result)
