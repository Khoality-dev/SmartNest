import { useEffect } from 'react';
import DeviceCard from './DeviceCard';
import axios from 'axios';
import { Stack } from '@mui/material';
import { useState } from 'react';
function App() {
  const [deviceList, setDeviceList] = useState([]);
  const fetchDevices = async () => {

    try {         // File field
      const response = await axios.get('http://localhost:5000/list-devices', {

      });
      console.log('Response:', response.data.devices);
      setDeviceList(response.data.devices);
    } catch (error) {
      console.error(error);
    }
  }
  
  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000);
    
    // Clean up interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <Stack spacing={2} direction="column">
      {deviceList.map((device) => (
        <DeviceCard deviceId={device.device_id} deviceName={device.device_name}/>))}
    </Stack>

  );
}

export default App;
