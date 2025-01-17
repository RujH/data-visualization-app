import Graph from "../../components/Graph";
import { Box, VStack, Button, Flex } from "@chakra-ui/react";
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useFileContext } from '../../FileContext';
import { useEffect, useState } from 'react';

interface GraphsColumnProps {
  currentTime?: number;
  videoStartTime?: number;
}

interface CsvFile {
  name: string;
  path: string;
}

export default function GraphsColumn({ currentTime, videoStartTime }: GraphsColumnProps) {
  const { files } = useFileContext();
  const [csvFiles, setCsvFiles] = useState<CsvFile[]>([]);

  // Find all CSV files
  useEffect(() => {
    if (files) {
      const fileArray = Array.from(files);
      const csvs = fileArray
        .filter(file => file.name.endsWith('.csv'))
        .map(file => ({
          name: file.name,
          path: URL.createObjectURL(file)
        }));
      setCsvFiles(csvs);
    }
  }, [files]);

  return (
    <VStack spacing={4} align="stretch" width="100%">
      {csvFiles.map((csv) => (
        <Box key={csv.name} width="100%">
          <Flex direction="column" gap={2}>
            <Flex justifyContent="flex-end">
              <Button
                size="sm"
                leftIcon={<ExternalLinkIcon />}
                onClick={() => {
                  const params = new URLSearchParams({
                    currentTime: currentTime?.toString() || '0',
                    videoStartTime: videoStartTime?.toString() || '',
                    csvName: csv.name,
                    csvPath: csv.path
                  });
                  const newWindow = window.open(`/SingleGraphPage?${params.toString()}`);
                  if (newWindow) {
                    // Send initial file data
                    newWindow.postMessage({
                      type: 'SINGLE_FILE_STATE',
                      file: {
                        name: csv.name,
                        path: csv.path
                      }
                    }, '*');
                    
                    // Setup time sync
                    const interval = setInterval(() => {
                      if (currentTime !== undefined && videoStartTime !== undefined) {
                        newWindow.postMessage({
                          type: 'TIME_UPDATE',
                          currentTime,
                          videoStartTime
                        }, '*');
                      }
                    }, 100);

                    // Cleanup interval when window closes
                    newWindow.addEventListener('unload', () => {
                      clearInterval(interval);
                    });
                  }
                }}
              >
                View Graph
              </Button>
            </Flex>
            <Graph 
              xAxisName="Time" 
              yAxisName={csv.name.replace('.csv', '')}
              currentTime={currentTime}
              videoStartTime={videoStartTime}
              csvPath={csv.path}
            />
          </Flex>
        </Box>
      ))}
    </VStack>
  );
}