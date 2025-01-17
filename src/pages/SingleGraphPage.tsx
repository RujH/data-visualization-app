import { useEffect, useState } from 'react';
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
  const [searchParams] = useSearchParams();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoStartTime, setVideoStartTime] = useState<number | undefined>();
  const [csvPath, setCsvPath] = useState<string>('');
  const [csvName, setCsvName] = useState<string>('');

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
  }, [searchParams]);

  // Listen for messages from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent<WindowMessage>) => {
      if (event.data.type === 'TIME_UPDATE') {
        setCurrentTime(event.data.currentTime);
        setVideoStartTime(event.data.videoStartTime);
      } else if (event.data.type === 'SINGLE_FILE_STATE') {
        setCsvName(event.data.file.name);
        setCsvPath(event.data.file.path);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

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