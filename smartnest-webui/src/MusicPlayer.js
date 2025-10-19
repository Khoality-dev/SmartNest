import * as React from 'react';
import { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import FastForwardRounded from '@mui/icons-material/FastForwardRounded';
import FastRewindRounded from '@mui/icons-material/FastRewindRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import VolumeDownRounded from '@mui/icons-material/VolumeDownRounded';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOnIcon from '@mui/icons-material/RepeatOn';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import axios from 'axios';
import { API_URL } from './configs';

const TinyText = styled(Typography)({
  fontSize: '0.75rem',
  opacity: 0.6,
  fontWeight: 500,
  letterSpacing: 0.2,
});

export default function MusicPlayerSlider({ deviceName, mediaStatus }) {
  const [position, setPosition] = React.useState(0);
  const [paused, setPaused] = React.useState(true);
  const [fileName, setFileName] = React.useState('');
  const [duration, setDuration] = React.useState(0);
  const [loop, setLoop] = React.useState(false);
  const [volume, setVolume] = React.useState(100);

  function formatDuration(value) {
    const minute = Math.floor(value / 60);
    const secondLeft = value - minute * 60;
    return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
  }

  const PlayPauseClickHandler = async () => {
    try {
      await axios.post(API_URL + '/config-device', {
        device_name: deviceName,
        configs: {
          pause: !paused
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const RepeatOnClickHandler = async () => {
    try {
      await axios.post(API_URL + '/config-device', {
        device_name: deviceName,
        configs: {
          loop: !loop
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const VolumeChangeCommitHandler = async (event, newValue) => {
    try {
      await axios.post(API_URL + '/config-device', {
        device_name: deviceName,
        configs: {
          volume: newValue
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setFileName(mediaStatus.file_name);
    setDuration(mediaStatus.duration);
    setPosition(mediaStatus.position);
    setPaused(mediaStatus.paused);
    setLoop(mediaStatus.looping);
    setVolume(mediaStatus.volume);
  }
    , [mediaStatus]);

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      {/* Now Playing Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <MusicNoteIcon sx={{ fontSize: 32, color: 'primary.contrastText' }} />
        </Box>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Now Playing
          </Typography>
          <Typography variant="body1" fontWeight={600} noWrap>
            {fileName || 'No media selected'}
          </Typography>
        </Box>
      </Box>

      {/* Progress Slider */}
      <Box sx={{ mb: 1 }}>
        <Slider
          aria-label="time-indicator"
          size="small"
          value={position}
          min={0}
          step={1}
          max={duration}
          onChange={(_, value) => setPosition(value)}
          sx={{
            color: 'primary.main',
            height: 6,
            '& .MuiSlider-thumb': {
              width: 16,
              height: 16,
              transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0px 0px 0px 8px rgba(25, 118, 210, 0.16)'
              },
              '&.Mui-active': {
                width: 20,
                height: 20
              }
            },
            '& .MuiSlider-rail': {
              opacity: 0.28
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TinyText>{formatDuration(position)}</TinyText>
          <TinyText>{formatDuration(duration)}</TinyText>
        </Box>
      </Box>

      {/* Playback Controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          mb: 2
        }}
      >
        <IconButton
          aria-label="previous song"
          size="large"
          sx={{
            bgcolor: 'action.hover',
            '&:hover': { bgcolor: 'action.selected' }
          }}
        >
          <FastRewindRounded />
        </IconButton>
        <IconButton
          aria-label={paused ? 'play' : 'pause'}
          onClick={PlayPauseClickHandler}
          size="large"
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            width: 56,
            height: 56,
            '&:hover': {
              bgcolor: 'primary.dark'
            }
          }}
        >
          {paused ? (
            <PlayArrowRounded sx={{ fontSize: '2rem' }} />
          ) : (
            <PauseRounded sx={{ fontSize: '2rem' }} />
          )}
        </IconButton>
        <IconButton
          aria-label="next song"
          size="large"
          sx={{
            bgcolor: 'action.hover',
            '&:hover': { bgcolor: 'action.selected' }
          }}
        >
          <FastForwardRounded />
        </IconButton>
        <IconButton
          aria-label="loop"
          onClick={RepeatOnClickHandler}
          size="large"
          sx={{
            color: loop ? 'primary.main' : 'action.active',
            bgcolor: loop ? 'primary.light' : 'action.hover',
            '&:hover': { bgcolor: loop ? 'primary.light' : 'action.selected' }
          }}
        >
          {loop ? <RepeatOnIcon /> : <RepeatIcon />}
        </IconButton>
      </Box>

      {/* Volume Control */}
      <Stack
        spacing={2}
        direction="row"
        sx={{ px: 2 }}
        alignItems="center"
      >
        <VolumeDownRounded sx={{ color: 'text.secondary' }} />
        <Slider
          aria-label="Volume"
          value={volume}
          onChange={(_, value) => setVolume(value)}
          onChangeCommitted={VolumeChangeCommitHandler}
          sx={{
            color: 'primary.main',
            '& .MuiSlider-track': {
              border: 'none'
            },
            '& .MuiSlider-thumb': {
              width: 20,
              height: 20,
              backgroundColor: 'primary.main',
              '&:hover, &.Mui-focusVisible, &.Mui-active': {
                boxShadow: '0px 0px 0px 8px rgba(25, 118, 210, 0.16)'
              }
            }
          }}
        />
        <VolumeUpRounded sx={{ color: 'text.secondary' }} />
      </Stack>
    </Box>
  );
}