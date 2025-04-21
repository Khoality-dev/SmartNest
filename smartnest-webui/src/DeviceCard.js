import axios from 'axios';
import FileUploadButton from './FileUploadButton';
import { useState } from 'react';
import React, { useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MusicPlayerSlider from './MusicPlayer';
import Box from '@mui/material/Box';
import SpeakerIcon from '@mui/icons-material/Speaker';
import { styled } from '@mui/material/styles';
import { API_URL } from './configs';
import { getCookieValue } from './utils';
import Button from '@mui/material/Button';

function DeviceCard({ deviceName, mediaStatus, setMediaSelectDialogOpen }) {
  

  // check the deviceName lowercase, if it contains 'USB' then it is a USB device, if it is headphones then it is headphone.jpg, if it is speaker.jpg, etc.
  // else it is unknown device.
  // <FileUploadButton deviceIndex={deviceIndex} setSelectedFile={setSelectedFile}></FileUploadButton>
  const device_image = '/'+ (deviceName.toLowerCase().includes('usb')? 'usb.jpg' : deviceName.toLowerCase().includes('headphone') ? 'headphone.jpg' : 'speaker.jpg');
  return (
    <Box border={1} borderColor={'#e0e0e0'} borderRadius={4} padding={2}>
      <Stack spacing={2} direction={'row'} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <img src={device_image} alt={deviceName} width={80} height={72} />
        <MusicPlayerSlider deviceName={deviceName} mediaStatus={mediaStatus}></MusicPlayerSlider>
        <Button variant="contained" component="span" onClick={() => setMediaSelectDialogOpen(deviceName)}>Chọn nhạc</Button>
      </Stack>
    </Box>
  );
}


export default DeviceCard;
