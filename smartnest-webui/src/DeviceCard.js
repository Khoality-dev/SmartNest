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

function DeviceCard({ deviceIndex, deviceName, mediaStatus }) {
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const playFile = async (selectedFile) => {
    try {
      const formData = new FormData();
      formData.append('device_name', deviceName);  
      formData.append('file', selectedFile);       
      console.log('device_name', deviceName);
      const cfToken = getCookieValue('CF_Authorization');
      const response = await axios.post(API_URL + '/play', formData, {
        headers: {  
          'Authorization': `Bearer ${cfToken}`,
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
      <MusicPlayerSlider deviceName={deviceName} mediaStatus={mediaStatus}></MusicPlayerSlider>
      <FileUploadButton deviceIndex={deviceIndex} setSelectedFile={setSelectedFile}></FileUploadButton>
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
