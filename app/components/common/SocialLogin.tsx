import { Box, Button, HStack, Separator, Text, VStack } from "@chakra-ui/react";
import { FaComment, FaGithub } from "react-icons/fa";

export function SocialLogin() {
    return (
        <Box mb={4}>
            <HStack mt={2} mb={5} w="100%">
                <Separator flex="1" />
                <Text textTransform={"uppercase"} color="fg.muted" fontSize="xs" as="b">
                    Or
                </Text>
                <Separator flex="1" />
            </HStack>
            <VStack>
                <Button w="100%">
                    <HStack gap={2}>
                        <FaGithub />
                        <Text>Continue with GitHub</Text>
                    </HStack>
                </Button>
                <Button w="100%" colorPalette="yellow">
                    <HStack gap={2}>
                        <FaComment />
                        <Text>Continue with Kakao</Text>
                    </HStack>
                </Button>
            </VStack>
        </Box>
    );
}


