import { 
    Box, 
    Stack, 
    Flex, 
    Input, 
    Text, 
    Button, 
    useDisclosure, 
    ButtonGroup, 
    Modal, 
    ModalOverlay, 
    ModalContent, 
    ModalHeader,
    ModalCloseButton, 
    ModalBody, 
    ModalFooter,
    Divider,
    VStack,
    Badge,
    Tooltip,
    useToast,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton
} from '@chakra-ui/react';
import { useRef, useState, useEffect } from 'react';
import { AddIcon, DeleteIcon, AttachmentIcon } from '@chakra-ui/icons';
import CreateObservationModal, { Observation } from '../../components/CreateObservationModal';

interface ButtonsColumnProps {
    currentTime: number;
    isPlaying: boolean;
    maxDuration: number;
    onTimeUpdate: (time: number) => void;
    onPlayPause: () => void;
    onSkip: (seconds: number) => void;
    onGoToTime: (hours: number, minutes: number, seconds: number) => void;
    initialObservations?: Observation[];
}

interface ObservationLog {
    id: string;
    observationId: string;
    observationName: string;
    observationType: string;
    timestamp: number;
    videoTimeStart: number;
    videoTimeEnd?: number;
    isActive?: boolean;
}

interface ImportedObservation {
    id: string;
    name: string;
    type: 'Point' | 'Duration';
    description: string;
}

