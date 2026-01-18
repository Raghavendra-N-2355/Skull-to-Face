import torch
from torchvision import transforms, models
from PIL import Image
import torch.nn as nn
import matplotlib.pyplot as plt

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"✅ Using device: {device}")

# === MODEL ===
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

# === LOAD TRAINED MODEL ===
model = SkullToFaceModel().to(device)
model.load_state_dict(torch.load("saved_models/reconstructor.pth", map_location=device))
model.eval()

transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
])

# === RECONSTRUCT FUNCTION ===
def reconstruct_face(skull_path, gender, output_path="reconstructed_face.png"):
    skull = Image.open(skull_path).convert("RGB")
    skull_tensor = transform(skull).unsqueeze(0).to(device)

    gender_map = {"male": 0, "female": 1}
    gender_tensor = torch.tensor([gender_map[gender.lower()]], dtype=torch.float32).to(device)

    with torch.no_grad():
        face = model(skull_tensor, gender_tensor)
    
    face_img = transforms.ToPILImage()(face.squeeze().cpu())
    face_img.save(output_path)
    print(f"🧠 Reconstructed face saved as {output_path}")

    # Show output
    plt.figure(figsize=(8, 4))
    plt.subplot(1, 2, 1)
    plt.title("Input Skull")
    plt.imshow(skull)
    plt.axis("off")

    plt.subplot(1, 2, 2)
    plt.title(f"Reconstructed Face ({gender})")
    plt.imshow(face_img)
    plt.axis("off")
    plt.show()

# Example usage:
# reconstruct_face("test_skull.jpeg", "female")
