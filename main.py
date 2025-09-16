import torch
from torchvision import datasets, transforms, models
from torch import nn, optim
from torch.utils.data import DataLoader, WeightedRandomSampler
import os
import json
from collections import Counter

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# Paths
data_dir = "dataset"
train_dir = os.path.join(data_dir, "training")
test_dir = os.path.join(data_dir, "test")

# Transforms (same for train & test)
train_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

test_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# Datasets
train_data = datasets.ImageFolder(train_dir, transform=train_transforms)
test_data = datasets.ImageFolder(test_dir, transform=test_transforms)

# Handle class imbalance
class_counts = Counter(train_data.targets)
class_weights = [1.0 / class_counts[c] for c in train_data.targets]
sampler = WeightedRandomSampler(class_weights, num_samples=len(class_weights), replacement=True)

# Dataloaders
trainloader = DataLoader(train_data, batch_size=32, sampler=sampler)
testloader = DataLoader(test_data, batch_size=32, shuffle=False)

# Model (transfer learning ResNet18)
model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)

# Unfreeze last block + FC
for name, param in model.named_parameters():
    if "layer4" in name or "fc" in name:
        param.requires_grad = True
    else:
        param.requires_grad = False

model.fc = nn.Linear(model.fc.in_features, len(train_data.classes))
model = model.to(device)

# Loss & Optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=0.0001)
scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.1)

# Training
epochs = 20
for epoch in range(epochs):
    model.train()
    running_loss = 0.0

    for images, labels in trainloader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        output = model(images)
        loss = criterion(output, labels)
        loss.backward()
        optimizer.step()
        running_loss += loss.item()

    scheduler.step()
    print(f"Epoch {epoch+1}/{epochs}, Loss: {running_loss/len(trainloader):.4f}")

# Save model + classes
torch.save(model.state_dict(), "skull_classifier.pth")
with open("class_names.json", "w") as f:
    json.dump(train_data.classes, f)

print("✅ Model & classes saved!")
