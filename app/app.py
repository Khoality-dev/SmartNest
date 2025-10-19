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
from app.smartnest.api import *
app = Flask(__name__)

CORS(app)

ALLOWED_EXTENSIONS = {'mp3', 'wav'}
current_path = os.path.dirname(os.path.realpath(__file__)).replace("\\", "/")
DATA_FOLDER = os.path.join(current_path, 'data').replace("\\", "/")
UPLOAD_FOLDER = os.path.join(DATA_FOLDER, 'uploads').replace("\\", "/")
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB limit


@app.route('/list-devices')
def list_devices():
    json_response = list_all_devices()
    return {"devices": json_response}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload():
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
        return {"success": True}
    else:
        return jsonify({'error': 'Invalid file type'}), 400

@app.route('/play', methods=['POST'])
def play():
    device_name = str(request.json['device_name'])
    filename = secure_filename(str(request.json['filename']))
    if device_name is None:
        return {"success": False, "error": "Invalid request"}
    
    if filename is None or not allowed_file(filename) or not os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], filename)):
        return {"success": False, "error": "Invalid file"}

    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    play_audio(device_name, filepath)
    return {"success": True}
        

@app.route('/media')
def media():
    media_list = []
    for file in os.listdir(UPLOAD_FOLDER):
        if allowed_file(file):
            media_list.append(file)
    return {"media": media_list}

@app.route('/config-device', methods=['POST'])
def config_devices():
    device_name = str(request.json['device_name'])
    configs = request.json['configs']
    if device_name is None:
        return {"success": False, "error": "Invalid request"}

    config_device(device_name, configs)
    return {"success": True}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='SmartNest API')
    args = parser.parse_args()
    app.run(host='0.0.0.0', port=5000)