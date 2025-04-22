import React from 'react';
import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ImageIcon from '@mui/icons-material/Image';
import axios from 'axios';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import { API_URL } from './configs';
import { getCookieValue } from './utils';
import Button from '@mui/material/Button';
import FileUploadButton from './FileUploadButton';
import { playFile } from './FileUploadButton';

const MediaSelectDialog = ({ deviceName, open, onClose }) => {
  const [mediaList, setMediaList] = React.useState([]);
  const handleSelect = (media) => {
    playFile(deviceName, media);
    onClose();
  };


  const fetchMedia = async () => {
    try {
      const cfToken = getCookieValue('CF_Authorization');
      const response = await axios.get(API_URL + '/media', {
        headers: {
          'Authorization': `Bearer ${cfToken}`
        }
      });
      console.log('Response:', response.data.media);
      setMediaList(response.data.media);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select Media Source</DialogTitle>
      <DialogContent justifyContent="center" alignItems="center">
        <FileUploadButton deviceName={deviceName} />
        <Grid container spacing={2}>
          {mediaList.map((media) => (
            <Grid item xs={4} sm={3} md={2} key={media}>
              <IconButton onClick={() => handleSelect(media)} textAlign="left">
                <AudioFileIcon sx={{ fontSize: 50 }} />
                <Typography variant="body2" textAlign="left">
                  {media}
                </Typography>
              </IconButton>
            </Grid>
          ))}
        </Grid>

      </DialogContent>
    </Dialog>
  );
};

export default MediaSelectDialog;