import { Avatar, Box, Button, Container, HStack, IconButton, Menu, Portal, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";
import { FaMoon, FaSun } from "react-icons/fa";
import type { IUser } from "~/types";

interface NavigationProps {
    user: IUser | null;
    isLoggedIn: boolean;
    onLoginClick?: () => void;
    onSignUpClick?: () => void;
    onLogoutSuccess?: () => void;
    appearance?: "light" | "dark";
    onToggleAppearance?: () => void;
}

export function Navigation({ user, isLoggedIn, onLoginClick, onSignUpClick, onLogoutSuccess, appearance = "light", onToggleAppearance }: NavigationProps) {
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
                        {!isLoggedIn ? (
                            <>
                                <Button variant="ghost" onClick={onLoginClick}>Log in</Button>
                                <Button colorPalette="red" onClick={onSignUpClick}>Sign up</Button>
                            </>
                        ) : (
                            <Menu.Root positioning={{ placement: "bottom-end" }}>
                                <Menu.Trigger asChild>
                                    <Button variant="ghost" p={0}>
                                        <Avatar.Root size="md">
                                            <Avatar.Image src={user?.avatar || ""} alt={user?.name || "User"} />
                                            <Avatar.Fallback name={user?.name || "User"} />
                                        </Avatar.Root>
                                    </Button>
                                </Menu.Trigger>
                                <Menu.Positioner>
                                    <Menu.Content>
                                        <Menu.Item value="logout" onClick={onLogoutSuccess}>
                                            Log out
                                        </Menu.Item>
                                    </Menu.Content>
                                </Menu.Positioner>
                            </Menu.Root>
                        )}
                    </HStack>
                </Stack>
            </Container>
        </Box>
    );
}


