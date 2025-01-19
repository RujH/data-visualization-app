import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Checkbox,
  Text,
  VStack,
  Flex,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react';

interface AudioFile {
  name: string;
  file: File;
  startTimestamp: number;
}

interface AudioPlayerProps {
  audioFiles: AudioFile[];
  videoStartTimestamp: number;
  currentTime: number;
  isPlaying: boolean;
}

export default function AudioPlayer({ 
  audioFiles, 
  videoStartTimestamp, 
  currentTime, 
  isPlaying 
}: AudioPlayerProps) {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const [mutedStates, setMutedStates] = useState<{ [key: string]: boolean }>({});

  // Initialize audio elements and muted states
  useEffect(() => {
    const newAudioRefs: { [key: string]: HTMLAudioElement } = {};
    const newMutedStates: { [key: string]: boolean } = {};

    audioFiles.forEach(audioFile => {
      // Create audio element
      const audio = new Audio(URL.createObjectURL(audioFile.file));
      audio.muted = true;
      // Set initial volume to avoid any sudden loud sounds
      audio.volume = 0.5;
      newAudioRefs[audioFile.name] = audio;
      newMutedStates[audioFile.name] = false; // Initialize as muted (false means muted)
    });

    audioRefs.current = newAudioRefs;
    setMutedStates(newMutedStates);

    // Cleanup
    return () => {
      Object.values(newAudioRefs).forEach(audio => {
        URL.revokeObjectURL(audio.src);
        audio.remove();
      });
    };
  }, [audioFiles]);

  // Handle playback synchronization
  useEffect(() => {
    audioFiles.forEach(audioFile => {
      const audio = audioRefs.current[audioFile.name];
      if (!audio) return;

      // Calculate the exact time difference in seconds
      const relativeStartTime = audioFile.startTimestamp - videoStartTimestamp;
      
      if (currentTime >= relativeStartTime) {
        // Calculate the correct position in the audio file
        const audioPosition = currentTime - relativeStartTime;
        
        // Only set time if it's significantly different to avoid unnecessary updates
        if (Math.abs(audio.currentTime - audioPosition) > 0.1) {
          audio.currentTime = audioPosition;
        }

        // Update playback state based on mute status and video playing state
        const shouldPlay = isPlaying && mutedStates[audioFile.name];
        
        if (shouldPlay) {
          // If should be playing but is paused or muted
          if (audio.paused || audio.muted) {
            audio.muted = false; // Unmute when should play
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.error('Audio playback failed:', error);
                // If autoplay was prevented, we'll need user interaction
                setMutedStates(prev => ({ ...prev, [audioFile.name]: false }));
              });
            }
          }
        } else {
          // If shouldn't be playing but is playing
          if (!audio.paused) {
            audio.pause();
          }
          audio.muted = true;
        }
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }, [currentTime, isPlaying, audioFiles, videoStartTimestamp, mutedStates]);

  // Handle mute toggle with improved error handling
  const handleMuteToggle = (audioName: string) => {
    setMutedStates(prev => {
      const newState = { ...prev, [audioName]: !prev[audioName] };
      const audio = audioRefs.current[audioName];
      if (audio) {
        audio.muted = !newState[audioName]; // When newState is true, audio should be unmuted
        if (newState[audioName] && isPlaying) { // If unmuting and video is playing
          const audioFile = audioFiles.find(file => file.name === audioName);
          if (audioFile) {
          const relativeStartTime = audioFile.startTimestamp - videoStartTimestamp;
            if (currentTime >= relativeStartTime) {
              const playPromise = audio.play();
              if (playPromise !== undefined) {
                playPromise.catch(error => {
                  console.error('Audio playback failed:', error);
                  // Revert mute state if playback fails
                  setMutedStates(prev => ({ ...prev, [audioName]: false }));
                });
              }
            }
          }
        } else {
          audio.pause();
        }
      }
      return newState;
    });
  };

  // Handle volume change
  const handleVolumeChange = (audioName: string, volume: number) => {
    const audio = audioRefs.current[audioName];
    if (audio) {
      audio.volume = volume;
    }
  };

  // Format timestamp for display with exact calculation
  const formatTimestamp = (seconds: number, audioTimestamp: number, videoTimestamp: number) => {
    return `${seconds} seconds`;
  };

  return (
    <Box p={4}>
      <Text fontWeight="bold" mb={2}>External Audio Sources:</Text>
      <VStack align="start" spacing={4}>
        {audioFiles.map(audioFile => {
          const relativeStartTime = audioFile.startTimestamp - videoStartTimestamp;
          const isAvailable = currentTime >= relativeStartTime;
          const audio = audioRefs.current[audioFile.name];
          
          return (
            <Box key={audioFile.name} width="100%">
              <Flex align="center" justify="space-between" width="100%">
                <Checkbox
                  isChecked={mutedStates[audioFile.name]}
                  onChange={() => handleMuteToggle(audioFile.name)}
                  isDisabled={!isAvailable}
                >
                  {audioFile.name} ({isAvailable ? 'Available' : `Available after ${formatTimestamp(relativeStartTime, audioFile.startTimestamp, videoStartTimestamp)}`})
                </Checkbox>
                {mutedStates[audioFile.name] && isAvailable && (
                  <Box ml={4} width="150px">
                    <Slider
                      aria-label="Volume"
                      defaultValue={audio?.volume || 0.5}
                      min={0}
                      max={1}
                      step={0.1}
                      onChange={(value) => handleVolumeChange(audioFile.name, value)}
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </Box>
                )}
              </Flex>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
}