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
import { useRef, useState} from 'react';
import { AddIcon } from '@chakra-ui/icons'
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import CreateObservationModal from '../../components/CreateObservationModal';


export default function ButtonsColumn() {
    const { isOpen: isEndSessionModalOpen, onOpen:onEndSessionModalOpen, onClose: onEndSessionModalClose } = useDisclosure()
    const { isOpen:isAddObeservationModalOpen, onOpen:onAddObeservationModalOpen , onClose:onAddObeservationModalClose } = useDisclosure()

    const initialRef = useRef(null)
    const finalRef = useRef(null)

    const [fileUrls, setFileUrls] = useState<string[]>([]);

    // Handle multiple file uploads and store their URLs
    const handleChange = (info: { file: UploadFile }) => {
        const file = info.file;
        console.log("handle change ", info.file)
        // Check if the file is successfully uploaded
        if (file.status === 'done' && file.originFileObj) {
            // Create a URL for the single file
            const url = URL.createObjectURL(file.originFileObj as Blob);
            setFileUrls([url]); // Directly set the URL if state handles a single string
        }
   
    };
    const dummyRequest = ({ file, onSuccess }: any) => {
    setTimeout(() => {
        onSuccess("ok");
    }, 0);
    };

  return (
           
    <Box w='100%' p={4}  bg={"grey"} >
        <Stack alignItems={"center"}>
            <input className="scrubber" type="range" min="0" max="1" step="0.01" style={{ width: '400px' }} />

            {/* <span className="current-time">{`Current Time: ${Utils.secondsToHMS(currentTime.toFixed(2))}s`}</span> */}
            <span className="current-time">{`Current Time:  1:30:0s`}</span>

            <Flex align={"center"}>
                <label>Enter time to go to (HH:MM:SS): </label>
                <Input size='xs' htmlSize={4} width='auto' mr={2} ml={2}/>
                <span> : </span>
                <Input size='xs' htmlSize={4} width='auto' mr={2} ml={2}/>
                <span> : </span>
                <Input size='xs' htmlSize={4} width='auto' mr={2} ml={2}/>
                <Button size='sm'> Go To </Button>
            </Flex>

            <ButtonGroup gap='2'>
                <Button size='sm'> -10 Sec </Button>
                <Button size='sm'> Play </Button>
                <Button size='sm'> Pause </Button>
                <Button size='sm'> +10 Sec </Button>
            </ButtonGroup>

            <Box mt={2}>
                <Button leftIcon={<AddIcon />} onClick={onAddObeservationModalOpen} size={"sm"}>Add Oservation</Button>
                <CreateObservationModal 
                    initialRef={initialRef} 
                    finalRef= {finalRef} 
                    isOpen={isAddObeservationModalOpen} 
                    onClose={onAddObeservationModalClose}
                />
            </Box>

            <Box display="flex" alignItems="center" m={5}>
                <Text fontWeight={"bold"} mr={2}>Import Coding History: </Text>
                <Upload customRequest={dummyRequest} onChange={handleChange}>
                    <Button leftIcon={<UploadOutlined/>} size={"sm"}>Click to Upload</Button>
                </Upload>

            </Box>
            
            <Box m={10}>
                <Stack alignItems={"center"}>
                    <Text fontWeight={"bold"}> Coding History</Text>
                    <Button mt={4} size= "xs" bg={"red"} color={"white"} onClick={onEndSessionModalOpen}>Delete All</Button>
                    <Button size= "xs"> Export as CSV</Button>

                </Stack>
            
            </Box>


            <Button size={"md"} bg={"red"} color={"white"} onClick={onEndSessionModalOpen}>End Session</Button>


            <Modal isOpen={isEndSessionModalOpen} onClose={onEndSessionModalClose} id="end-session-modal-id">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader></ModalHeader>
                    <ModalCloseButton />
                    <ModalBody alignSelf={"center"}> Are you sure? </ModalBody>
                        <ModalFooter width="100%" justifyContent="space-between" alignItems="center">
                        <Button size= {"sm"} colorScheme='red' mr={3} onClick={onEndSessionModalClose}>End Session</Button>
                        <Button size= {"sm"}  colorScheme='blue' onClick={onEndSessionModalClose}>Cancel</Button>
                    </ModalFooter>

                </ModalContent>
            </Modal>
        </Stack>
        
     </Box>
)}