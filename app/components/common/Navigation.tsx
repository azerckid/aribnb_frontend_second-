import { Box, Button, Container, HStack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";

interface NavigationProps {
    onLoginClick?: () => void;
    onSignUpClick?: () => void;
}

export function Navigation({ onLoginClick, onSignUpClick }: NavigationProps) {
    return (
        <Box as="header" borderBottomWidth="1px" bg="bg">
            <Container maxW="7xl" py={4}>
                <HStack justifyContent="space-between">
                    <Button asChild variant="ghost" colorPalette="red">
                        <RouterLink to="/">
                            <HStack gap={2}>
                                <Text fontWeight="bold">Guest House Booking</Text>
                            </HStack>
                        </RouterLink>
                    </Button>
                    <HStack gap={2}>
                        <Button variant="ghost" onClick={onLoginClick}>Log in</Button>
                        <Button colorPalette="red" onClick={onSignUpClick}>Sign up</Button>
                    </HStack>
                </HStack>
            </Container>
        </Box>
    );
}


