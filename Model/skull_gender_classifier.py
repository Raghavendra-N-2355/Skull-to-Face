import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from tqdm import tqdm
import os

# ================================
# Prevent multiprocessing error
# ================================
if __name__ == '__main__':

    # Device setup
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")

    # ================================
    # Data Preprocessing
    # ================================
    transform_train = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    transform_test = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    # ================================
    # Load Datasets
    # ================================
    train_data = datasets.ImageFolder('Dataset2/train', transform=transform_train)
    test_data = datasets.ImageFolder('Dataset2/test', transform=transform_test)

    train_loader = DataLoader(train_data, batch_size=8, shuffle=True, num_workers=0)
    test_loader = DataLoader(test_data, batch_size=8, shuffle=False, num_workers=0)

    # ================================
    # Model: Pretrained ResNet50
    # ================================
    model = models.resnet50(pretrained=True)

    # Freeze lower layers for skull-specific fine-tuning
    for param in list(model.parameters())[:-20]:
        param.requires_grad = False

    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_ftrs, 512),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(512, 2),
        nn.LogSoftmax(dim=1)
    )

    model = model.to(device)

    # ================================
    # Loss and Optimizer
    # ================================
    criterion = nn.NLLLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.7)

    # ================================
    # Training Loop
    # ================================
    EPOCHS = 25
    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0.0
        correct, total = 0, 0

        for imgs, labels in tqdm(train_loader, desc=f"Epoch {epoch+1}/{EPOCHS}"):
            imgs, labels = imgs.to(device), labels.to(device)

            optimizer.zero_grad()
            output = model(imgs)
            loss = criterion(output, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()
            _, predicted = torch.max(output, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

        train_acc = 100 * correct / total
        print(f"Epoch [{epoch+1}/{EPOCHS}] Loss: {running_loss/len(train_loader):.4f} Acc: {train_acc:.2f}%")

        scheduler.step()

    # ================================
    # Evaluation
    # ================================
    model.eval()
    correct, total = 0, 0
    with torch.no_grad():
        for imgs, labels in test_loader:
            imgs, labels = imgs.to(device), labels.to(device)
            output = model(imgs)
            _, predicted = torch.max(output, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    print(f"Test Accuracy: {100 * correct / total:.2f}%")

    # ================================
    # Save Model
    # ================================
    torch.save(model.state_dict(), "skull_gender_model.pth")
    print("✅ Model saved successfully!")
