import { useEffect } from 'react';
import DeviceCard from './DeviceCard';
import axios from 'axios';
import { Stack } from '@mui/material';
import { useState } from 'react';
import { API_URL } from './configs'
import { getCookieValue } from './utils';
function App() {
  const [deviceList, setDeviceList] = useState([]);
  const fetchDevices = async () => {

    // try {        
    //   const cfToken = getCookieValue('CF_Authorization');
    //   const response = await axios.get(API_URL + '/list-devices', {
    //     headers: {
    //       'Authorization': `Bearer ${cfToken}`
    //     }
    //   });
    //   console.log('Response:', response.data.devices);
    //   response.data.devices.mediaStatus = {}
    //   let devices = response.data.devices.map((device) => {
    //     return { ...device, mediaStatus: { file_name: device.file_name, duration: device.duration, position: device.position, paused: device.status == "Playing" ? false : true, looping: device.looping, volume: device.volume } }
    //   })
    //   setDeviceList(devices);
    // } catch (error) {
    //   console.error(error);
    // }
    const eventSource = new EventSource(API_URL + '/list-devices');

    eventSource.onmessage = function(event) {
      const devices = JSON.parse(event.data);
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
      setDeviceList(transformed);
    };
  }


  useEffect(() => {
    fetchDevices();
    const intervalId = setInterval(() => {
      console.log('Fetching devices...');
      fetchDevices();
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Stack spacing={2} direction="column">
      {deviceList.map((device, index) => (
        <DeviceCard key={index} deviceIndex={index} deviceName={device.device_name} mediaStatus={device.mediaStatus} />))}
    </Stack>

  );
}

export default App;
