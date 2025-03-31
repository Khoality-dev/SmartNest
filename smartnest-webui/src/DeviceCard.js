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

function DeviceCard({ deviceId, deviceName }) {
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const playFile = async (selectedFile) => {
    try {
      const formData = new FormData();
      formData.append('device_id', deviceId);  // Text field
      formData.append('file', selectedFile);           // File field
      console.log('device_name', deviceName)
      const response = await axios.post('http://192.168.1.10:5000/play', formData, {
        headers: {  
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() =>
  {
    if (selectedFile)
    {
      playFile(selectedFile);
    }
  }, [selectedFile])
  return (
    <Box border={1} borderColor={'#e0e0e0'} borderRadius={4} padding={2}>
    <Stack spacing={2} direction={'row'}>
      <CoverImage src={'/home/khoa/SmartNest/smartnest-webui/public/logo192.png'} />
      <MusicPlayerSlider deviceId={deviceId} deviceName={deviceName}></MusicPlayerSlider>
      <FileUploadButton deviceId={deviceId} setSelectedFile={setSelectedFile}></FileUploadButton>
    </Stack>
    </Box>
  );
}


const CoverImage = styled('div')({
  width: 100,
  height: 100,
  objectFit: 'cover',
  overflow: 'hidden',
  flexShrink: 0,
  borderRadius: 8,
  backgroundColor: 'rgba(0,0,0,0.08)',
  '& > img': {
    width: '100%',
  },
});


export default DeviceCard;
