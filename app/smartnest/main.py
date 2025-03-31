import pyaudio
import pydub
import threading

devices = {}
p = pyaudio.PyAudio().terminate()
p = pyaudio.PyAudio()

def list_all_devices():
    avaliable_devices = []
    for i in range(p.get_device_count()):
        device_info = p.get_device_info_by_index(i)
        if "USB" in device_info['name']:
            avaliable_devices.append({'device_name':device_info['name'], 'device_id': i, 'num_channels': device_info['maxInputChannels']})
    return avaliable_devices

def get_device_infos():
    infos = {}
    for device_index in devices:
        device = devices[device_index]
        infos[device_index] = {
            "status": device["status"],
            "duration": device["duration"],
            "position": device["position"],
            "looping": device["looping"],
            "file_name": device["file_name"],
        }
    return infos

def get_device_info(device_id):
    if device_id not in devices:
        return None
    device = devices[device_id]
    return {
            "status": device["status"],
            "duration": device["duration"],
            "position": device["position"],
            "looping": device["looping"],
            "file_name": device["file_name"],
        }

def update_device_info(device_id, looping):
    if device_id in devices:
        device = devices[device_id]
        device["looping"] = looping

def stop(device_id):
    if device_id in devices:
        device = devices[device_id]
        device["is_playing"] = False
        device["playing_thread"].join()
        devices.pop(device_id)

def play_audio(device_index, file_path, looping = False):
    if device_index not in devices:
        device_info = p.get_device_info_by_index(device_index)
        devices[device_index] = {
            "sample_rate": int(device_info["defaultSampleRate"]),
            "channels": int(device_info["maxOutputChannels"]),
            "device_index": device_index,
            "playing_thread": None,
            "is_playing": False,
            "status": "Idle",
            "looping": False,
            "duration": 0, 
            "position": 0,
            "file_name": "",
        }

    device = devices[device_index]
    device["looping"] = looping
    device["file_name"] = file_path.split("/")[-1]
    
    audio_segment = pydub.AudioSegment.from_file(file_path, format="mp3")
    audio_data = audio_segment.set_frame_rate(device["sample_rate"])
    device["duration"] = int(len(audio_data) / 1000)
    audio_data = audio_data.raw_data
    def play_audio_thread(device, raw_audio, sample_rate, sample_width, channels, device_index):
        stream = p.open(
            format=p.get_format_from_width(sample_width),
            channels=channels,
            rate=sample_rate,
            output=True,
            output_device_index=device_index
        )
        device['status'] = "Playing"
        chunk_size = 1024  # Number of frames per buffer

        while True:
            index = 0

            while index < len(raw_audio):
                if not device["is_playing"]:  # Check the stop flag
                    print("Stopping playback...")
                    break

                # Write a chunk of audio data to the stream
                chunk = raw_audio[index:index + chunk_size]
                stream.write(chunk)
                index += chunk_size
                device['position'] = int((index / len(raw_audio)) * device['duration'])

            if not device["looping"]:
                break

        # Clean up
        stream.stop_stream()
        stream.close()
        device['status'] = "Idle"

    if device["playing_thread"] is not None:
        device["is_playing"] = False
        device["playing_thread"].join()

    device["is_playing"] = True
    device["playing_thread"] = threading.Thread(target=play_audio_thread, args=(device, audio_data, device["sample_rate"], audio_segment.sample_width, audio_segment.channels, device["device_index"]))
    device["playing_thread"].start() 