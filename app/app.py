from smartnest.main import list_all_devices, play_audio, get_device_infos, get_device_info
import os
# app.py
from flask import Flask, render_template, request, redirect, url_for,jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
app = Flask(__name__)
CORS(app)

# In-memory "database" for demonstration
tasks = []

@app.route('/list-devices', methods=['GET'])
def list_devices():
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

@app.route('/set-loop', methods=['POST'])
def set_loop():
    device_id = int(request.form['device_id'])
    loop = int(request.form['loop'])
    if device_id is None or loop is None:
        return {"success": False, "error": "Invalid request"}
    update_device_info(device_id, loop)
    return {"success": True}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)