import React, { useState, useEffect, useRef, createRef } from 'react';
import { 
  Box, 
  Button, 
  Collapse, 
  Flex 
} from '@chakra-ui/react';
import { MinusIcon, AddIcon } from '@chakra-ui/icons';
import { useFileContext } from '../../FileContext';
import { useNavigate } from 'react-router-dom';
import { VideoControl } from './DataPlatformPage';

export interface VideoColumnProps {
  registerVideo: (control: VideoControl) => void;
  unregisterVideo: (videoRef: React.RefObject<HTMLVideoElement>) => void;
  isPlaying: boolean;
}

const VideoColumn: React.FC<VideoColumnProps> = ({ registerVideo, unregisterVideo, isPlaying }) => {
  const [show, setShow] = useState(true);
  const [mute, setMute] = useState(false);
  const { files } = useFileContext();
  const [mp4Files, setMp4Files] = useState<File[]>([]);
  const navigate = useNavigate();
  const videoRefs = useRef<{ [key: number]: React.RefObject<HTMLVideoElement> }>({});
  const timeUpdateThrottleRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

  useEffect(() => {
    if (files) {
      const fileArray = Array.from(files);
      const filteredFiles = fileArray.filter(file => file.name.endsWith('.mp4'));
      setMp4Files(filteredFiles);
      
      // Initialize refs for new files
      filteredFiles.forEach((_, index) => {
        if (!videoRefs.current[index]) {
          videoRefs.current[index] = createRef<HTMLVideoElement>();
        }
      });
    }
  }, [files]);

  useEffect(() => {
    const currentRefs = videoRefs.current;
    const currentTimeouts = { ...timeUpdateThrottleRef.current };

    // Register all video refs
    Object.entries(currentRefs).forEach(([index, ref]) => {
      if (ref.current) {
        registerVideo({
          currentTime: ref.current.currentTime,
          duration: ref.current.duration,
          isPlaying: !ref.current.paused,
          videoRef: ref
        });
      }
    });

    // Cleanup function to unregister videos
    return () => {
      Object.values(currentRefs).forEach(ref => {
        unregisterVideo(ref);
      });
      // Clear any pending timeouts
      Object.values(currentTimeouts).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [registerVideo, unregisterVideo]);

  useEffect(() => {
    const currentRefs = videoRefs.current;
    // Sync play/pause state with parent
    Object.values(currentRefs).forEach(ref => {
      if (ref.current) {
        if (isPlaying && ref.current.paused) {
          ref.current.play().catch(console.error);
        } else if (!isPlaying && !ref.current.paused) {
          ref.current.pause();
        }
      }
    });
  }, [isPlaying]);

  const handleToggle = () => setShow(!show);
  const handleMute = () => setMute(!mute);

  const handleExpandVideoButton = (file: File, index: number) => {
    navigate('/VideoPage', { state: { file, index } });
  };

  const handleTimeUpdate = (index: number) => {
    // Clear any existing timeout for this video
    if (timeUpdateThrottleRef.current[index]) {
      clearTimeout(timeUpdateThrottleRef.current[index]);
    }

    // Throttle time updates to prevent too frequent updates
    timeUpdateThrottleRef.current[index] = setTimeout(() => {
      const video = videoRefs.current[index].current;
      if (video) {
        registerVideo({
          currentTime: video.currentTime,
          duration: video.duration,
          isPlaying: !video.paused,
          videoRef: videoRefs.current[index]
        });
      }
    }, 16); // ~60fps
  };

  const handleLoadedMetadata = (index: number) => {
    const video = videoRefs.current[index].current;
    if (video) {
      registerVideo({
        currentTime: video.currentTime,
        duration: video.duration,
        isPlaying: !video.paused,
        videoRef: videoRefs.current[index]
      });
    }
  };

  return (
    <Box 
      maxHeight="600px" 
      overflowY="auto" 
      p={5}
      mx="auto" 
      borderWidth={1}
      borderRadius="md" 
      w='100%' 
      mr={5}
    >
      {mp4Files.length > 0 ? (
        mp4Files.map((file, index) => (
          <div key={index}>
            <Button mb={"2"} size={"xs"} onClick={handleToggle} leftIcon={show ? <MinusIcon /> : <AddIcon />}>
              {file.name}
            </Button>

            <Collapse in={show}>
              <Flex direction="column" mb={"5"}>
                <Box borderRadius="12px" overflow="hidden" width="100%">
                  <video 
                    ref={videoRefs.current[index]}
                    controls={false}
                    width="100%"
                    muted={mute}
                    onTimeUpdate={() => handleTimeUpdate(index)}
                    onLoadedMetadata={() => handleLoadedMetadata(index)}
                    onSeeked={() => handleTimeUpdate(index)}
                    onPlay={() => handleTimeUpdate(index)}
                    onPause={() => handleTimeUpdate(index)}
                  >
                    <source src={URL.createObjectURL(file)} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </Box>

                <Box
                  mt={2} 
                  display="flex"
                  justifyContent="flex-end" 
                >
                  <Button size="xs" mr={2} onClick={handleMute}>
                    {mute ? 'Unmute' : 'Mute'}
                  </Button>
                  <Button size="xs" onClick={() => handleExpandVideoButton(file, index)}>
                    Expand Video
                  </Button>
                </Box>
              </Flex>
            </Collapse>
          </div>
        ))
      ) : (
        <Box textAlign="center" mt={5}>
          <p>No MP4 files available.</p>
        </Box>
      )}
    </Box>
  );
};

export default VideoColumn;