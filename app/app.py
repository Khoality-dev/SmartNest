import argparse
import json
import requests
import os
from functools import wraps
# app.py
from flask import Flask, Response, render_template, request, redirect, url_for,jsonify, make_response
from flask_cors import CORS
import jwt
import jwt.algorithms
from werkzeug.utils import secure_filename
import ssl
from smartnest.main import *
app = Flask(__name__)
CORS(app, supports_credentials=True)

# In-memory "database" for demonstration
tasks = []
POLICY_AUD = os.getenv("POLICY_AUD")
TEAM_DOMAIN = os.getenv("TEAM_DOMAIN")
CERTS_URL = "{}/cdn-cgi/access/certs".format(TEAM_DOMAIN)

ALLOWED_EXTENSIONS = {'mp3', 'wav'}
current_path = os.path.dirname(os.path.realpath(__file__)).replace("\\", "/")
DATA_FOLDER = os.path.join(current_path, 'smartnest', 'data').replace("\\", "/")
UPLOAD_FOLDER = os.path.join(DATA_FOLDER, 'uploads').replace("\\", "/")
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB limit


def _get_public_keys():
    """
    Returns:
        List of RSA public keys usable by PyJWT.
    """
    r = requests.get(CERTS_URL)
    public_keys = []
    jwk_set = r.json()
    for key_dict in jwk_set['keys']:
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key_dict))
        public_keys.append(public_key)
    return public_keys

def verify_token(f):
    """
    Decorator that wraps a Flask API call to verify the CF Access JWT
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        if os.getenv("FLASK_ENV", "development") == "development":
            # Skip token verification in development mode
            return f(*args, **kwargs)
        
        if request.method == 'OPTIONS':
            # Let Flask-CORS handle it, no token needed
            response = make_response()
            response.status_code = 204
            return response
        
        token = ''
        print("Cookies: ", request.cookies)
        if 'CF_Authorization' in request.cookies:
            token = request.cookies['CF_Authorization']
        elif 'Authorization' in request.headers:
            token = request.headers['Authorization'].replace('Bearer ', '')
        else:
            return "missing required cf authorization token", 403
        keys = _get_public_keys()

        # Loop through the keys since we can't pass the key set to the decoder
        valid_token = False
        for key in keys:
            try:
                # decode returns the claims that has the email when needed
                jwt.decode(token, key=key, audience=POLICY_AUD, algorithms=['RS256'])
                valid_token = True
                break
            except:
                pass
        if not valid_token:
            return "invalid token", 403

        return f(*args, **kwargs)
    return wrapper

@app.route('/list-devices')
@verify_token
def list_devices():
    json_response = list_all_devices()
    return {"devices": json_response}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/play', methods=['POST'])
@verify_token
def play():
    device_name = str(request.form['device_name'])
    if device_name is None:
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
        play_audio(device_name, filepath)
        return {"success": True}
    else:
        return jsonify({'error': 'Invalid file type'}), 400

@app.route('/config-device', methods=['POST'])
@verify_token
def config_devices():
    device_name = str(request.json['device_name'])
    configs = request.json['configs']
    if device_name is None:
        return {"success": False, "error": "Invalid request"}

    config_device(device_name, configs)
    return {"success": True}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='SmartNest API')
    parser.add_argument('--debug', action='store_true', help='Debug mode')
    args = parser.parse_args()
    app.run(host='0.0.0.0', port=5000, debug=args.debug, use_reloader=False)