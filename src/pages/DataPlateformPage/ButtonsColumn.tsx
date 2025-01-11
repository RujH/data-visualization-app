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
    ModalFooter 
} from '@chakra-ui/react';
import { Upload } from 'antd';
import { useRef, useState } from 'react';
import { AddIcon } from '@chakra-ui/icons';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import CreateObservationModal from '../../components/CreateObservationModal';

interface ButtonsColumnProps {
    currentTime: number;
    isPlaying: boolean;
    maxDuration: number;
    onTimeUpdate: (time: number) => void;
    onPlayPause: () => void;
    onSkip: (seconds: number) => void;
    onGoToTime: (hours: number, minutes: number, seconds: number) => void;
}

export default function ButtonsColumn({
    currentTime,
    isPlaying,
    maxDuration,
    onTimeUpdate,
    onPlayPause,
    onSkip,
    onGoToTime
}: ButtonsColumnProps) {
    const { isOpen: isEndSessionModalOpen, onOpen: onEndSessionModalOpen, onClose: onEndSessionModalClose } = useDisclosure();
    const { isOpen: isAddObeservationModalOpen, onOpen: onAddObeservationModalOpen, onClose: onAddObeservationModalClose } = useDisclosure();

    const initialRef = useRef(null);
    const finalRef = useRef(null);
    const [hours, setHours] = useState("00");
    const [minutes, setMinutes] = useState("00");
    const [seconds, setSeconds] = useState("00");

    const handleChange = (info: { file: UploadFile }) => {
        const file = info.file;
        if (file.status === 'done' && file.originFileObj) {
            URL.createObjectURL(file.originFileObj as Blob);
        }
    };

    const dummyRequest = ({ file, onSuccess }: any) => {
        setTimeout(() => {
            onSuccess("ok");
        }, 0);
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

    const formatTime = (timeInSeconds: number) => {
        const hrs = Math.floor(timeInSeconds / 3600);
        const mins = Math.floor((timeInSeconds % 3600) / 60);
        const secs = Math.floor(timeInSeconds % 60);
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Box w='100%' p={4} bg="gray.100" style={{ borderRadius: '8px', padding: '8px', outline: 'none' }}>
            <Stack alignItems="center">
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
                    />
                </Box>

                <Box display="flex" alignItems="center" m={5}>
                    <Text fontWeight="bold" mr={2}>Import Coding History: </Text>
                    <Upload customRequest={dummyRequest} onChange={handleChange}>
                        <Button leftIcon={<UploadOutlined />} size="sm">Click to Upload</Button>
                    </Upload>
                </Box>

                <Box m={10}>
                    <Stack alignItems="center">
                        <Text fontWeight="bold">Coding History</Text>
                        <Button mt={4} size="xs" colorScheme="red">Delete All</Button>
                        <Button size="xs">Export as CSV</Button>
                    </Stack>
                </Box>

                <Button size="md" colorScheme="red" onClick={onEndSessionModalOpen}>End Session</Button>

                <Modal isOpen={isEndSessionModalOpen} onClose={onEndSessionModalClose} id="end-session-modal-id">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader></ModalHeader>
                        <ModalCloseButton />
                        <ModalBody alignSelf="center">Are you sure?</ModalBody>
                        <ModalFooter width="100%" justifyContent="space-between" alignItems="center">
                            <Button size="sm" colorScheme='red' mr={3} onClick={onEndSessionModalClose}>End Session</Button>
                            <Button size="sm" colorScheme='blue' onClick={onEndSessionModalClose}>Cancel</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Stack>
        </Box>
    );
}