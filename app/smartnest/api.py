import datetime
import json
from logging import Logger
import os
import time
import pyaudio
import pydub
import threading
import hashlib

current_path = os.path.dirname(os.path.realpath(__file__)).replace("\\", "/")
# Data folder should be in app/data, not app/smartnest/data
DATA_FOLDER = os.path.join(os.path.dirname(current_path), 'data').replace("\\", "/")
UPLOAD_FOLDER = os.path.join(DATA_FOLDER, 'uploads').replace("\\", "/")
CONFIG_FILE = os.path.join(DATA_FOLDER, 'config.json').replace("\\", "/")
p = pyaudio.PyAudio()

if not os.path.exists(DATA_FOLDER):
    os.makedirs(DATA_FOLDER)
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
devices = {}
config = {}
config_reset_flag = False
logger = Logger("SmartNest")
if os.path.exists(CONFIG_FILE):
    with open(CONFIG_FILE, 'r') as f:
        config = json.load(f)

def list_all_devices():
    global config_reset_flag
    available_devices = []
    cloned_devices = devices.copy()
    for device_name in cloned_devices:
        if not cloned_devices[device_name]["available"]:
            continue
        device = cloned_devices[device_name]
        #if filtering_name in device['device_name']:
        available_devices.append({
            "device_name": device["device_name"],
            "display_name": device.get("display_name", device["device_name"]),
            "status": device["status"],
            "duration": device["duration"],
            "position": device["position"],
            "looping": device["looping"],
            "file_name": device["file_name"],
            "volume": device["volume"],
        })
    return available_devices

def get_config_status():
    global config_reset_flag
    status = {"config_reset": config_reset_flag}
    # Reset the flag after being read
    if config_reset_flag:
        config_reset_flag = False
    return status

def config_device(device_name, configs):
    global devices
    if device_name in devices:
        device = devices[device_name]
        config_changed = False

        if 'loop' in configs:
            device["looping"] = configs['loop']
            config_changed = True
        if 'volume' in configs:
            device["volume"] = min(max(configs['volume'],0), 100)
            config_changed = True
        if 'display_name' in configs:
            device["display_name"] = configs['display_name']
            config_changed = True
        if 'pause' in configs:
            if device["playing_thread"] is not None:
                device["is_paused"] = configs['pause']
                if configs['pause']:
                    device['status'] = "Paused"
                else:
                    device['status'] = "Playing"
        if 'stop' in configs:
            if device["playing_thread"] is not None:
                device["is_playing"] = False
                device["playing_thread"].join()
                device["playing_thread"] = None
                device['status'] = "Idle"
                device['position'] = 0
                device['duration'] = 0
                device['file_name'] = ""
                config_changed = True

        # Save config if any persistent settings changed
        if config_changed:
            save_config()


def play_audio(device_name, file_path):
    global devices
    if device_name not in devices:
        return None

    device = devices[device_name]
    # Auto-detect audio format from file extension
    file_extension = file_path.split('.')[-1].lower()
    try:
        audio_segment = pydub.AudioSegment.from_file(file_path, format=file_extension)
    except:
        # If format detection fails, try without specifying format (pydub will auto-detect)
        audio_segment = pydub.AudioSegment.from_file(file_path)
    audio_data = audio_segment.set_frame_rate(device["sample_rate"])
    
    def play_audio_thread(device, file_name, audio_data, sample_rate, sample_width, channels, device_index):
        
        try:
            stream = p.open(
                format=p.get_format_from_width(sample_width),
                channels=channels,
                rate=sample_rate,
                output=True,
                output_device_index=device_index
            )
            
            chunk_size = 1024  # Number of frames per buffer
            current_volume = -1
            amplified_audio_data = audio_data
            raw_data = amplified_audio_data.raw_data
            while True:
                index = device.get('position_index', 0)

                while index < len(raw_data):
                    if not device["is_playing"]:  # Check the stop flag
                        print("Stopping playback...")
                        break

                    # Check if paused
                    if device.get("is_paused", False):
                        time.sleep(0.1)  # Sleep briefly while paused
                        continue

                    if device['volume'] != current_volume:
                        volume_db = volume_db = -60 * (1 - device['volume'] /100)
                        amplified_audio_data = audio_data.apply_gain(volume_db)
                        raw_data = amplified_audio_data.raw_data
                        current_volume = device['volume']

                    # Write a chunk of audio data to the stream
                    chunk = raw_data[index:index + chunk_size]
                    # apply new volume
                    stream.write(chunk)
                    index += chunk_size
                    device['position'] = int((index / len(raw_data)) * device['duration'])
                    device['position_index'] = index
                    device['timestamp'] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

                if not device["looping"] or not device["is_playing"]:
                    break

            # Clean up
            stream.stop_stream()
            stream.close()
        except Exception as e:
            if "Unanticipated host error" in str(e):
                device["available"] = False
            print("Error:", e)
        device['status'] = "Idle"
        device['position'] = 0
        device['duration'] = 0
        device['file_name'] = ""

    if device["playing_thread"] is not None:
        device["is_playing"] = False
        device["playing_thread"].join()

    file_name = file_path.replace("\\", "/").split("/")[-1]
    device["file_name"] = file_name
    device["duration"] = int(len(audio_data) / 1000)
    device['status'] = "Playing"
    device["is_playing"] = True
    device["is_paused"] = False
    device['position'] = 0
    device['position_index'] = 0
    device["playing_thread"] = threading.Thread(target=play_audio_thread, args=(device, file_name, audio_data, device["sample_rate"], audio_segment.sample_width, audio_segment.channels, device["device_id"]))
    device["playing_thread"].start()

    # Save config when playing new file
    save_config() 

