import axios from 'axios';
import FileUploadButton from './FileUploadButton';
import { useState } from 'react';
import React, { useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
    <Stack spacing={2} direction={'row'}>
      <Typography variant="h5" gutterBottom>{deviceName}</Typography>
      <FileUploadButton deviceId={deviceId} setSelectedFile={setSelectedFile}></FileUploadButton>
    </Stack>
  );
}

export default DeviceCard;
