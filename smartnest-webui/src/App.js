import { useEffect } from 'react';
import DeviceCard from './DeviceCard';
import axios from 'axios';
import { Stack } from '@mui/material';
import { useState } from 'react';
import { API_URL } from './configs'
import { getCookieValue } from './utils';
function App() {
  const [deviceList, setDeviceList] = useState([]);
  const [lastTimestamp, setLastTimestamp] = useState(0);
  useEffect(() => {
    const eventSource = new EventSource(API_URL + '/list-devices');
    eventSource.onmessage = function (event) {
      const body = JSON.parse(event.data);
      const timestamp = body.timestamp;
      console.log('Timestamp:', timestamp, 'Last timestamp:', lastTimestamp, 'Compare:', timestamp > lastTimestamp);

      if (timestamp > lastTimestamp) {

        const devices = body.devices;

        console.log('Devices:', devices);
        const transformed = devices.map(device => ({
          ...device,
          mediaStatus: {
            file_name: device.file_name,
            duration: device.duration,
            position: device.position,
            paused: device.status !== "Playing",
            looping: device.looping,
            volume: device.volume
          }
        }));
        setLastTimestamp(timestamp);
        setDeviceList(transformed);
      }
    };
    return () => {
      eventSource.close();
    }
  }, []);

  return (
    <Stack spacing={2} direction="column">
      {deviceList.map((device, index) => (
        <DeviceCard key={index} deviceIndex={index} deviceName={device.device_name} mediaStatus={device.mediaStatus} />))}
    </Stack>

  );
}

export default App;