def save_config():
    global devices, config
    with open(CONFIG_FILE, 'w') as f:
        device_infos_to_save = {}
        for device_name in devices:
            if devices[device_name]["available"]:
                device_infos_to_save[device_name] = {
                    "volume": devices[device_name]["volume"],
                    "looping": devices[device_name]["looping"],
                    "file_name": devices[device_name]["file_name"],
                    "display_name": devices[device_name].get("display_name", device_name)
                }

        # Get current device hash using SHA256
        available_device_names = [name for name, dev in devices.items() if dev["available"]]
        device_list_str = "|".join(sorted(available_device_names))
        current_device_hash = hashlib.sha256(device_list_str.encode()).hexdigest()

        config = {
            "hash": current_device_hash,
            "device_infos": device_infos_to_save if device_infos_to_save else None
        }
        json.dump(config, f, indent=2)

def initialize_devices():
    global devices, config, p, config_reset_flag

    avaliable_devices = {}

    # Get current available devices from system
    for i in range(p.get_device_count()):
        device_info = p.get_device_info_by_index(i)
        if device_info['maxOutputChannels'] != 0:
            avaliable_devices[device_info['name']] = {'device_name':device_info['name'], 'device_id': i, **device_info}

    # Create hash of current device list (sorted device names) using SHA256
    device_list_str = "|".join(sorted(avaliable_devices.keys()))
    current_device_hash = hashlib.sha256(device_list_str.encode()).hexdigest()

    # Get previous hash and device_infos from config
    previous_device_hash = config.get("hash")
    device_infos = config.get("device_infos")

    # Check if device list has changed
    if previous_device_hash is not None and current_device_hash != previous_device_hash:
        print(f"Device list changed! Resetting config...")
        # Set flag to notify frontend
        config_reset_flag = True
        # Clear device_infos
        device_infos = None
    elif previous_device_hash is None:
        # First run
        print(f"First run, initializing config...")
        device_infos = None

    # Initialize devices
    for device_name in avaliable_devices:
        new_device = {
            "sample_rate": int(avaliable_devices[device_name]["defaultSampleRate"]),
            "channels": int(avaliable_devices[device_name]["maxOutputChannels"]),
            "playing_thread": None,
            "is_playing": False,
            "is_paused": False,
            "status": "Idle",
            "looping": True,
            "duration": 0,
            "position": 0,
            "position_index": 0,
            "volume": 100,
            "file_name": "",
            "display_name": device_name,
            "available": True,
            **avaliable_devices[device_name]
        }
        devices[device_name] = new_device
        print(f"Device initialized: {device_name}")

        # Load config if exists
        if device_infos and device_name in device_infos:
            devices[device_name]["volume"] = device_infos[device_name].get("volume", 100)
            devices[device_name]["looping"] = device_infos[device_name].get("looping", True)
            if "display_name" in device_infos[device_name]:
                devices[device_name]["display_name"] = device_infos[device_name]["display_name"]
            if "file_name" in device_infos[device_name] and device_infos[device_name]['file_name'] != "" and os.path.exists(os.path.join(UPLOAD_FOLDER, device_infos[device_name]["file_name"])):
                play_audio(device_name, os.path.join(UPLOAD_FOLDER, device_infos[device_name]["file_name"]))

    # Save initial config
    save_config()
    print(f"Initialized {len(devices)} devices")

# Initialize devices on startup
initialize_devices()