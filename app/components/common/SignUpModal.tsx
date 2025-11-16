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
    VStack,
} from "@chakra-ui/react";
import { FaEnvelope, FaLock, FaUserNinja, FaUserSecret } from "react-icons/fa";
import { SocialLogin } from "./SocialLogin";

interface SignUpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
    return (
        <DialogRoot open={isOpen} onOpenChange={(e) => { if (!e.open) onClose(); }}>
            <DialogBackdrop />
            <DialogContent>
                <DialogHeader>Sign up</DialogHeader>
                <CloseButton position="absolute" top="3" insetEnd="3" onClick={onClose} />
                <DialogBody>
                    <VStack>
                        <Box position="relative" w="100%">
                            <Input pl="10" variant="outline" placeholder="Name" />
                            <Box
                                position="absolute"
                                insetY="0"
                                left="3"
                                display="flex"
                                alignItems="center"
                                color="gray.300"
                                pointerEvents="none"
                            >
                                <FaUserSecret size={18} />
                            </Box>
                        </Box>
                        <Box position="relative" w="100%">
                            <Input pl="10" variant="outline" placeholder="Email" type="email" />
                            <Box
                                position="absolute"
                                insetY="0"
                                left="3"
                                display="flex"
                                alignItems="center"
                                color="gray.300"
                                pointerEvents="none"
                            >
                                <FaEnvelope size={18} />
                            </Box>
                        </Box>
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
                                <FaUserNinja size={18} />
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
                        <Button mt={1} colorPalette="red" w="100%" onClick={onClose}>
                            Sign up
                        </Button>
                        <SocialLogin />
                    </VStack>
                </DialogBody>
                <DialogFooter />
            </DialogContent>
        </DialogRoot>
    );
}


