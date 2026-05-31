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

## 📝 Notes


# Skull-to-Face UI and API

This repository contains the Vite React frontend and a Flask backend for the Skull-to-Face project.

Quick deploy steps (summary):

- Build and deploy frontend to Firebase Hosting:

```bash
npm install
npm run build
# configure Firebase with `firebase login` and `firebase init` (hosting)
firebase use YOUR_FIREBASE_PROJECT_ID
firebase deploy --only hosting
```

- Build and deploy backend to Cloud Run (from the `api/` folder):

```bash
cd api
# build and push with gcloud or use Cloud Build
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/recon-backend
gcloud run deploy recon-backend --image gcr.io/$(gcloud config get-value project)/recon-backend --platform managed --region us-central1 --allow-unauthenticated
```

- Configure Firebase Hosting rewrite to the Cloud Run service: edit `firebase.json` rewrites section if needed. Replace `YOUR_FIREBASE_PROJECT_ID` in `.firebaserc` with your Firebase project id.

Notes:
- The Flask backend is containerized via `api/Dockerfile` and can be deployed to Cloud Run.
- You will need Google Cloud SDK (`gcloud`) and Firebase CLI installed and authenticated.
