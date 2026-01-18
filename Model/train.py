import os
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from PIL import Image
from tqdm import tqdm

# ========================
# CONFIGURATION
# ========================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"✅ Using device: {device}")

data_root = "data"  # update if different
save_dir = "saved_models"
os.makedirs(save_dir, exist_ok=True)
model_path = os.path.join(save_dir, "reconstructor.pth")

# ========================
# DATASET
# ========================
class SkullFaceDataset(Dataset):
    def __init__(self, skull_dir, depth_dir, gender_csv, transform=None):
        self.skull_dir = skull_dir
        self.depth_dir = depth_dir
        self.transform = transform

        with open(gender_csv, "r") as f:
            lines = f.read().strip().split("\n")
        self.data = []
        for line in lines:
            img_name, gender = line.split(",")
            self.data.append((img_name.strip(), gender.strip().lower()))

        self.gender_map = {"male": 0, "female": 1}

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        img_name, gender = self.data[idx]
        skull_path = os.path.join(self.skull_dir, f"{img_name}.jpeg")
        depth_path = os.path.join(self.depth_dir, f"{img_name}.png")

        skull = Image.open(skull_path).convert("RGB")
        depth = Image.open(depth_path).convert("RGB")

        if self.transform:
            skull = self.transform(skull)
            depth = self.transform(depth)

        gender_tensor = torch.tensor(self.gender_map[gender], dtype=torch.float32)
        return skull, depth, gender_tensor

# ========================
# TRANSFORMS
# ========================
transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
])

# ========================
# LOAD DATASETS
# ========================
def load_data(split="train"):
    skull_dir = os.path.join(data_root, split, "skulls")
    depth_dir = os.path.join(data_root, split, "depths")
    gender_csv = os.path.join(data_root, split, "genders.csv")
    return SkullFaceDataset(skull_dir, depth_dir, gender_csv, transform)

train_dataset = load_data("train")
val_dataset = load_data("val")

print(f"📊 Train samples: {len(train_dataset)} | Val samples: {len(val_dataset)}")

train_loader = DataLoader(train_dataset, batch_size=4, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=4, shuffle=False)

# ========================
# MODEL
# ========================
class SkullToFaceModel(nn.Module):
    def __init__(self):
        super(SkullToFaceModel, self).__init__()
        self.encoder = models.resnet18(weights="IMAGENET1K_V1")
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
        g = gender.unsqueeze(1)
        g_feat = self.fc_gender(g)
        combined = torch.cat([feat, g_feat], dim=1)
        output = self.decoder(combined)
        return output.view(-1, 3, 256, 256)

# ========================
# TRAINING
# ========================
model = SkullToFaceModel().to(device)
criterion = nn.L1Loss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)
epochs = 200

print("🚀 Starting training...")
for epoch in range(epochs):
    model.train()
    train_loss = 0
    for skulls, depths, genders in tqdm(train_loader, desc=f"Epoch {epoch+1}/{epochs}"):
        skulls, depths, genders = skulls.to(device), depths.to(device), genders.to(device)
        optimizer.zero_grad()
        outputs = model(skulls, genders)
        loss = criterion(outputs, depths)
        loss.backward()
        optimizer.step()
        train_loss += loss.item()

    print(f"Epoch [{epoch+1}/{epochs}] | Loss: {train_loss/len(train_loader):.4f}")

torch.save(model.state_dict(), model_path)
print(f"✅ Model saved to {model_path}")

# ========================
# INFERENCE (RECONSTRUCTION)
# ========================
def reconstruct_face(skull_path, gender_label, output_path="reconstructed_face.png"):
    model.eval()
    skull = Image.open(skull_path).convert("RGB")
    skull = transform(skull).unsqueeze(0).to(device)
    gender_map = {"male": 0, "female": 1}
    gender = torch.tensor([gender_map[gender_label.lower()]], dtype=torch.float32).to(device)

    with torch.no_grad():
        face = model(skull, gender)
    face_img = transforms.ToPILImage()(face.squeeze().cpu())
    face_img.save(output_path)
    print(f"🧠 Reconstructed face saved to {output_path}")

# Example usage:
# reconstruct_face("test_skull.jpeg", "male")
