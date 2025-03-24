import pyaudio
class AudioOutput:
    def __init__(self, p, device_index):
        self.p = p
        self.device_index = device_index
        self.sample_rate = self.p.get_device_info_by_index(self.device_index)['defaultSampleRate']
        self.channels = self.p.get_device_info_by_index(self.device_index)['maxOutputChannels']
        self.playing_thread = None

    def play_audio(self, audio_data):
        if isinstance(audio_data, str): # meaning it is a base64 stream
            audio_data = base64.b64decode(audio_data)

        audio_segment = pydub.AudioSegment.from_file(io.BytesIO(audio_data), format="mp3")
        audio_data = audio_segment.set_frame_rate(self.sample_rate).raw_data

        def play_audio_thread(self, raw_audio, sample_rate, sample_width, channels, device_index):
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
                if not self.playing_thread:  # Check the stop flag
                    print("Stopping playback...")
                    break

                # Write a chunk of audio data to the stream
                chunk = raw_audio[index:index + chunk_size]
                stream.write(chunk)
                index += chunk_size

            # Clean up
            stream.stop_stream()
            stream.close()

        if playing_thread is not None:
            self.is_playing = False
            self.playing_thread.join()

        self.is_playing = True
        self.playing_thread = threading.Thread(target=play_audio_thread, args=(self, audio_data, self.sample_rate, audio_segment.sample_width, self.channels, self.device_index))
        self.playing_thread.start()

    @staticmethod
    def list_all_devices(p):
        for i in range(p.get_device_count()):
            device_info = p.get_device_info_by_index(i)
            print(f"Device {i}: {device_info['name']} (Channels: {device_info['maxOutputChannels']})")