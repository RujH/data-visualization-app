import { 
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  Flex,
  useToast
} from '@chakra-ui/react';
import { 
  SmallCloseIcon,
  CheckIcon,
  ChevronDownIcon
} from '@chakra-ui/icons';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import { useState } from 'react';

export interface Observation {
  id: string;
  name: string;
  description: string;
  type: 'Duration' | 'Point';
  timestamp?: number;
  duration?: number;
}

interface CreateObservationModalProps {
  initialRef: React.RefObject<any>;
  finalRef: React.RefObject<any>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (observation: Observation) => void;
}

export default function CreateObservationModal(props: CreateObservationModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'Duration' | 'Point'>('Point');
  const toast = useToast();

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name for the observation',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newObservation: Observation = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      type,
      timestamp: 0,
      duration: type === 'Duration' ? 0 : undefined
    };

    props.onSave(newObservation);
    props.onClose();
    
    // Reset form
    setName('');
    setDescription('');
    setType('Point');

    toast({
      title: 'Success',
      description: 'Observation button created successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      id="create-observation-modal-id"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Observation Button</ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input 
              ref={props.initialRef} 
              placeholder='Button name'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Description</FormLabel>
            <Input 
              placeholder='Button description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Type</FormLabel>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                {type}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setType('Duration')}>Duration</MenuItem>
                <MenuItem onClick={() => setType('Point')}>Point</MenuItem>
              </MenuList>
            </Menu>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Flex width="100%" justifyContent="space-between" alignItems="center">
            <Button leftIcon={<SmallCloseIcon />} onClick={props.onClose}>
              Cancel
            </Button>
            <Button rightIcon={<CheckIcon />} colorScheme='green' onClick={handleSave}>
              Save
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}