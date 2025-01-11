import { useRef, useState} from 'react';
import { 
  Box, 
  Stack, 
  Text, 
  Button, 
  Flex, 
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Container,
  VStack,
  HStack,
  Tooltip,
  Badge
} from '@chakra-ui/react';

import { 
  ChevronDownIcon,
  ChevronLeftIcon, 
  ChevronRightIcon, 
  AddIcon,
  SmallCloseIcon
} from '@chakra-ui/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import CreateObservationModal, { Observation } from '../components/CreateObservationModal';
import './SettingPage.css';

interface dataToChartMap {
  fileName: string;
  graphName: string;
  id: number;
}

export default function SettingPage() {
  const location = useLocation();
  const { files } = location.state as { files: FileList }; 
  const [dropdownMenu, setDropdownMenu] = useState<dataToChartMap[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [observations, setObservations] = useState<Observation[]>([]);

  const initialRef = useRef(null);
  const finalRef = useRef(null);

  const navigate = useNavigate();

  const handleClick = (action: string) => {
    if (action === "Back") {
      navigate('/');
    }
    else if (action === "Submit") {
      // Pass observations to DataPlatformPage
      navigate('/DataPlatformPage', { state: { observations } });
    }
  };

  const handleDropdownMenu = (fileName: string, graphName: string, id: number) => {
    const exists = dropdownMenu.some(item => item.id === id);
    if (exists) {
      setDropdownMenu(dropdownMenu.map(item => 
        item.id === id ? { ...item, graphName: graphName } : item
      ));
    } else {
      setDropdownMenu([...dropdownMenu, { fileName, graphName, id }]);
    }
  };

  const handleSaveObservation = (observation: Observation) => {
    setObservations(prev => [...prev, observation]);
  };

  const handleDeleteObservation = (observationId: string) => {
    setObservations(prev => prev.filter(obs => obs.id !== observationId));
  };

  return (
    <Container maxW="container.lg">
      <Stack
        spacing={10}           
        align="left"       
        h="50vh"             
      >
        {/* Select graph section */}
        <Box className="rounded-rectangle-box" p={5}>
          <Text mb={4} fontWeight="bold">Select Graph:</Text>
          {files && files.length > 0 ? (
            <Stack spacing={4}>
              {Array.from(files).map((file, index) =>
                file.webkitRelativePath.includes("Sensor") && !file.name.startsWith(".") ? (
                  <Flex key={index} align="center" justify="space-between">
                    <Text>{file.name}</Text>
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                      >
                        {dropdownMenu.length > 0 &&
                        dropdownMenu.find((item) => item.id === index)
                          ? dropdownMenu.find((item) => item.id === index)?.graphName
                          : "Graph Type"}
                      </MenuButton>
                      <MenuList>
                        <MenuItem onClick={() => handleDropdownMenu(file.name, "Line Graph", index)}>
                          Line Graph
                        </MenuItem>
                        <MenuItem onClick={() => handleDropdownMenu(file.name, "Bar Graph", index)}>
                          Bar Graph
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>
                ) : null
              )}
            </Stack>
          ) : (
            <Text>No files passed.</Text>
          )}
        </Box>

        <Box className="rounded-rectangle-box" p={5}>
          <Stack spacing={4} align="start">
            <Text fontWeight="bold">Select Observation Buttons:</Text>
            <Button leftIcon={<AddIcon />} onClick={onOpen}>
              Add Observation
            </Button>

            {observations.length > 0 && (
              <VStack spacing={2} align="stretch" width="100%" mt={4}>
                {observations.map(observation => (
                  <HStack key={observation.id} spacing={2}>
                    <Tooltip 
                      label={observation.description || 'No description'}
                      placement="top"
                    >
                      <Button
                        size="sm"
                        colorScheme="blue"
                        width="100%"
                      >
                        {observation.name}
                        <Badge ml={2} colorScheme="green">
                          {observation.type}
                        </Badge>
                      </Button>
                    </Tooltip>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDeleteObservation(observation.id)}
                    >
                      <SmallCloseIcon />
                    </Button>
                  </HStack>
                ))}
              </VStack>
            )}
          </Stack>

          <CreateObservationModal
            initialRef={initialRef}
            finalRef={finalRef}
            isOpen={isOpen}
            onClose={onClose}
            onSave={handleSaveObservation}
          />
        </Box>

        <Box position="fixed" bottom={4} left={4} width="100%" p={5}>
          <Flex justify="space-between" align="center">
            <Button leftIcon={<ChevronLeftIcon />} colorScheme="gray" onClick={() => handleClick("Back")}>
              Back
            </Button>
            <Button mr={5} rightIcon={<ChevronRightIcon />} colorScheme="green" onClick={() => handleClick("Submit")}>
              Submit
            </Button>
          </Flex>
        </Box>
      </Stack>
    </Container>
  );
}