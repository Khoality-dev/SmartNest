import requests
from smartnest.main import *
import os
# app.py
from flask import Flask, render_template, request, redirect, url_for,jsonify
from flask_cors import CORS
import jwt
from werkzeug.utils import secure_filename
import ssl
app = Flask(__name__)
CORS(app)

# In-memory "database" for demonstration
tasks = []
JWKS_URL = "https://blumoon.cloudflareaccess.com/cdn-cgi/access/certs"
jwks_keys = requests.get(JWKS_URL).json()["keys"]

def jwk_validate(request):
    # Implement your JWT validation logic here
    token = (
        request.headers.get("Authorization", "").replace("Bearer ", "")
        or request.cookies.get("CF_Authorization")
    )
    if not token:
        return jsonify({"error": "Missing token"}), 401
    try:
        # Try verifying against the first key (basic example — in production, rotate properly)
        payload = jwt.decode(token, jwt.algorithms.RSAAlgorithm.from_jwk(jwks_keys[0]), algorithms=["RS256"], audience="api.yourdomain.com")
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    return True

@app.route('/list-devices', methods=['GET'])
def list_devices():
    jwk_validate(request)
    json_response = {"devices": list_all_devices()}
    return json_response

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp3'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 16MB limit

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/play', methods=['POST'])
def play():
    device_id = int(request.form['device_id'])
    if device_id is None:
        return {"success": False, "error": "Invalid request"}
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # If user does not select file, browser submits empty file
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        play_audio(device_id, filepath)

    return {"success": True}

@app.route('/get-device-infos', methods=['GET'])
def get_device_infos():
    if 'device_id' not in request.args:
        return jsonify({"device_infos": get_device_infos()})

    device_id = int(request.args.get('device_id'))
    return jsonify(get_device_info(device_id))

@app.route('/config-device', methods=['POST'])
def config_devices():
    device_id = request.json['device_id']
    configs = request.json['configs']
    if device_id is None:
        return {"success": False, "error": "Invalid request"}

    config_device(device_id, configs)
    return {"success": True}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)