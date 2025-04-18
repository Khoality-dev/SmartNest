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

    try {         // File field
      const cfToken = getCookieValue('CF_Authorization');
      const response = await axios.get(API_URL + '/list-devices', {
        headers: {
          'Authorization': `Bearer ${cfToken}`
        }
      });
      console.log('Response:', response.data.devices);
      setDeviceList(response.data.devices);
    } catch (error) {
      console.error(error);
    }
  }


  useEffect(() => {
    fetchDevices();
    const intervalId = setInterval(() => {
      fetchDevices();
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Stack spacing={2} direction="column">
      {deviceList.map((device) => (
        <DeviceCard deviceId={device.device_id} deviceName={device.device_name} />))}
    </Stack>

  );
}

export default App;
