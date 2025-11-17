import { useState } from "react";
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
import { FaEnvelope, FaLock, FaUserNinja, FaUserSecret } from "react-icons/fa";
import { SocialLogin } from "./SocialLogin";
import { signUp } from "~/utils/api";
import { toaster } from "~/components/ui/toaster";
import { signUpSchema } from "~/utils/validation";

interface SignUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSignUpSuccess?: () => void;
}

export function SignUpModal({ isOpen, onClose, onSignUpSuccess }: SignUpModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 입력값 검증
        const validationResult = signUpSchema.safeParse({ name, email, username, password });
        if (!validationResult.success) {
            const firstError = validationResult.error.issues[0];
            toaster.create({
                title: "입력 오류",
                description: firstError.message,
                type: "error",
                duration: 3000,
            });
            return;
        }

        setIsLoading(true);

        try {
            await signUp(name, email, username, password);
            toaster.create({
                title: "회원가입 성공",
                type: "success",
                duration: 2000,
            });
            onClose();
            setName("");
            setEmail("");
            setUsername("");
            setPassword("");
            onSignUpSuccess?.();
        } catch (error) {
            toaster.create({
                title: "회원가입 실패",
                description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
                type: "error",
                duration: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DialogRoot open={isOpen} placement="center" onOpenChange={(e) => { if (!e.open) onClose(); }}>
            <DialogBackdrop />
            <DialogPositioner>
                <DialogContent>
                    <DialogHeader>Sign up</DialogHeader>
                    <CloseButton position="absolute" top="3" insetEnd="3" onClick={onClose} />
                    <form onSubmit={handleSubmit}>
                        <DialogBody>
                            <VStack gap={4}>
                                <Box position="relative" w="100%">
                                    <Input
                                        pl="10"
                                        variant="outline"
                                        placeholder="Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
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
                                    <Input
                                        pl="10"
                                        variant="outline"
                                        placeholder="Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
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
                                    <Input
                                        pl="10"
                                        variant="outline"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
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
                                    <Input
                                        pl="10"
                                        variant="outline"
                                        placeholder="Password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
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
                            <Button
                                type="submit"
                                colorPalette="red"
                                w="100%"
                                loading={isLoading}
                            >
                                {isLoading ? "Signing up..." : "Sign up"}
                            </Button>
                        </DialogFooter>
                    </form>
                    <Box px={6}>
                        <SocialLogin />
                    </Box>
                </DialogContent>
            </DialogPositioner>
        </DialogRoot>
    );
}


