import Graph from "../../components/Graph";
import { Box, VStack, Button, Flex } from "@chakra-ui/react";
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useFileContext } from '../../FileContext';
import { useEffect, useState, useRef, useCallback } from 'react';

interface GraphsColumnProps {
  currentTime?: number;
  videoStartTime?: number;
}

interface CsvFile {
  name: string;
  path: string;
}

interface WindowMessage {
  type: string;
  [key: string]: any;
}

interface WindowState {
  window: Window;
  isReady: boolean;
}

type GraphWindowMessage = {
  type: 'GRAPH_WINDOW_READY';
} | {
  type: 'GRAPH_STATE_UPDATED';
};

export default function GraphsColumn({ currentTime, videoStartTime }: GraphsColumnProps) {
  const { files } = useFileContext();
  const [csvFiles, setCsvFiles] = useState<CsvFile[]>([]);
  // Track window references and their ready state
  const openWindowsRef = useRef<WindowState[]>([]);

  // Send time update to a specific window
  const sendTimeUpdate = useCallback((targetWindow: Window) => {
    if (currentTime === undefined || videoStartTime === undefined) return;
    
    try {
      targetWindow.postMessage({
        type: 'TIME_UPDATE',
        currentTime,
        videoStartTime
      }, '*');
      return true;
    } catch (error) {
      console.error('Failed to send time update:', error);
      return false;
    }
  }, [currentTime, videoStartTime]);

  // Handle messages from graph windows
  useEffect(() => {
    const handleMessage = (event: MessageEvent<GraphWindowMessage>) => {
      if (event.data.type === 'GRAPH_WINDOW_READY') {
        const sourceWindow = event.source as Window;
        
        // Update window ready state and send initial time
        openWindowsRef.current = openWindowsRef.current.map(w => {
          if (w.window === sourceWindow) {
            sendTimeUpdate(sourceWindow);
            return { ...w, isReady: true };
          }
          return w;
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sendTimeUpdate]);

  // Update all windows when time changes
  useEffect(() => {
    if (currentTime === undefined || videoStartTime === undefined) return;

    // Clean up closed windows and update remaining ones
    openWindowsRef.current = openWindowsRef.current.filter(({ window, isReady }) => {
      if (!window || window.closed) return false;
      if (isReady) {
        return sendTimeUpdate(window);
      }
      return true;
    });
  }, [currentTime, videoStartTime, sendTimeUpdate]);

  // Periodic window updates
  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (currentTime === undefined || videoStartTime === undefined) return;

      openWindowsRef.current = openWindowsRef.current.filter(({ window, isReady }) => {
        if (!window || window.closed) return false;
        if (isReady) {
          return sendTimeUpdate(window);
        }
        return true;
      });
    }, 33); // ~30fps updates

    return () => clearInterval(updateInterval);
  }, [currentTime, videoStartTime, sendTimeUpdate]);

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
                  const newWindow = window.open(`/data-visualization-app/SingleGraphPage?${params.toString()}`);
                  if (newWindow) {
                    try {
                      // Send initial file data
                      newWindow.postMessage({
                        type: 'SINGLE_FILE_STATE',
                        file: {
                          name: csv.name,
                          path: csv.path
                        }
                      }, '*');
                      
                      // Store window reference with ready state
                      openWindowsRef.current.push({
                        window: newWindow,
                        isReady: false
                      });

                      // Send current time immediately
                      if (currentTime !== undefined && videoStartTime !== undefined) {
                        sendTimeUpdate(newWindow);
                      }
                    } catch (error) {
                      console.error('Failed to initialize graph window:', error);
                    }
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