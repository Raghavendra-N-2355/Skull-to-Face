#!/bin/bash
set -e

echo "Checking for model files..."

# Define model file paths
MODEL_DIR="/app/Model"
MODELS=(
  "reconstructor.pth"
  "skull_classifier.pth"
  "skull_gender_model.pth"
)

# Create Model directory if it doesn't exist
mkdir -p "$MODEL_DIR"

# Check if all models exist, if not you can add download logic here
for model in "${MODELS[@]}"; do
  if [ ! -f "$MODEL_DIR/$model" ]; then
    echo "Warning: $MODEL_DIR/$model not found"
    echo "Models should be present for the app to function"
    echo "Consider: mounting model files, using Git LFS, or downloading from storage"
  fi
done

echo "Starting Flask application..."
exec gunicorn --bind 0.0.0.0:8080 app:app --workers 1 --threads 8
