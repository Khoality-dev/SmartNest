import time
import pyaudio
import pydub
import threading

devices = {}

def update_device_infos():
    while True:
        avaliable_devices = {}
        p = pyaudio.PyAudio()
        for i in range(p.get_device_count()):
            device_info = p.get_device_info_by_index(i)
            if device_info['maxOutputChannels'] != 0:
                avaliable_devices[device_info['name']] = {'device_name':device_info['name'], 'device_id': i, **device_info}

        p.terminate()

        for device_name in avaliable_devices:
            if device_name not in devices:
                new_device = {
                    "sample_rate": int(avaliable_devices[device_name]["defaultSampleRate"]),
                    "channels": int(avaliable_devices[device_name]["maxOutputChannels"]),
                    "playing_thread": None,
                    "is_playing": False,
                    "status": "Idle",
                    "looping": True,
                    "duration": 0, 
                    "position": 0,
                    "volume": 100,
                    "file_name": "",
                    **avaliable_devices[device_name]
                }
                devices[device_name] = new_device
                print(f"New device found: {device_name}")
        
        device_names = list(devices.keys())
        for device_name in device_names:
            if device_name not in avaliable_devices:
                
                if 'playing_thread' in devices[device_name] and devices[device_name]["playing_thread"] is not None:
                    devices[device_name]["is_playing"] = False
                    devices[device_name]["playing_thread"].join()

                devices.pop(device_name)
                #TODO: Need to stop the thread if it is running
        
        time.sleep(5)

device_scan_thread = threading.Thread(target=update_device_infos)
device_scan_thread.daemon = True
device_scan_thread.start()

def list_all_devices():
    global devices
    available_devices = []
    cloned_devices = devices.copy()
    for device_name in cloned_devices:
        device = cloned_devices[device_name]
        #if filtering_name in device['device_name']:
        available_devices.append({
            "device_name": device["device_name"],
            "status": device["status"],
            "duration": device["duration"],
            "position": device["position"],
            "looping": device["looping"],
            "file_name": device["file_name"],
        })
    return available_devices

def config_device(device_name, configs):
    if device_name in devices:
        device = devices[device_name]
        if 'loop' in configs:
            device["looping"] = configs['loop']
        if 'volume' in configs:
            device["volume"] = min(max(configs['volume'],0), 100)


def play_audio(device_name, file_path):
    if device_name not in devices:
        return None

    device = devices[device_name]
    
    
    audio_segment = pydub.AudioSegment.from_file(file_path, format="mp3")
    audio_data = audio_segment.set_frame_rate(device["sample_rate"])
    
    def play_audio_thread(device, file_name, audio_data, sample_rate, sample_width, channels, device_index):
        device['pyaudio'] = p = pyaudio.PyAudio()
        
        try:
            stream = p.open(
                format=p.get_format_from_width(sample_width),
                channels=channels,
                rate=sample_rate,
                output=True,
                output_device_index=device_index
            )
            device["file_name"] = file_name
            device["duration"] = int(len(audio_data) / 1000)
            device['status'] = "Playing"
            chunk_size = 1024  # Number of frames per buffer
            current_volume = -1
            amplified_audio_data = audio_data
            raw_data = amplified_audio_data.raw_data
            while True:
                index = 0
                
                while index < len(raw_data):
                    if not device["is_playing"]:  # Check the stop flag
                        print("Stopping playback...")
                        break
                    
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

                if not device["looping"] or not device["is_playing"]:
                    break

            # Clean up
            stream.stop_stream()
            stream.close()
        except Exception as e:
            print("Error:", e)
        p.terminate()
        device['pyaudio'] = None
        device['status'] = "Idle"
        device['position'] = 0
        device['duration'] = 0
        device['file_name'] = ""

    if device["playing_thread"] is not None:
        device["is_playing"] = False
        device["playing_thread"].join()

    device["is_playing"] = True
    device["playing_thread"] = threading.Thread(target=play_audio_thread, args=(device, file_path.split("/")[-1], audio_data, device["sample_rate"], audio_segment.sample_width, audio_segment.channels, device["device_id"]))
    device["playing_thread"].start() 