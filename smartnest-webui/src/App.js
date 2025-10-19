import { useEffect, useState } from 'react';
import DeviceCard from './DeviceCard';
import axios from 'axios';
import {
  Stack,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Box,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import { API_URL } from './configs';
import MediaSelectDialogOpen from './MediaSelectDialog';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import DevicesIcon from '@mui/icons-material/Devices';

function App() {
  const [deviceList, setDeviceList] = useState([]);
  const [mediaSelectDialogOpen, setMediaSelectDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const setMediaSelectDialogOpenHandler = (deviceName) => {
    setMediaSelectDialogOpen(true);
    setSelectedDevice(deviceName);
  };

  const fetchDevices = async () => {
    try {
      const response = await axios.get(API_URL + '/list-devices');
      console.log('Response:', response.data.devices);
      response.data.devices.mediaStatus = {};
      let devices = response.data.devices.map((device) => {
        return {
          ...device,
          mediaStatus: {
            file_name: device.file_name,
            duration: device.duration,
            position: device.position,
            paused: device.status === 'Playing' ? false : true,
            looping: device.looping,
            volume: device.volume
          }
        };
      });
      setDeviceList(devices);
      setError(null);
    } catch (error) {
      console.error(error);
      setError('Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const intervalId = setInterval(() => {
      fetchDevices();
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'primary.main',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <HeadphonesIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700 }}
          >
            SmartNest Audio
          </Typography>
          <Chip
            icon={<DevicesIcon />}
            label={`${deviceList.length} Device${deviceList.length !== 1 ? 's' : ''}`}
            color="secondary"
            sx={{ fontWeight: 600 }}
          />
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Audio Devices
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and control your audio playback devices
          </Typography>
        </Box>

        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={400}
          >
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'error.light',
              color: 'error.contrastText'
            }}
          >
            <Typography variant="h6">{error}</Typography>
          </Paper>
        ) : deviceList.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              bgcolor: 'background.paper',
              border: '2px dashed',
              borderColor: 'divider'
            }}
          >
            <DevicesIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Devices Found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Connect an audio device to get started
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={3} direction="column">
            {deviceList.map((device, index) => (
              <DeviceCard
                key={index}
                deviceIndex={index}
                deviceName={device.device_name}
                displayName={device.display_name}
                mediaStatus={device.mediaStatus}
                setMediaSelectDialogOpen={setMediaSelectDialogOpenHandler}
              />
            ))}
          </Stack>
        )}
      </Container>

      <MediaSelectDialogOpen
        deviceName={selectedDevice}
        open={mediaSelectDialogOpen}
        onClose={() => setMediaSelectDialogOpen(false)}
      />
    </Box>
  );
}

export default App;
