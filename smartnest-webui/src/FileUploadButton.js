import { useState } from 'react';
import {
  Button,
  Typography,
  Box,
  Paper,
  LinearProgress,
  Alert,
  Snackbar
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';
import { API_URL } from './configs';

export const playFile = async (deviceName, selectedFileName) => {
  try {
    const body = {
      filename: selectedFileName,
      device_name: deviceName
    };
    console.log('device_name', deviceName);
    await axios.post(API_URL + '/play', body, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error(error);
  }
};

const FileUploadButton = ({ deviceName, onUploadComplete }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const uploadFile = async (selectedFile) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      await axios.post(API_URL + '/upload', formData, {
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

      setUploadStatus('success');
      setSnackbarOpen(true);

      // Refresh media list after successful upload
      if (onUploadComplete) {
        setTimeout(() => onUploadComplete(), 500);
      }

      return true;
    } catch (error) {
      console.error(error);
      setUploadStatus('error');
      setErrorMessage(error.response?.data?.message || 'Upload failed');
      setSnackbarOpen(true);
      return false;
    } finally {
      setUploading(false);
      // Reset progress after 2 seconds
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus(null);
      }, 2000);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const success = await uploadFile(file);
      if (success) {
        playFile(deviceName, file.name);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];

      // Check file type
      if (!file.name.toLowerCase().endsWith('.mp3')) {
        setErrorMessage('Please upload an MP3 file');
        setUploadStatus('error');
        setSnackbarOpen(true);
        return;
      }

      const success = await uploadFile(file);
      if (success) {
        playFile(deviceName, file.name);
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <input
        accept=".mp3"
        style={{ display: 'none' }}
        id={`file-upload-${deviceName}`}
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
      />

      <Paper
        elevation={dragActive ? 8 : 2}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          p: 3,
          textAlign: 'center',
          border: dragActive ? '2px dashed' : '2px dashed transparent',
          borderColor: dragActive ? 'primary.main' : 'transparent',
          backgroundColor: dragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.3s ease',
          cursor: uploading ? 'wait' : 'pointer',
          '&:hover': {
            backgroundColor: uploading ? 'background.paper' : 'action.hover',
            borderColor: uploading ? 'transparent' : 'primary.light'
          }
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          {uploadStatus === 'success' ? (
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
          ) : uploadStatus === 'error' ? (
            <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />
          ) : (
            <CloudUploadIcon
              sx={{
                fontSize: 48,
                color: dragActive ? 'primary.main' : 'action.active',
                transition: 'all 0.3s ease'
              }}
            />
          )}

          {uploading ? (
            <Box width="100%">
              <Typography variant="body2" color="text.secondary" mb={1}>
                Uploading... {uploadProgress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          ) : uploadStatus === 'success' ? (
            <Typography variant="body1" color="success.main" fontWeight={500}>
              Upload successful!
            </Typography>
          ) : uploadStatus === 'error' ? (
            <Typography variant="body1" color="error.main" fontWeight={500}>
              Upload failed
            </Typography>
          ) : (
            <>
              <Typography variant="body1" fontWeight={500}>
                {dragActive ? 'Drop file here' : 'Upload Music File'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Drag & drop or click to browse
              </Typography>
              <label htmlFor={`file-upload-${deviceName}`} style={{ width: '100%' }}>
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploading}
                  sx={{
                    width: '100%',
                    height: 48,
                    fontSize: 16,
                    fontWeight: 600
                  }}
                >
                  Choose File
                </Button>
              </label>
              <Typography variant="caption" color="text.disabled">
                Supported format: MP3
              </Typography>
            </>
          )}
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={uploadStatus === 'success' ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {uploadStatus === 'success'
            ? 'File uploaded successfully!'
            : errorMessage || 'Failed to upload file'}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FileUploadButton;
