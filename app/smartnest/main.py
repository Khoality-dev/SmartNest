import pyaudio
import pydub
import threading

devices = {}
p = pyaudio.PyAudio()
def list_all_devices():
    avaliable_devices = []
    for i in range(p.get_device_count()):
        device_info = p.get_device_info_by_index(i)
        #if "USB" in device_info['name']:
        avaliable_devices.append(device_info['name'])
    return avaliable_devices

def stop(device_index):
    if device_index in devices:
        device = devices[device_index]
        device[is_playing] = False
        device[playing_thread].join()
        devices.pop(device_index)

def play_audio(device_index, file_path):
    if device_index not in devices:
        device_info = p.get_device_info_by_index(device_index)
        devices[device_index] = {
            "sample_rate": int(device_info["defaultSampleRate"]),
            "channels": int(device_info["maxOutputChannels"]),
            "device_index": device_index,
            "playing_thread": None,
            "is_playing": False
        }

    device = devices[device_index]
    audio_segment = pydub.AudioSegment.from_file(file_path, format="mp3")
    audio_data = audio_segment.set_frame_rate(device["sample_rate"]).raw_data

    def play_audio_thread(device, raw_audio, sample_rate, sample_width, channels, device_index):
        stream = p.open(
            format=p.get_format_from_width(sample_width),
            channels=channels,
            rate=sample_rate,
            output=True,
            output_device_index=device_index
        )

        chunk_size = 1024  # Number of frames per buffer
        index = 0

        while index < len(raw_audio):
            if not device["playing_thread"]:  # Check the stop flag
                print("Stopping playback...")
                break

            # Write a chunk of audio data to the stream
            chunk = raw_audio[index:index + chunk_size]
            stream.write(chunk)
            index += chunk_size

        # Clean up
        stream.stop_stream()
        stream.close()

    if device["playing_thread"] is not None:
        device["is_playing"] = False
        device["playing_thread"].join()

    device["is_playing"] = True
    device["playing_thread"] = threading.Thread(target=play_audio_thread, args=(device, audio_data, device["sample_rate"], audio_segment.sample_width, device["channels"], device["device_index"]))
    device["playing_thread"].start() 