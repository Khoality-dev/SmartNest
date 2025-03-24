from .device import AudioOutput
import pyaudio

def main():
    p = pyaudio.PyAudio()
    print(AudioOutput.list_all_devices(p))
    headphone = AudioOutput(p, 0)
    print(headphone.channels)