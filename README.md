# SkullRecon AI - Facial Reconstruction System

A complete AI-powered facial reconstruction system that analyzes skull images and generates reconstructed faces.

## 🔄 Workflow

1. **Skull Classification** - Identifies if the skull is human or animal
2. **Gender Detection** - Predicts gender (only for human skulls)
3. **Face Reconstruction** - Generates facial reconstruction based on skull and gender

## 🚀 Setup Instructions

### Backend Setup

1. **Navigate to the api folder:**
   ```bash
   cd api
   ```

2. **Activate your virtual environment:**
   ```bash
   # If using venv in parent directory
   ..\\venv\\Scripts\\activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Flask server:**
   ```bash
   python app.py
   ```
   The API will start at `http://localhost:5000`

### Frontend Setup

1. **Open a new terminal in the project root:**
   ```bash
   cd c:\\Users\\ragha\\OneDrive\\Desktop\\facial_reconstruction_UI\\project
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The UI will open at `http://localhost:5173`

## 📁 Project Structure

```
project/
├── api/
│   ├── app.py              # Flask backend
│   ├── requirements.txt    # Python dependencies
│   ├── uploads/           # Uploaded skull images
│   └── recon/             # Generated face images
├── Model/
│   ├── predict.py         # Sequential workflow orchestrator
│   ├── skull_classifier.pth
│   ├── skull_gender_model.pth
│   └── reconstructor.pth
├── src/
│   ├── App.jsx            # Main React component
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎯 Usage

1. Start the backend server (Flask)
2. Start the frontend server (Vite)
3. Open the UI in your browser
4. Upload a skull image
5. Click "Start Reconstruction"
6. View the analysis results and reconstructed face

## 🛠️ Model Files Required

Make sure these files exist in the `Model/` directory:
- `skull_classifier.pth` - Skull vs Animal classifier
- `skull_gender_model.pth` - Gender classification model
- `reconstructor.pth` - Face reconstruction model
- `class_names.json` - Class labels (in parent directory)

## 📝 Notes

- Supported image formats: JPG, PNG
- The workflow automatically stops if an animal skull is detected
- All model processing happens sequentially without modification to model code
