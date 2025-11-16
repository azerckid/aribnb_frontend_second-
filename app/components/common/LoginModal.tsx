import {
    Box,
    Button,
    CloseButton,
    DialogBackdrop,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogPositioner,
    DialogRoot,
    Input,
    VStack,
} from "@chakra-ui/react";
import { FaUserNinja, FaLock } from "react-icons/fa";
import { SocialLogin } from "./SocialLogin";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    return (
        <DialogRoot open={isOpen} placement="center" onOpenChange={(e) => { if (!e.open) onClose(); }}>
            <DialogBackdrop />
            <DialogPositioner>
                <DialogContent>
                    <DialogHeader>Log in</DialogHeader>
                    <CloseButton position="absolute" top="3" insetEnd="3" onClick={onClose} />
                    <DialogBody>
                        <VStack>
                            <Box position="relative" w="100%">
                                <Input pl="10" variant="outline" placeholder="Username" />
                                <Box
                                    position="absolute"
                                    insetY="0"
                                    left="3"
                                    display="flex"
                                    alignItems="center"
                                    color="gray.300"
                                    pointerEvents="none"
                                >
                                    <FaUserNinja size={20} />
                                </Box>
                            </Box>
                            <Box position="relative" w="100%">
                                <Input pl="10" variant="outline" placeholder="Password" type="password" />
                                <Box
                                    position="absolute"
                                    insetY="0"
                                    left="3"
                                    display="flex"
                                    alignItems="center"
                                    color="gray.300"
                                    pointerEvents="none"
                                >
                                    <FaLock size={18} />
                                </Box>
                            </Box>
                        </VStack>
                    </DialogBody>
                    <DialogFooter>
                        <Button colorPalette="red" w="100%" onClick={onClose}>
                            Log in
                        </Button>
                    </DialogFooter>
                    <Box px={6}>
                        <SocialLogin />
                    </Box>
                </DialogContent>
            </DialogPositioner>
        </DialogRoot>
    );
}


