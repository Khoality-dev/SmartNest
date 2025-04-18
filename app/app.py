import json
import requests
from smartnest.main import *
import os
# app.py
from flask import Flask, render_template, request, redirect, url_for,jsonify
from flask_cors import CORS
import jwt
import jwt.algorithms
from werkzeug.utils import secure_filename
import ssl
app = Flask(__name__)
CORS(app)

# In-memory "database" for demonstration
tasks = []
POLICY_AUD = os.getenv("POLICY_AUD")
TEAM_DOMAIN = os.getenv("TEAM_DOMAIN")
CERTS_URL = "{}/cdn-cgi/access/certs".format(TEAM_DOMAIN)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp3'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 16MB limit

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
    def wrapper():
        # if os.get("FLASK_ENV", "development") == "development":
        #     # Skip token verification in development mode
        #     return f()
        
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

        return f()
    return wrapper

@app.route('/list-devices', methods=['GET'])
@verify_token
def list_devices():
    json_response = {"devices": list_all_devices()}
    return json_response

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
@verify_token
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