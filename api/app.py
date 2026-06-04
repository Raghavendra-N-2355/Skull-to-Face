import os
import sys
import uuid
import shutil
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Support both local repo layout and container build layout:
# - Local: api/app.py -> ../Model
# - Container: /app/app.py -> ./Model
local_model_path = os.path.join(os.path.dirname(__file__), '..', 'Model')
container_model_path = os.path.join(os.path.dirname(__file__), 'Model')
if os.path.isdir(local_model_path):
    sys.path.insert(0, local_model_path)
elif os.path.isdir(container_model_path):
    sys.path.insert(0, container_model_path)
else:
    raise FileNotFoundError('Could not locate Model directory for predict.py')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
RECON_DIR = os.path.join(BASE_DIR, 'recon')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RECON_DIR, exist_ok=True)

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'service': 'Skull-to-Face Reconstruction API'}), 200

@app.route('/api/predict', methods=['POST'])
def api_predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    f = request.files['file']
    if f.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    uid = str(uuid.uuid4())
    fname = f'{uid}_{secure_filename(f.filename)}'
    in_path = os.path.join(UPLOAD_DIR, fname)
    f.save(in_path)

    try:
        from predict import run_pipeline
    except Exception as e:
        return jsonify({'error': f'Failed to import prediction module: {e}'}), 500

    try:
        result = run_pipeline(in_path, visualize=False)

        recon_local = result.get('reconstruction_path')
        if recon_local and os.path.exists(recon_local):
            recon_name = f'{uid}_reconstructed.png'
            dst = os.path.join(RECON_DIR, recon_name)
            shutil.copyfile(recon_local, dst)
            result['reconstruction_url'] = f'/recon/{recon_name}'
        
        return jsonify(result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/recon/<path:name>')
def serve_recon(name):
    return send_from_directory(RECON_DIR, name)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
