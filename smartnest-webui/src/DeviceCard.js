import axios from 'axios';
import {
  Stack,
  Typography,
  Box,
  Button,
  Paper,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import MusicPlayerSlider from './MusicPlayer';
import { API_URL } from './configs';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import UsbIcon from '@mui/icons-material/Usb';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import SpeakerIcon from '@mui/icons-material/Speaker';

function DeviceCard({ deviceName, mediaStatus, setMediaSelectDialogOpen }) {
  const onStopButtonClick = async (deviceName) => {
    try {
      await axios.post(API_URL + '/config-device', {
        device_name: deviceName,
        configs: { stop: true }
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Determine device type and icon
  const getDeviceIcon = () => {
    const lowerName = deviceName.toLowerCase();
    if (lowerName.includes('usb')) {
      return <UsbIcon sx={{ fontSize: 40 }} />;
    } else if (lowerName.includes('headphone')) {
      return <HeadphonesIcon sx={{ fontSize: 40 }} />;
    } else {
      return <SpeakerIcon sx={{ fontSize: 40 }} />;
    }
  };

  const getDeviceColor = () => {
    const lowerName = deviceName.toLowerCase();
    if (lowerName.includes('usb')) return 'warning';
    if (lowerName.includes('headphone')) return 'secondary';
    return 'primary';
  };

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          elevation: 6,
          transform: 'translateY(-2px)',
          boxShadow: 6
        }
      }}
    >
      <Box
        sx={{
          bgcolor: `${getDeviceColor()}.main`,
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Avatar
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            width: 56,
            height: 56
          }}
        >
          {getDeviceIcon()}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="overline" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
            Audio Device
          </Typography>
          <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.2 }}>
            {deviceName}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Choose Music">
            <Button
              variant="contained"
              size="large"
              startIcon={<LibraryMusicIcon />}
              onClick={() => setMediaSelectDialogOpen(deviceName)}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              Select Music
            </Button>
          </Tooltip>
          <Tooltip title="Stop Playback">
            <IconButton
              onClick={() => onStopButtonClick(deviceName)}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'error.main'
                }
              }}
            >
              <StopCircleIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box sx={{ p: 3 }}>
        <MusicPlayerSlider deviceName={deviceName} mediaStatus={mediaStatus} />
      </Box>
    </Paper>
  );
}

export default DeviceCard;
