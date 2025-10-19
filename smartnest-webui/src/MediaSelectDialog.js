import React from 'react';
import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardActionArea,
  Typography,
  Box,
  Divider,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { API_URL } from './configs';
import FileUploadButton from './FileUploadButton';
import { playFile } from './FileUploadButton';

const MediaSelectDialog = ({ deviceName, open, onClose }) => {
  const [mediaList, setMediaList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedMedia, setSelectedMedia] = React.useState(null);

  const handleSelect = (media) => {
    setSelectedMedia(media);
    playFile(deviceName, media);
    onClose();
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL + '/media');
      console.log('Response:', response.data.media);
      setMediaList(response.data.media);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '60vh'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <MusicNoteIcon color="primary" />
          <Typography variant="h6" component="span">
            Select Media Source
          </Typography>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3, pb: 3 }}>
        <Box mb={3}>
          <FileUploadButton deviceName={deviceName} onUploadComplete={fetchMedia} />
        </Box>

        <Divider sx={{ mb: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Or choose from library
          </Typography>
        </Divider>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : mediaList.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={200}
            flexDirection="column"
            gap={2}
          >
            <AudioFileIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
            <Typography variant="body1" color="text.secondary">
              No media files available
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Upload your first music file to get started
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {mediaList.map((media) => (
              <Grid item xs={6} sm={4} md={3} key={media}>
                <Card
                  elevation={selectedMedia === media ? 4 : 1}
                  sx={{
                    height: '100%',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      elevation: 4,
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => handleSelect(media)}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      p: 2,
                      minHeight: 140
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: 'primary.light',
                        borderRadius: '50%',
                        p: 2,
                        mb: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <AudioFileIcon
                        sx={{
                          fontSize: 40,
                          color: 'primary.contrastText'
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      textAlign="center"
                      sx={{
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.3,
                        fontWeight: 500
                      }}
                    >
                      {media}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MediaSelectDialog;