import { useEffect, useState } from 'react';
import { Box, Container, Heading, VStack, Spinner, Center, Text } from '@chakra-ui/react';
import Graph from '../components/Graph';
import { useSearchParams } from 'react-router-dom';

interface CsvFile {
  name: string;
  path: string;
}

interface FileData {
  name: string;
  type: string;
  data: ArrayBuffer;
}

interface FileStateMessage {
  type: 'FILE_STATE';
  files: FileData[];
}

interface TimeUpdateMessage {
  type: 'TIME_UPDATE';
  currentTime: number;
  videoStartTime: number;
}

type WindowMessage = FileStateMessage | TimeUpdateMessage;

export default function GraphsPage() {
  const [searchParams] = useSearchParams();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoStartTime, setVideoStartTime] = useState<number | undefined>();
  const [csvFiles, setCsvFiles] = useState<CsvFile[]>([]);

  // Initialize time values from URL parameters
  useEffect(() => {
    const timeParam = searchParams.get('currentTime');
    const startTimeParam = searchParams.get('videoStartTime');

    if (timeParam) {
      setCurrentTime(parseFloat(timeParam));
    }
    if (startTimeParam) {
      setVideoStartTime(parseInt(startTimeParam, 10));
    }
  }, [searchParams]);

  // Listen for messages from the main window
  useEffect(() => {
    const handleMessage = (event: MessageEvent<WindowMessage>) => {
      if (event.data.type === 'TIME_UPDATE') {
        setCurrentTime(event.data.currentTime);
        setVideoStartTime(event.data.videoStartTime);
      } else if (event.data.type === 'FILE_STATE') {
        // Reconstruct files and create blob URLs
        const csvs = event.data.files.map(fileData => {
          const file = new File([fileData.data], fileData.name, { type: fileData.type });
          return {
            name: file.name,
            path: URL.createObjectURL(file)
          };
        });
        setCsvFiles(csvs);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      csvFiles.forEach(csv => URL.revokeObjectURL(csv.path));
    };
  }, [csvFiles]);

  return (
    <Container maxW='container.xlg' py={8}>
      <Heading mb={6}>Sensor Data Graphs</Heading>
      {csvFiles.length === 0 ? (
        <Center py={8}>
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.600">Loading sensor data...</Text>
          </VStack>
        </Center>
      ) : (
        <VStack spacing={4} align="stretch">
          {csvFiles.map((csv) => (
            <Box key={csv.name} width="100%">
              <Graph
                xAxisName="Time"
                yAxisName={csv.name.replace('.csv', '')}
                currentTime={currentTime}
                videoStartTime={videoStartTime}
                csvPath={csv.path}
              />
            </Box>
          ))}
        </VStack>
      )}
    </Container>
  );
}