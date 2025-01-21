import React, { useState, useEffect, useRef, createRef } from 'react';
import { 
  Box, 
  Button, 
  Collapse, 
  Flex 
} from '@chakra-ui/react';
import { MinusIcon, AddIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { BsVolumeMuteFill, BsVolumeUpFill } from 'react-icons/bs';
import { useFileContext } from '../../FileContext';
import { VideoControl } from './DataPlatformPage';

export interface VideoColumnProps {
  registerVideo: (control: VideoControl) => void;
  unregisterVideo: (videoRef: React.RefObject<HTMLVideoElement>) => void;
  isPlaying: boolean;
}

const VideoColumn: React.FC<VideoColumnProps> = ({ registerVideo, unregisterVideo, isPlaying }) => {
  const [show, setShow] = useState(true);
  const { files } = useFileContext();
  const [mp4Files, setMp4Files] = useState<File[]>([]);
  const videoRefs = useRef<{ [key: number]: React.RefObject<HTMLVideoElement> }>({});
  const [muteStates, setMuteStates] = useState<{ [key: number]: boolean }>({});
  const [expandedWindows, setExpandedWindows] = useState<{ [key: number]: Window | null }>({});
  const messageHandlers = useRef<{ [key: number]: (event: MessageEvent) => void }>({});
  const syncTimeoutRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

  useEffect(() => {
    if (files) {
      const fileArray = Array.from(files);
      const filteredFiles = fileArray.filter(file => file.name.endsWith('.mp4'));
      setMp4Files(filteredFiles);
      
      // Initialize video refs and set mute states to true by default
      filteredFiles.forEach((_, index) => {
        if (!videoRefs.current[index]) {
          videoRefs.current[index] = createRef<HTMLVideoElement>();
        }
        setMuteStates(prev => ({
          ...prev,
          [index]: true
        }));
      });
    }
  }, [files]);

  useEffect(() => {
    const currentRefs = videoRefs.current;
    const currentWindows = { ...expandedWindows };
    const currentHandlers = { ...messageHandlers.current };
    const currentTimeouts = { ...syncTimeoutRef.current };

    Object.entries(currentRefs).forEach(([index, ref]) => {
      if (ref.current) {
        registerVideo({
          currentTime: ref.current.currentTime,
          duration: ref.current.duration,
          isPlaying: !ref.current.paused,
          videoRef: ref,
          muted: muteStates[parseInt(index)] || false
        });
      }
    });

    return () => {
      Object.values(currentRefs).forEach(ref => {
        unregisterVideo(ref);
      });

      Object.entries(currentWindows).forEach(([index, window]) => {
        if (window && !window.closed) {
          window.close();
          if (currentHandlers[parseInt(index)]) {
            global.removeEventListener('message', currentHandlers[parseInt(index)]);
          }
        }
      });

      Object.values(currentTimeouts).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [registerVideo, unregisterVideo, expandedWindows]);

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([index, ref]) => {
      const video = ref.current;
      if (video) {
        if (isPlaying && video.paused) {
          video.play().catch(console.error);
        } else if (!isPlaying && !video.paused) {
          video.pause();
        }

        const expandedWindow = expandedWindows[parseInt(index)];
        if (expandedWindow && !expandedWindow.closed) {
          expandedWindow.postMessage({
            type: 'sync',
            time: video.currentTime,
            isPlaying
          }, '*');
        }
      }
    });
  }, [isPlaying, expandedWindows]);

  const handleToggle = () => setShow(!show);
  const handleMute = (index: number) => {
    setMuteStates(prev => {
      const newState = { ...prev, [index]: !prev[index] };
      // Update video registration with new mute state
      const video = videoRefs.current[index]?.current;
      if (video) {
        registerVideo({
          currentTime: video.currentTime,
          duration: video.duration,
          isPlaying: !video.paused,
          videoRef: videoRefs.current[index],
          muted: newState[index]
        });
      }
      return newState;
    });
  };

  const handleExpandVideoButton = (file: File, index: number) => {
    const existingWindow = expandedWindows[index];
    if (existingWindow && !existingWindow.closed) {
      existingWindow.focus();
      return;
    }

    const newWindow = window.open('', '_blank', 'width=800,height=600');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${file.name}</title>
            <style>
              body { margin: 0; background: black; display: flex; justify-content: center; align-items: center; height: 100vh; }
              video { max-width: 100%; max-height: 100vh; }
              .video-container { position: relative; width: 100%; height: 100%; }
              .controls { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); 
                         display: flex; gap: 10px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; }
              button { padding: 5px 15px; border-radius: 4px; border: none; cursor: pointer; background: #4299e1; color: white; }
              button:hover { background: #3182ce; }
            </style>
          </head>
          <body>
            <div class="video-container">
              <video width="100%" height="100%">
                <source src="${URL.createObjectURL(file)}" type="video/mp4">
              </video>
              <div class="controls">
                <button onclick="window.postMessage({type: 'skip', seconds: -10}, '*')">-10s</button>
                <button id="playPauseBtn" onclick="window.postMessage({type: 'togglePlay'}, '*')">${isPlaying ? 'Pause' : 'Play'}</button>
                <button onclick="window.postMessage({type: 'skip', seconds: 10}, '*')">+10s</button>
                <button id="muteBtn" onclick="window.postMessage({type: 'toggleMute'}, '*')">${muteStates[index] ? 'Unmute' : 'Mute'}</button>
              </div>
            </div>
            <script>
              const video = document.querySelector('video');
              let syncInProgress = false;
              let lastUpdateTime = 0;
              const UPDATE_INTERVAL = 16; // ~60fps

              function notifyTimeUpdate() {
                const now = Date.now();
                if (!syncInProgress && now - lastUpdateTime >= UPDATE_INTERVAL) {
                  window.opener.postMessage({
                    type: 'timeUpdate',
                    index: ${index},
                    time: video.currentTime,
                    isPlaying: !video.paused
                  }, '*');
                  lastUpdateTime = now;
                }
              }

              video.muted = ${muteStates[index]};
              
              video.addEventListener('timeupdate', notifyTimeUpdate);
              video.addEventListener('seeking', notifyTimeUpdate);
              video.addEventListener('seeked', notifyTimeUpdate);
              
              // Update play/pause button text
              function updatePlayPauseButton(isPlaying) {
                const playPauseBtn = document.getElementById('playPauseBtn');
                if (playPauseBtn) {
                  playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
                }
              }
              
              // Update mute button text
              function updateMuteButton(isMuted) {
                const muteBtn = document.getElementById('muteBtn');
                if (muteBtn) {
                  muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
                }
              }

              video.addEventListener('play', () => {
                window.opener.postMessage({
                  type: 'playStateChange',
                  index: ${index},
                  isPlaying: true,
                  time: video.currentTime
                }, '*');
              });

              video.addEventListener('pause', () => {
                window.opener.postMessage({
                  type: 'playStateChange',
                  index: ${index},
                  isPlaying: false,
                  time: video.currentTime
                }, '*');
              });

              window.addEventListener('message', (event) => {
                if (event.source === window) {
                  switch (event.data.type) {
                    case 'togglePlay':
                      if (video.paused) {
                        video.play();
                        window.opener.postMessage({
                          type: 'playAll',
                          index: ${index}
                        }, '*');
                      } else {
                        video.pause();
                        window.opener.postMessage({
                          type: 'pauseAll',
                          index: ${index}
                        }, '*');
                      }
                      break;
                    case 'skip':
                      video.currentTime += event.data.seconds;
                      window.opener.postMessage({
                        type: 'skipAll',
                        seconds: event.data.seconds,
                        index: ${index}
                      }, '*');
                      break;
                    case 'toggleMute':
                      video.muted = !video.muted;
                      updateMuteButton(video.muted);
                      window.opener.postMessage({
                        type: 'toggleMute',
                        index: ${index},
                        muted: video.muted
                      }, '*');
                      break;
                  }
                } else if (event.data.type === 'sync') {
                  syncInProgress = true;
                  const timeDiff = Math.abs(video.currentTime - event.data.time);
                  if (timeDiff > 0.1) {
                    video.currentTime = event.data.time;
                  }
                  if (event.data.isPlaying !== !video.paused) {
                    if (event.data.isPlaying) video.play();
                    else video.pause();
                  }
                  if (video.muted !== event.data.muted) {
                    video.muted = event.data.muted;
                    updateMuteButton(event.data.muted);
                  }
                  updatePlayPauseButton(event.data.isPlaying);
                  setTimeout(() => { syncInProgress = false; }, 50);
                }
              });

              window.opener.postMessage({
                type: 'requestSync',
                index: ${index}
              }, '*');
            </script>
          </body>
        </html>
      `);

      const expandedVideo = newWindow.document.querySelector('video') as HTMLVideoElement;
      const mainVideo = videoRefs.current[index]?.current;

      if (expandedVideo && mainVideo) {
        expandedVideo.currentTime = mainVideo.currentTime;
        if (!mainVideo.paused) {
          expandedVideo.play().catch(console.error);
        }
      }

      const messageHandler = (event: MessageEvent) => {
        if (event.source === newWindow) {
          const mainVideo = videoRefs.current[index]?.current;
          if (!mainVideo) return;

          switch (event.data.type) {
            case 'timeUpdate':
              // Sync all videos to the same time
              Object.entries(videoRefs.current).forEach(([vidIndex, ref]) => {
                const video = ref.current;
                if (video && parseInt(vidIndex) !== event.data.index) {
                  if (Math.abs(video.currentTime - event.data.time) > 0.1) {
                    video.currentTime = event.data.time;
                  }
                }
              });
              break;
            case 'playAll':
              Object.entries(videoRefs.current).forEach(([vidIndex, ref]) => {
                const video = ref.current;
                if (video && parseInt(vidIndex) !== event.data.index && video.paused) {
                  video.play().catch(console.error);
                }
              });
              break;
            case 'pauseAll':
              Object.entries(videoRefs.current).forEach(([vidIndex, ref]) => {
                const video = ref.current;
                if (video && parseInt(vidIndex) !== event.data.index && !video.paused) {
                  video.pause();
                }
              });
              break;
            case 'skipAll':
              Object.entries(videoRefs.current).forEach(([vidIndex, ref]) => {
                const video = ref.current;
                if (video && parseInt(vidIndex) !== event.data.index) {
                  video.currentTime += event.data.seconds;
                }
              });
              break;
            case 'toggleMute':
              if (event.data.muted !== undefined) {
                setMuteStates(prev => ({
                  ...prev,
                  [event.data.index]: event.data.muted
                }));
              } else {
                handleMute(event.data.index);
              }
              break;
            case 'requestSync':
              newWindow.postMessage({
                type: 'sync',
                time: mainVideo.currentTime,
                isPlaying: !mainVideo.paused,
                muted: muteStates[index] || false
              }, '*');
              break;
          }
        }
      };

      messageHandlers.current[index] = messageHandler;
      window.addEventListener('message', messageHandler);

      setExpandedWindows(prev => ({ ...prev, [index]: newWindow }));

      newWindow.addEventListener('beforeunload', () => {
        window.removeEventListener('message', messageHandler);
        setExpandedWindows(prev => ({ ...prev, [index]: null }));
      });
    }
  };

  const handleTimeUpdate = (index: number) => {
    const video = videoRefs.current[index]?.current;
    if (video) {
        registerVideo({
          currentTime: video.currentTime,
          duration: video.duration,
          isPlaying: !video.paused,
          videoRef: videoRefs.current[index],
          muted: muteStates[index] || false
        });

      if (syncTimeoutRef.current[index]) {
        clearTimeout(syncTimeoutRef.current[index]);
      }

      syncTimeoutRef.current[index] = setTimeout(() => {
        const expandedWindow = expandedWindows[index];
        if (expandedWindow && !expandedWindow.closed) {
          expandedWindow.postMessage({
            type: 'sync',
            time: video.currentTime,
            isPlaying: !video.paused
          }, '*');
        }
      }, 16);
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
            <Button 
              mb={"2"} 
              size={"xs"} 
              onClick={handleToggle} 
              leftIcon={show ? <MinusIcon /> : <AddIcon />}
            >
              {file.name}
            </Button>

            <Collapse in={show}>
              <Flex direction="column" mb={"5"}>
                <Box borderRadius="12px" overflow="hidden" width="100%">
                  <video 
                    ref={videoRefs.current[index]}
                    controls={false}
                    width="100%"
                    muted={muteStates[index] || false}
                    onTimeUpdate={() => handleTimeUpdate(index)}
                    onSeeking={() => handleTimeUpdate(index)}
                    onSeeked={() => handleTimeUpdate(index)}
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
                  <Button 
                    size="xs" 
                    mr={2} 
                    onClick={() => handleMute(index)}
                    leftIcon={muteStates[index] ? <BsVolumeMuteFill /> : <BsVolumeUpFill />}
                  >
                    {muteStates[index] ? 'Unmute' : 'Mute'}
                  </Button>
                  <Button 
                    size="xs" 
                    onClick={() => handleExpandVideoButton(file, index)}
                    leftIcon={<ExternalLinkIcon />}
                  >
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