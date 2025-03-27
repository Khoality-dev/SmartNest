from smartnest.main import list_all_devices, play_audio
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

@app.route('/upload', methods=['POST'])
def upload_chunk():
    chunk = request.files['chunk']
    chunk_number = request.form['chunk_number']
    total_chunks = request.form['total_chunks']
    
    # Save chunk to temporary location
    temp_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'temp')
    os.makedirs(temp_dir, exist_ok=True)
    chunk.save(os.path.join(temp_dir, f'chunk-{chunk_number}'))
    
    if int(chunk_number) == int(total_chunks) - 1:
        # Reassemble file when all chunks are received
        reassemble_file(temp_dir)
        return jsonify({'status': 'complete'})
    
    return jsonify({'status': 'chunk received'})

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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)