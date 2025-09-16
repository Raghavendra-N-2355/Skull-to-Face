import torch
from torchvision import transforms, models
from PIL import Image
import json

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load class names
with open("class_names.json", "r") as f:
    class_names = json.load(f)

# Define transforms (must match training!)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# Load model
model = models.resnet18(weights=None)
model.fc = torch.nn.Linear(model.fc.in_features, len(class_names))
model.load_state_dict(torch.load("skull_classifier.pth", map_location=device))
model = model.to(device)
model.eval()

# Prediction function
def predict(image_path):
    img = Image.open(image_path).convert("RGB")  # ensure 3 channels
    img_t = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(img_t)
        probs = torch.nn.functional.softmax(output, dim=1)
        pred_idx = probs.argmax(dim=1).item()
        confidence = probs[0][pred_idx].item()

    return class_names[pred_idx], confidence

# Example usage
image_path = r"C:\Users\ragha\Downloads\project-bolt-sb1-juvswcru (1)\project\Dataset\training\animal_skull\A (6).jpeg"
label, conf = predict(image_path)
print(f"Prediction: {label} ({conf*100:.2f}%)")
