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
  Flex
} from '@chakra-ui/react'
import { 
  SmallCloseIcon,
  CheckIcon,
  ChevronDownIcon
} from '@chakra-ui/icons'

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react'

interface CreateObservationModalProps {
  initialRef: React.RefObject<any>;
  finalRef: React.RefObject<any>;
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateObservationModal(props: CreateObservationModalProps) {
  return (

    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      id = "create-observation-modal-id"
    >
      <ModalOverlay />
      <ModalContent>

        <ModalHeader>Create Observation Button</ModalHeader>

        <ModalCloseButton />

        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input ref={props.initialRef} placeholder='Button name' />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Description</FormLabel>
            <Input placeholder='Button description' />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Type</FormLabel>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                Catagory
              </MenuButton>
              <MenuList>
                <MenuItem>Duration</MenuItem>
                <MenuItem>Point</MenuItem>
              </MenuList>
            </Menu>

          </FormControl>

        </ModalBody>


        <ModalFooter >
          <Flex width="100%" justifyContent="space-between" alignItems="center">
            <Button leftIcon={<SmallCloseIcon />} onClick={props.onClose}>
              Cancel
            </Button>
            {/*TODO: add save functionality */}
            <Button rightIcon={<CheckIcon />} colorScheme='green' onClick={props.onClose}>
              Save
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>

    </Modal>

)
}
