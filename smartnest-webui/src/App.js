import { useEffect } from 'react';
import DeviceCard from './DeviceCard';
import axios from 'axios';
import { Stack } from '@mui/material';
import { useState } from 'react';
import { API_URL } from './configs'
import { getCookieValue } from './utils';
import MediaSelectDialogOpen from './MediaSelectDialog';
import Box from '@mui/material/Box';
function App() {
  const [deviceList, setDeviceList] = useState([]);
  const [mediaSelectDialogOpen, setMediaSelectDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState("");
  const setMediaSelectDialogOpenHandler = (deviceName) => {
    setMediaSelectDialogOpen(true);
    setSelectedDevice(deviceName);
  }

  const fetchDevices = async () => {

    try {         // File field
      const cfToken = getCookieValue('CF_Authorization');
      const response = await axios.get(API_URL + '/list-devices', {
        headers: {
          'Authorization': `Bearer ${cfToken}`
        }
      });
      console.log('Response:', response.data.devices);
      response.data.devices.mediaStatus = {}
      let devices = response.data.devices.map((device) => {
        return { ...device, mediaStatus: { file_name: device.file_name, duration: device.duration, position: device.position, paused: device.status == "Playing" ? false : true, looping: device.looping, volume: device.volume } }
      })
      setDeviceList(devices);
    } catch (error) {
      console.error(error);
    }
  }


  useEffect(() => {
    fetchDevices();
    const intervalId = setInterval(() => {
      fetchDevices();
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
    <MediaSelectDialogOpen deviceName={selectedDevice} open={mediaSelectDialogOpen} onClose={() => setMediaSelectDialogOpen(false)}></MediaSelectDialogOpen>
    <Stack spacing={2} direction="column">
      {deviceList.map((device, index) => (
        <DeviceCard key={index} deviceIndex={index} deviceName={device.device_name} mediaStatus={device.mediaStatus} setMediaSelectDialogOpen={setMediaSelectDialogOpenHandler} />))}
    </Stack>
    </>
    

  );
}

export default App;
