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

## 🌍 Public deployment for other systems

To make the app available from any system, you need two public services:

1. **Frontend** on Firebase Hosting (or similar)
2. **Backend API** on a public endpoint

The static frontend can be served globally by Firebase Hosting. The reconstruction feature will only work if the backend API is also deployed publicly and the app is built with that backend URL.

### Production setup

- Deploy frontend to Firebase Hosting
- Deploy backend to a public service such as Cloud Run, Render, Railway, or another cloud provider
- Set `VITE_API_URL` to the backend base URL before building the frontend

Example in Windows PowerShell:

```powershell
$env:VITE_API_URL = "https://your-backend-url.example.com"
npm run build
```

### Free frontend-only option

If you only want a publicly accessible frontend without the backend, deploy the `dist/` folder to Firebase Hosting. In that case, reconstruction will not work until the backend is also deployed.

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

- Deploy the frontend and backend together using Firebase Cloud Run integration:

```bash
npm install
npm run build
npx firebase login
npm run deploy:firebase
```

- This uses the `api/` folder to build the Flask backend into a Cloud Run service called `recon-backend`, and rewrites `/api/**` requests from Firebase Hosting to that service.

- Render free tier backend deployment is also supported. See the Render section below.

Notes:
- This requires enabling the Cloud Run Admin API on your Firebase project.
- The `firebase deploy` command above will deploy both hosting and backend.
- If you only want frontend hosting without the backend, use the earlier frontend-only method, but reconstruction will not work until the backend is deployed.

## Render backend deployment

To deploy the backend on Render free tier:

1. Push this repo to GitHub.
2. Create a new Web Service on Render.
3. Choose Docker as the environment and connect your GitHub repo.
4. Use `render.yaml` in the repo for service configuration, or set:
   - `Dockerfile Path`: `api/Dockerfile`
   - `Build Command`: leave empty
   - `Start Command`: leave empty
5. Set the runtime port to `8080` if asked.

### Important

- The backend uses `Model/` weights, which are large and are ignored from the repo by default.
- For Render deployment, you must ensure the model files are available in the service environment (for example by adding them through Git LFS or download logic).
- The frontend should be built with a public backend URL and `VITE_API_URL` set to the Render service address.

### Using the Render backend from the frontend

Set the backend base URL before building the frontend:

```powershell
$env:VITE_API_URL = "https://your-render-service.onrender.com"
npm run build
```

Then deploy the frontend to Firebase Hosting or another static host.
