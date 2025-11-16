import { Box, Container, Text } from "@chakra-ui/react";
import type React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <Box minH="100dvh" display="flex" flexDir="column">
      <Box as="main" flex="1">
        {children}
      </Box>
      <Box as="footer" borderTopWidth="1px" bg="bg" py={6}>
        <Container maxW="7xl">
          <Text color="fg.muted" fontSize="sm">
            © {new Date().getFullYear()} Airbnb Clone. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  );
}


