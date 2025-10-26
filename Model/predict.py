import torch
from torchvision import transforms, models
from torchvision.models import resnet50, ResNet50_Weights
from PIL import Image
import torch.nn as nn
import json
import warnings

warnings.filterwarnings("ignore")  # Optional: remove warnings for clean output

# ===============================
# Device setup
# ===============================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# ===============================
# TRANSFORM (common for both models)
# ===============================
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ==============================================================
# MODEL 1: Skull Type Classifier (Human / Non-Human)
# ==============================================================

# Load class names for model 1
with open("class_names.json", "r") as f:
    class_names = json.load(f)

# Load Model 1
model1 = models.resnet18(weights=None)
model1.fc = torch.nn.Linear(model1.fc.in_features, len(class_names))
model1.load_state_dict(torch.load("skull_classifier.pth", map_location=device))
model1 = model1.to(device)
model1.eval()


def classify_skull_type(image_path):
    """Predicts if image is Human Skull or Non-Human Skull"""
    img = Image.open(image_path).convert("RGB")
    img_t = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model1(img_t)
        probs = torch.nn.functional.softmax(output, dim=1)
        pred_idx = probs.argmax(dim=1).item()
        confidence = probs[0][pred_idx].item()

    return class_names[pred_idx], confidence


# ==============================================================
# MODEL 2: Human Skull Gender Classifier (Male / Female)
# ==============================================================

# Load Model 2 (ResNet50 fine-tuned)
model2 = resnet50(weights=None)
num_ftrs = model2.fc.in_features
model2.fc = nn.Sequential(
    nn.Linear(num_ftrs, 512),
    nn.ReLU(),
    nn.Dropout(0.3),
    nn.Linear(512, 2),
    nn.LogSoftmax(dim=1)
)
model2.load_state_dict(torch.load("skull_gender_model.pth", map_location=device))
model2 = model2.to(device)
model2.eval()


def classify_human_gender(image_path):
    """Predicts Male or Female Skull"""
    img = Image.open(image_path).convert("RGB")
    img_tensor = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model2(img_tensor)
        pred = torch.argmax(output, dim=1).item()
        label = "Female Skull" if pred == 0 else "Male Skull"

    return label


# ==============================================================
# MAIN PIPELINE EXECUTION
# ==============================================================

if __name__ == "__main__":
    # Example Image
    image_path = r"C:\Users\ragha\Downloads\project-bolt-sb1-juvswcru (1)\project\Dataset\training\human_skull\Human (133).jpeg"

    print("\n[STEP 1] Classifying Skull Type...")
    skull_label, skull_conf = classify_skull_type(image_path)
    print(f"Prediction: {skull_label} ({skull_conf*100:.2f}%)")

    # Run gender classification only if it's a human skull
    if skull_label.lower() == "human skull" or "human" in skull_label.lower():
        print("\n[STEP 2] Detected Human Skull → Classifying Gender...")
        gender_label = classify_human_gender(image_path)
        print(f"Final Prediction: {gender_label}")
    else:
        print("\n[STEP 2] Not a Human Skull → Gender classification skipped.")
