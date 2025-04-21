import React, { useEffect } from 'react';
import { Button, Typography } from '@mui/material';
import axios from 'axios';
import { API_URL } from './configs';
import { getCookieValue } from './utils';

export const playFile = async (deviceName, selectedFileName) => {
    try {
      const body = {
        filename: selectedFileName,
        device_name: deviceName
      };
      console.log('device_name', deviceName);
      const cfToken = getCookieValue('CF_Authorization');
      const response = await axios.post(API_URL + '/play', body, {
        headers: {
          'Authorization': `Bearer ${cfToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

const FileUploadButton = ({deviceName}) => {
    const [uploadProgress, setUploadProgress] = React.useState(0);
    const uploadFile = async (selectedFile) => {
        try {
          const formData = new FormData();
          formData.append('file', selectedFile);
          const cfToken = getCookieValue('CF_Authorization');
          const response = await axios.post(API_URL + '/upload', formData, {
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
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            await uploadFile(file);
            playFile(deviceName, file.name);
        }
    };

    return (
        <>
            <input
                accept=".mp3"
                style={{ display: 'none' }}
                id={`file-upload-${deviceName}`}
                type="file"
                onChange={handleFileChange}
            />
            <label htmlFor={`file-upload-${deviceName}`}>
                <Button variant="contained" component="span" alignItems="center" variant="contained" sx={{ width: "100%", height: "50px", fontSize: 20 }}>
                    Chon file nhac
                </Button>
            </label>
        </>
    );
};

export default FileUploadButton;
