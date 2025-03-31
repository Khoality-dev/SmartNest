import { useEffect } from 'react';
import DeviceCard from './DeviceCard';
import axios from 'axios';
import { Stack } from '@mui/material';
import { useState } from 'react';
function App() {
  const [deviceList, setDeviceList] = useState([]);
  const fetchDevices = async () => {

    try {         // File field
      const response = await axios.get('http://192.168.1.10:5000/list-devices', {

      });
      console.log('Response:', response.data.devices);
      setDeviceList(response.data.devices);
    } catch (error) {
      console.error(error);
    }
  }
  
  if (deviceList.length === 0) {
    fetchDevices();
  }

  return (
    <Stack spacing={2} direction="column">
      {deviceList.map((device) => (
        <DeviceCard deviceId={device.device_id} deviceName={device.device_name}/>))}
    </Stack>

  );
}

export default App;
