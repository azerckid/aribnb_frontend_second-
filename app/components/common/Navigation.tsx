import { Box, Button, Container, HStack, IconButton, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";
import { FaMoon, FaSun } from "react-icons/fa";

interface NavigationProps {
    onLoginClick?: () => void;
    onSignUpClick?: () => void;
    appearance?: "light" | "dark";
    onToggleAppearance?: () => void;
}

export function Navigation({ onLoginClick, onSignUpClick, appearance = "light", onToggleAppearance }: NavigationProps) {
    return (
        <Box as="header" borderBottomWidth="1px" bg="bg">
            <Container maxW="7xl" py={4} >
                <Stack
                    justifyContent="space-between"
                    alignItems="center"
                    direction={{ sm: "column", md: "row" }}
                    gap={{ sm: 4, md: 0 }}
                >
                    <Button asChild variant="ghost" colorPalette="red">
                        <RouterLink to="/">
                            <HStack gap={2}>
                                <Text fontWeight="bold">Guest House Booking</Text>
                            </HStack>
                        </RouterLink>
                    </Button>
                    <HStack gap={2}>
                        {onToggleAppearance && (
                            <IconButton
                                aria-label="Toggle color mode"
                                variant="ghost"
                                onClick={onToggleAppearance}
                            >
                                {appearance === "dark" ? <FaSun /> : <FaMoon />}
                            </IconButton>
                        )}
                        <Button variant="ghost" onClick={onLoginClick}>Log in</Button>
                        <Button colorPalette="red" onClick={onSignUpClick}>Sign up</Button>
                    </HStack>
                </Stack>
            </Container>
        </Box>
    );
}


