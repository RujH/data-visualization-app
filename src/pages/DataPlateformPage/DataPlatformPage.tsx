import VideoColumn from './VideoColumn';
import ButtonsColumn from './ButtonsColumn';
import { Box, Container, Flex } from '@chakra-ui/react';
import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Observation } from '../../components/CreateObservationModal';
import GraphsColumn from './GraphsColumn';
import { useFileContext } from '../../FileContext';

export interface VideoControl {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  muted: boolean;
}

export default function DataPlatformPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialObservations = (location.state?.observations as Observation[]) || [];
  const { files } = useFileContext();

  // Handle browser refresh
  useEffect(() => {
    // Check if we're coming from a refresh
    const isRefresh = sessionStorage.getItem('isRefreshing');
    if (isRefresh) {
      sessionStorage.removeItem('isRefreshing');
      // Cleanup videos before navigation
      videoControls.forEach(control => {
        if (control.videoRef.current) {
          control.videoRef.current.pause();
          control.videoRef.current.src = '';
          control.videoRef.current.load();
        }
      });
      // Reset video controls
      setVideoControls([]);
      setIsPlaying(false);
      navigate('/');
    }

    const handleBeforeUnload = () => {
      // Pause all videos before setting refresh flag
      videoControls.forEach(control => {
        if (control.videoRef.current) {
          control.videoRef.current.pause();
        }
      });
      sessionStorage.setItem('isRefreshing', 'true');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate]);
  
  const [videoControls, setVideoControls] = useState<VideoControl[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoStartTime, setVideoStartTime] = useState<number | undefined>();
  const maxDuration = Math.max(...videoControls.map(c => c.duration || 0), 0);

  // Extract video start time from filename
  useEffect(() => {
    if (files) {
      const videoFile = Array.from(files).find(file => file.name.endsWith('.mp4'));
      if (videoFile) {
        const match = videoFile.name.match(/^(\d+)/);
        if (match) {
          const startTime = parseInt(match[1], 10);
          setVideoStartTime(startTime);
        }
      }
    }
  }, [files]);



  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
    videoControls.forEach(control => {
      if (control.videoRef.current) {
        control.videoRef.current.currentTime = time;
      }
    });
  }, [videoControls]);

  const handlePlayPause = useCallback(() => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    videoControls.forEach(control => {
      if (control.videoRef.current) {
        if (newIsPlaying) {
          control.videoRef.current.play();
        } else {
          control.videoRef.current.pause();
        }
      }
    });
  }, [isPlaying, videoControls]);

  const handleSkip = useCallback((seconds: number) => {
    const newTime = currentTime + seconds;
    setCurrentTime(newTime);
    videoControls.forEach(control => {
      if (control.videoRef.current) {
        control.videoRef.current.currentTime = newTime;
      }
    });
  }, [videoControls, currentTime]);

  const handleGoToTime = useCallback((hours: number, minutes: number, seconds: number) => {
    const timeInSeconds = hours * 3600 + minutes * 60 + seconds;
    setCurrentTime(timeInSeconds);
    videoControls.forEach(control => {
      if (control.videoRef.current) {
        control.videoRef.current.currentTime = timeInSeconds;
      }
    });
  }, [videoControls]);

  const registerVideo = useCallback((control: VideoControl) => {
    setVideoControls(prev => {
      // Update or add the control
      const exists = prev.find(c => c.videoRef === control.videoRef);
      if (exists) {
        return prev.map(c => c.videoRef === control.videoRef ? { ...control, muted: control.muted ?? exists.muted } : c);
      }
      return [...prev, { ...control, muted: control.muted ?? false }];
    });
    // Update current time when a new video registers
    setCurrentTime(control.currentTime);
  }, []);

  const unregisterVideo = useCallback((videoRef: React.RefObject<HTMLVideoElement>) => {
    setVideoControls(prev => prev.filter(control => control.videoRef !== videoRef));
  }, []);

  return (
    <Container maxW='container.xlg'>
      <Flex mb={4}>
        <VideoColumn 
          registerVideo={registerVideo}
          unregisterVideo={unregisterVideo}
          isPlaying={isPlaying}
        />
        <ButtonsColumn
          currentTime={currentTime}
          isPlaying={isPlaying}
          maxDuration={maxDuration}
          onTimeUpdate={handleTimeUpdate}
          onPlayPause={handlePlayPause}
          onSkip={handleSkip}
          onGoToTime={handleGoToTime}
          initialObservations={initialObservations}
        />
      </Flex>

      <Box m={2}>
        <GraphsColumn
          currentTime={currentTime}
          videoStartTime={videoStartTime}
        />
      </Box>
    </Container>
  );
}