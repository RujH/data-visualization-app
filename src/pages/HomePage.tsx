import { Box, Stack, Text, Flex, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import React, {useState,  useEffect, useRef,  } from 'react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { useFileContext } from '../FileContext';

export default function HomePage() {
  const { files, setFiles } = useFileContext(); 
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputError, setInputError] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute('webkitdirectory', 'true');
    }
  }, []);

  const handleFolderSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      console.log("homepage",files)
      setFiles(files)
      setInputError(false);
    }
  };

  const handleNextButtonClick = () => {
    if (files) {
      navigate('/SettingPage', { state: { files } });
    } else {
      console.error("No files selected.");
      setInputError(true);
    }
  };

  return (
    <Stack
      spacing={4}           
      align="center"       
      justify="center"     
      h="90vh"             
      p={4}
      overflow="hidden"
    >
      <div className='backgroundShap' style={{ height: '100vh', overflow: 'hidden' }}>
        <Box
          w="100%"
          maxW="500px"
          mx="auto"
          mt="10vh"
        >
          <div className="rounded-box">
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={6}
              gap={4}
            >
              <Text fontWeight="bold" fontSize="xl" mb={4}>Upload Folder</Text>
              <Box w="100%">
                <div className="form-group">
                  <label htmlFor="sessionInput" className="form-label">Session Data: </label>
                  <input
                    id="file-picker"
                    ref={inputRef}
                    type="file"
                    onChange={handleFolderSelection}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      border: inputError ? '2px solid red' : '1px solid #e2e8f0',
                      outline: 'none',
                      marginTop: '8px'
                    }}
                  />
                </div>
              </Box>
            </Flex>
          </div>
        </Box>

        <Box
          position="fixed"
          bottom={4}
          left={4}
          width="100%"
          p={5} 
        >
          <Flex justifyContent="flex-end" alignItems="center" pt={10}>
            <Button 
              rightIcon={<ChevronRightIcon />} 
              mr={5} 
              colorScheme='green' 
              onClick={handleNextButtonClick}
            >
              Next
            </Button>
          </Flex>
        </Box>
      </div>
    </Stack> 
  );
}