export default function ButtonsColumn({
    currentTime,
    isPlaying,
    maxDuration,
    onTimeUpdate,
    onPlayPause,
    onSkip,
    onGoToTime,
    initialObservations = []
}: ButtonsColumnProps) {
    const { isOpen: isEndSessionModalOpen, onOpen: onEndSessionModalOpen, onClose: onEndSessionModalClose } = useDisclosure();
    const { isOpen: isAddObeservationModalOpen, onOpen: onAddObeservationModalOpen, onClose: onAddObeservationModalClose } = useDisclosure();

    const initialRef = useRef(null);
    const finalRef = useRef(null);
    const historyContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [hours, setHours] = useState("00");
    const [minutes, setMinutes] = useState("00");
    const [seconds, setSeconds] = useState("00");
    const [observations, setObservations] = useState<Observation[]>(initialObservations);
    const [activeObservations, setActiveObservations] = useState<{ [key: string]: boolean }>({});
    const [observationLogs, setObservationLogs] = useState<ObservationLog[]>([]);
    const toast = useToast();

    useEffect(() => {
        if (initialObservations.length > 0) {
            setObservations(initialObservations);
        }
    }, [initialObservations]);

    useEffect(() => {
        if (historyContainerRef.current) {
            historyContainerRef.current.scrollTop = historyContainerRef.current.scrollHeight;
        }
    }, [observationLogs]);

    const formatTime = (timeInSeconds: number): string => {
        const hrs = Math.floor(timeInSeconds / 3600);
        const mins = Math.floor((timeInSeconds % 3600) / 60);
        const secs = Math.floor(timeInSeconds % 60);
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const parseTimeString = (timeStr: string): number => {
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };

    const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim());
            // Skip header line but verify it exists
            if (lines.length < 2) {
                toast({
                    title: 'Import Failed',
                    description: 'Invalid CSV format: file is empty or missing header',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            // Create a map of existing observations
            const existingObservations = new Map(observations.map(obs => [obs.id, obs]));
            const newObservations = new Set<ImportedObservation>();
            const importedLogs: ObservationLog[] = [];

            // Process each line (skip header)
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',');
                if (values.length < 5) continue; // Skip invalid lines

                const observationId = values[0];
                const observationName = values[1].replace(/^"|"$/g, ''); // Remove quotes
                const observationType = values[2] as 'Point' | 'Duration';
                const timestamp = new Date(values[3]).getTime();
                const startTime = parseTimeString(values[4]);
                const endTime = values[5] ? parseTimeString(values[5]) : undefined;

                // If observation doesn't exist, add it to the set of new observations
                if (!existingObservations.has(observationId)) {
                    newObservations.add({
                        id: observationId,
                        name: observationName,
                        type: observationType,
                        description: `Imported ${observationType} observation`
                    });
                }

                // Create log entry
                importedLogs.push({
                    id: `${Date.now()}-${Math.random()}`,
                    observationId,
                    observationName,
                    observationType,
                    timestamp,
                    videoTimeStart: startTime,
                    videoTimeEnd: endTime,
                    isActive: false
                });
            }

            // Add new observations
            const newObservationsArray: Observation[] = Array.from(newObservations).map(obs => ({
                id: obs.id,
                name: obs.name,
                type: obs.type,
                description: obs.description
            }));
            setObservations(prev => [...prev, ...newObservationsArray]);

            // Add imported logs
            setObservationLogs(prev => [...prev, ...importedLogs]);

            toast({
                title: 'Import Successful',
                description: `Imported ${importedLogs.length} observations and created ${newObservations.size} new buttons`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        };

        reader.onerror = () => {
            toast({
                title: 'Import Failed',
                description: 'Failed to read the CSV file',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        };

        reader.readAsText(file);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value) * maxDuration;
        onTimeUpdate(newTime);
    };

    const handleGoToTime = () => {
        onGoToTime(
            parseInt(hours) || 0,
            parseInt(minutes) || 0,
            parseInt(seconds) || 0
        );
    };

    const handleSaveObservation = (observation: Observation) => {
        setObservations(prev => [...prev, observation]);
    };

    const handleDeleteEntry = (logId: string) => {
        setObservationLogs(prev => {
            const log = prev.find(l => l.id === logId);
            if (log?.isActive) {
                setActiveObservations(prev => ({
                    ...prev,
                    [log.observationId]: false
                }));
            }
            return prev.filter(l => l.id !== logId);
        });
        toast({
            title: 'Entry Deleted',
            description: 'Observation log entry has been removed',
            status: 'info',
            duration: 2000,
            isClosable: true,
        });
    };

    const handleObservationClick = (observation: Observation) => {
        if (observation.type === 'Point') {
            const newLog: ObservationLog = {
                id: `${Date.now()}-${Math.random()}`,
                observationId: observation.id,
                observationName: observation.name,
                observationType: observation.type,
                timestamp: Date.now(),
                videoTimeStart: currentTime
            };
            setObservationLogs(prev => [...prev, newLog]);
            toast({
                title: 'Point Logged',
                description: `${observation.name} logged at ${formatTime(currentTime)}`,
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
        } else {
            const isCurrentlyActive = activeObservations[observation.id];
            
            if (!isCurrentlyActive) {
                const newLog: ObservationLog = {
                    id: `${Date.now()}-${Math.random()}`,
                    observationId: observation.id,
                    observationName: observation.name,
                    observationType: observation.type,
                    timestamp: Date.now(),
                    videoTimeStart: currentTime,
                    isActive: true
                };
                setObservationLogs(prev => [...prev, newLog]);
                setActiveObservations(prev => ({ ...prev, [observation.id]: true }));
                toast({
                    title: 'Duration Started',
                    description: `${observation.name} started at ${formatTime(currentTime)}`,
                    status: 'info',
                    duration: 2000,
                    isClosable: true,
                });
            } else {
                setObservationLogs(prev => prev.map(log => 
                    log.observationId === observation.id && log.isActive
                        ? { ...log, videoTimeEnd: currentTime, isActive: false }
                        : log
                ));
                setActiveObservations(prev => ({ ...prev, [observation.id]: false }));
                toast({
                    title: 'Duration Ended',
                    description: `${observation.name} ended at ${formatTime(currentTime)}`,
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                });
            }
        }
    };

    const handleDeleteAll = () => {
        setObservationLogs([]);
        setActiveObservations({});
        toast({
            title: 'History Cleared',
            description: 'All observation logs have been cleared',
            status: 'info',
            duration: 2000,
            isClosable: true,
        });
    };

    const exportToCSV = () => {
        const headers = ['Observation ID', 'Observation Name', 'Type', 'Timestamp', 'Start Time', 'End Time', 'Duration'];
        const csvContent = [
            headers.join(','),
            ...observationLogs.map(log => [
                log.observationId,
                `"${log.observationName}"`,
                log.observationType,
                new Date(log.timestamp).toISOString(),
                formatTime(log.videoTimeStart),
                log.videoTimeEnd ? formatTime(log.videoTimeEnd) : '',
                log.videoTimeEnd ? formatTime(log.videoTimeEnd - log.videoTimeStart) : ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `observation_logs_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleEndSession = () => {
        exportToCSV();
        onEndSessionModalClose();
    };

    return (
        <Box w='100%' p={4} bg="gray.100" style={{ borderRadius: '8px', padding: '8px', outline: 'none' }}>
            <Stack alignItems="center" spacing={4}>
                <input
                    className="scrubber"
                    type="range"
                    min="0"
                    max="1"
                    step="0.001"
                    value={maxDuration > 0 ? currentTime / maxDuration : 0}
                    onChange={handleScrubberChange}
                    style={{ width: '400px' }}
                />

                <span className="current-time">{`Current Time: ${formatTime(currentTime)}`}</span>

                <Flex align="center">
                    <label>Enter time to go to (HH:MM:SS): </label>
                    <Input
                        size='xs'
                        htmlSize={4}
                        width='auto'
                        mr={2}
                        ml={2}
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                    />
                    <span> : </span>
                    <Input
                        size='xs'
                        htmlSize={4}
                        width='auto'
                        mr={2}
                        ml={2}
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                    />
                    <span> : </span>
                    <Input
                        size='xs'
                        htmlSize={4}
                        width='auto'
                        mr={2}
                        ml={2}
                        value={seconds}
                        onChange={(e) => setSeconds(e.target.value)}
                    />
                    <Button size='sm' onClick={handleGoToTime}>Go To</Button>
                </Flex>

                <ButtonGroup gap='2'>
                    <Button size='sm' onClick={() => onSkip(-10)}>-10 Sec</Button>
                    <Button size='sm' onClick={onPlayPause}>{isPlaying ? 'Pause' : 'Play'}</Button>
                    <Button size='sm' onClick={() => onSkip(10)}>+10 Sec</Button>
                </ButtonGroup>

                <Box mt={2}>
                    <Button leftIcon={<AddIcon />} onClick={onAddObeservationModalOpen} size="sm">Add Observation</Button>
                    <CreateObservationModal
                        initialRef={initialRef}
                        finalRef={finalRef}
                        isOpen={isAddObeservationModalOpen}
                        onClose={onAddObeservationModalClose}
                        onSave={handleSaveObservation}
                    />
                </Box>

                {observations.length > 0 && (
                    <VStack mt={4} spacing={2} align="stretch" width="100%">
                        <Divider />
                        <Text fontWeight="bold">Observation Buttons:</Text>
                        <Flex wrap="wrap" gap={2}>
                            {observations.map(observation => (
                                <Tooltip 
                                    key={observation.id}
                                    label={observation.description || 'No description'}
                                    placement="top"
                                >
                                    <Box>
                                        <Button
                                            size="sm"
                                            onClick={() => handleObservationClick(observation)}
                                            colorScheme={activeObservations[observation.id] ? "green" : "blue"}
                                            width="auto"
                                            minW="120px"
                                            maxW="200px"
                                        >
                                            {observation.name}
                                            <Badge ml={2} colorScheme={observation.type === 'Duration' ? "purple" : "green"}>
                                                {observation.type === 'Duration' ? 
                                                    (activeObservations[observation.id] ? "Recording..." : "Duration") : 
                                                    "Point"
                                                }
                                            </Badge>
                                        </Button>
                                    </Box>
                                </Tooltip>
                            ))}
                        </Flex>
                    </VStack>
                )}

                {observationLogs.length > 0 && (
                    <Box width="100%" overflowX="auto">
                        <Text fontWeight="bold" mb={2}>Observation History:</Text>
                        <Box 
                            ref={historyContainerRef}
                            maxHeight="200px" 
                            overflowY="auto" 
                            borderWidth={1} 
                            borderRadius="md"
                            sx={{
                                '&::-webkit-scrollbar': {
                                    width: '8px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                    borderRadius: '8px',
                                },
                            }}
                        >
                            <Table size="sm" variant="simple">
                                <Thead position="sticky" top={0} bg="white" zIndex={1}>
                                    <Tr>
                                        <Th>Name</Th>
                                        <Th>Type</Th>
                                        <Th>Start Time</Th>
                                        <Th>End Time</Th>
                                        <Th width="50px"></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {observationLogs.map((log) => (
                                        <Tr key={log.id}>
                                            <Td>{log.observationName}</Td>
                                            <Td>{log.observationType}</Td>
                                            <Td>{formatTime(log.videoTimeStart)}</Td>
                                            <Td>{log.videoTimeEnd ? formatTime(log.videoTimeEnd) : 
                                                (log.isActive ? "Recording..." : "-")}</Td>
                                            <Td>
                                                <IconButton
                                                    aria-label="Delete entry"
                                                    icon={<DeleteIcon />}
                                                    size="xs"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteEntry(log.id)}
                                                />
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </Box>
                )}

                <Box display="flex" alignItems="center" m={5}>
                    <Text fontWeight="bold" mr={2}>Import/Export: </Text>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleImportCSV}
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                    />
                    <ButtonGroup size="sm" spacing={2}>
                        <Button
                            leftIcon={<AttachmentIcon />}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Import CSV
                        </Button>
                        <Button onClick={exportToCSV}>Export CSV</Button>
                    </ButtonGroup>
                </Box>

                <Box m={5}>
                    <Stack alignItems="center">
                        <Text fontWeight="bold">Actions</Text>
                        <ButtonGroup size="sm">
                            <Button colorScheme="red" onClick={handleDeleteAll}>Clear History</Button>
                            <Button colorScheme="red" onClick={onEndSessionModalOpen}>End Session</Button>
                        </ButtonGroup>
                    </Stack>
                </Box>

                <Modal isOpen={isEndSessionModalOpen} onClose={onEndSessionModalClose} id="end-session-modal-id">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>End Session</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody alignSelf="center">
                            Are you sure? Your observation logs will be exported as CSV.
                        </ModalBody>
                        <ModalFooter width="100%" justifyContent="space-between" alignItems="center">
                            <Button size="sm" colorScheme='red' mr={3} onClick={handleEndSession}>End Session</Button>
                            <Button size="sm" colorScheme='blue' onClick={onEndSessionModalClose}>Cancel</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Stack>
        </Box>
    );
}