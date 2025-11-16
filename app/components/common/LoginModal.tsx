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
  HStack,
  Icon,
    Input,
    // InputElement,
    // InputGroup,
    VStack,
} from "@chakra-ui/react";
import { FaUser, FaLock } from "react-icons/fa";

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
            <HStack>
              <Icon color="fg.muted">
                <FaUser />
              </Icon>
              <Input variant="outline" placeholder="Username" />
            </HStack>
            <HStack>
              <Icon color="fg.muted">
                <FaLock />
              </Icon>
              <Input variant="outline" placeholder="Password" type="password" />
            </HStack>
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


