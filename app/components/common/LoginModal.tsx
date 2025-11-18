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
import { FaUserNinja, FaLock } from "react-icons/fa";
import { SocialLogin } from "./SocialLogin";
import { login } from "~/utils/api";
import { toaster } from "~/components/ui/toaster";
import { loginSchema } from "~/utils/validation";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess?: () => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 입력값 검증
        const validationResult = loginSchema.safeParse({ username, password });
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
            await login(username, password);
            
            // 폼 초기화
            setUsername("");
            setPassword("");
            
            // 모달 먼저 닫기
            onClose();
            
            // 모달이 완전히 닫힌 후 토스트 생성 (모달의 DOM 변경이 토스트에 영향을 주지 않도록)
            setTimeout(() => {
                toaster.create({
                    title: "로그인 성공",
                    type: "success",
                    duration: 5000,
                });
                
                // 충분한 지연 후 revalidate (토스트가 보이도록, 쿠키가 설정될 시간도 확보)
                setTimeout(() => {
                    onLoginSuccess?.();
                }, 500);
            }, 200);
        } catch (error) {
            let errorMessage = "알 수 없는 오류가 발생했습니다.";

            if (error instanceof Error) {
                // 서버 에러 메시지 파싱
                try {
                    const errorText = error.message;
                    if (errorText.includes("Invalid credentials") || errorText.includes("자격 인증")) {
                        errorMessage = "아이디 또는 비밀번호가 올바르지 않습니다.";
                    } else if (errorText.includes("401") || errorText.includes("Unauthorized")) {
                        errorMessage = "인증에 실패했습니다. 아이디와 비밀번호를 확인해주세요.";
                    } else if (errorText.includes("403") || errorText.includes("Forbidden")) {
                        errorMessage = "접근 권한이 없습니다.";
                    } else if (errorText.includes("404") || errorText.includes("Not Found")) {
                        errorMessage = "요청한 페이지를 찾을 수 없습니다.";
                    } else if (errorText.includes("500") || errorText.includes("Internal Server")) {
                        errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
                    } else if (errorText.includes("Network") || errorText.includes("Failed to fetch")) {
                        errorMessage = "네트워크 연결을 확인해주세요.";
                    } else {
                        // JSON 파싱 시도
                        const jsonMatch = errorText.match(/\{.*\}/);
                        if (jsonMatch) {
                            const errorJson = JSON.parse(jsonMatch[0]);
                            if (errorJson.error === "Invalid credentials.") {
                                errorMessage = "아이디 또는 비밀번호가 올바르지 않습니다.";
                            } else if (errorJson.detail) {
                                errorMessage = errorJson.detail;
                            }
                        }
                    }
                } catch {
                    // 파싱 실패 시 기본 메시지 사용
                    errorMessage = "로그인에 실패했습니다. 다시 시도해주세요.";
                }
            }

            toaster.create({
                title: "로그인 실패",
                description: errorMessage,
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
                    <DialogHeader>Log in</DialogHeader>
                    <CloseButton position="absolute" top="3" insetEnd="3" onClick={onClose} />
                    <form onSubmit={handleSubmit}>
                        <DialogBody>
                            <VStack gap={4}>
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
                                        <FaUserNinja size={20} />
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
                                {isLoading ? "Logging in..." : "Log in"}
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


