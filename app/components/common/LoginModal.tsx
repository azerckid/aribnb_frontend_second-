import {
  Box,
  Button,
  CloseButton,
  DialogBackdrop,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  Input,
  // InputElement,
  // InputGroup,
  VStack,
} from "@chakra-ui/react";
import { FaLock, FaUserNinja } from "react-icons/fa";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => { if (!e.open) onClose(); }}>
      <DialogBackdrop />
      <DialogContent>
        <DialogHeader>Log in</DialogHeader>
        <CloseButton position="absolute" top="3" insetEnd="3" onClick={onClose} />
        <DialogBody>
          <VStack>
            <Input variant="outline" placeholder="Username" />
            <Input variant="outline" placeholder="Password" type="password" />
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button colorPalette="red" w="100%" onClick={onClose}>
            Log in
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}


