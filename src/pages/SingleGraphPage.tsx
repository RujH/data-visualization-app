import { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Container, Heading } from '@chakra-ui/react';
import Graph from '../components/Graph';
import { useSearchParams } from 'react-router-dom';

interface SingleFileState {
  type: 'SINGLE_FILE_STATE';
  file: {
    name: string;
    path: string;
  };
}

interface TimeUpdate {
  type: 'TIME_UPDATE';
  currentTime: number;
  videoStartTime: number;
}

type WindowMessage = SingleFileState | TimeUpdate;

export default function SingleGraphPage() {
  // Track if we've received initial data
  const dataReceivedRef = useRef<boolean>(false);
  const readySignaledRef = useRef<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoStartTime, setVideoStartTime] = useState<number | undefined>();
  const [csvPath, setCsvPath] = useState<string>('');
  const [csvName, setCsvName] = useState<string>('');

  // Function to signal readiness to parent window
  const signalReady = () => {
    if (window.opener) {
      try {
        window.opener.postMessage({ type: 'GRAPH_WINDOW_READY' }, '*');
        readySignaledRef.current = true;
      } catch (error) {
        console.error('Failed to signal ready:', error);
      }
    }
  };

  // Debounce URL updates to avoid excessive history entries
  const debouncedUpdateUrl = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (time: number, startTime?: number) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const newParams = new URLSearchParams(searchParams);
          newParams.set('currentTime', time.toString());
          if (startTime !== undefined) {
            newParams.set('videoStartTime', startTime.toString());
          }
          setSearchParams(newParams, { replace: true });
        }, 100); // Update URL every 100ms at most
      };
    })(),
    [searchParams, setSearchParams]
  );

  // Handle incoming messages
  const handleMessage = useCallback((event: MessageEvent<WindowMessage>) => {
    try {
      if (event.data.type === 'TIME_UPDATE') {
        const newTime = event.data.currentTime;
        const newStartTime = event.data.videoStartTime;
        
        // Update state immediately for smooth graph updates
        setCurrentTime(newTime);
        setVideoStartTime(newStartTime);
        
        // Debounce URL updates to avoid performance issues
        debouncedUpdateUrl(newTime, newStartTime);
      } else if (event.data.type === 'SINGLE_FILE_STATE' && !dataReceivedRef.current) {
        setCsvName(event.data.file.name);
        setCsvPath(event.data.file.path);
        dataReceivedRef.current = true;
        signalReady(); // Re-signal ready after receiving data
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }, [debouncedUpdateUrl]);

  // Set up message listener and periodic ready signal
  useEffect(() => {
    window.addEventListener('message', handleMessage);

    // Set up periodic ready signal to ensure connection
    const readyInterval = setInterval(signalReady, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(readyInterval);
    };
  }, [handleMessage]);

  // Initialize from URL parameters
  useEffect(() => {
    const timeParam = searchParams.get('currentTime');
    const startTimeParam = searchParams.get('videoStartTime');
    const nameParam = searchParams.get('csvName');
    const pathParam = searchParams.get('csvPath');

    if (timeParam) {
      setCurrentTime(parseFloat(timeParam));
    }
    if (startTimeParam) {
      setVideoStartTime(parseInt(startTimeParam, 10));
    }
    if (nameParam) {
      setCsvName(nameParam);
    }
    if (pathParam) {
      setCsvPath(pathParam);
    }

    // Signal ready after initialization
    signalReady();
  }, [searchParams]);

  return (
    <Container maxW='container.xlg' py={8}>
      <Heading mb={6}>{csvName.replace('.csv', '')}</Heading>
      <Box height="80vh">
        {csvPath && (
          <Graph
            xAxisName="Time"
            yAxisName={csvName.replace('.csv', '')}
            currentTime={currentTime}
            videoStartTime={videoStartTime}
            csvPath={csvPath}
          />
        )}
      </Box>
    </Container>
  );
}