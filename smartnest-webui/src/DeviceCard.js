import axios from 'axios';
import { useState } from 'react';
import {
  Stack,
  Typography,
  Box,
  Button,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import MusicPlayerSlider from './MusicPlayer';
import { API_URL } from './configs';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import UsbIcon from '@mui/icons-material/Usb';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import SpeakerIcon from '@mui/icons-material/Speaker';
import EditIcon from '@mui/icons-material/Edit';

function DeviceCard({ deviceName, displayName: initialDisplayName, mediaStatus, setMediaSelectDialogOpen }) {
  const [displayName, setDisplayName] = useState(initialDisplayName || deviceName);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState(displayName);
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

  const handleEditClick = () => {
    setTempDisplayName(displayName);
    setEditDialogOpen(true);
  };

  const handleSaveDisplayName = async () => {
    try {
      await axios.post(API_URL + '/config-device', {
        device_name: deviceName,
        configs: { display_name: tempDisplayName }
      });
      setDisplayName(tempDisplayName);
      setEditDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setTempDisplayName(displayName);
    setEditDialogOpen(false);
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
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.2 }}>
              {displayName}
            </Typography>
            <Tooltip title="Edit device name">
              <IconButton
                size="small"
                onClick={handleEditClick}
                sx={{
                  color: 'white',
                  opacity: 0.8,
                  '&:hover': { opacity: 1 }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          {displayName !== deviceName && (
            <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem' }}>
              {deviceName}
            </Typography>
          )}
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

      {/* Edit Display Name Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Device Name</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Display Name"
              value={tempDisplayName}
              onChange={(e) => setTempDisplayName(e.target.value)}
              helperText="This is just a label - the actual device name remains unchanged"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSaveDisplayName();
                }
              }}
            />
            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Original device name: <strong>{deviceName}</strong>
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button
            onClick={handleSaveDisplayName}
            variant="contained"
            disabled={!tempDisplayName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default DeviceCard;
