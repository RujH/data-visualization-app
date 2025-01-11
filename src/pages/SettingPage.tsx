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
  Container
} from '@chakra-ui/react'

import { 
  ChevronDownIcon,
  ChevronLeftIcon, 
  ChevronRightIcon, 
  AddIcon 
} from '@chakra-ui/icons'
import { useLocation, useNavigate } from 'react-router-dom';
import CreateObservationModal from '../components/CreateObservationModal';
import './SettingPage.css'

interface dataToChartMap {
  fileName : string,
  graphName: string,
  id: number
}

export default function SettingPage() {

  const location = useLocation();
  const { files } = location.state as { files: FileList }; 
  const [dropdownMenu, setDropdownMenu] = useState<dataToChartMap[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure()

  const initialRef = useRef(null)
  const finalRef = useRef(null)


  const navigate = useNavigate();

  const handleClick = (action:string) => {
    if (action=="Back"){
      navigate('/')
    }
    else if (action=="Submit"){
      navigate('/DataPlatformPage')
    }
    
  };
  const handleDropdownMenu = (fileName:string, graphName:string,  id: number) => {

    const exists = dropdownMenu.some(item => item.id === id);
    if (exists) {
      setDropdownMenu(dropdownMenu.map(item => 
        item.id === id ? { ...item, graphName:  graphName} : item
      ));

    } else {
      setDropdownMenu([...dropdownMenu, {fileName, graphName, id}]);
    }
    
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
          </Stack>
          <CreateObservationModal
            initialRef={initialRef}
            finalRef={finalRef}
            isOpen={isOpen}
            onClose={onClose}
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

  )
}
