import { Box } from "@chakra-ui/react";
import type React from "react";
import { useLocation } from "react-router";

interface AppLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  fullBleed?: boolean;
  contentMaxW?: string | number;
  contentPx?: any;
}

export function AppLayout({
  header,
  children,
  footer,
  fullBleed = false,
  contentMaxW = "1280px",
  contentPx = { base: 4, md: 6 },
}: AppLayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <Box minH="100dvh" display="flex" flexDir="column">
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex="sticky"
        bg="bg"
      >
        {header}
      </Box>
      <Box as="main" flex="1" pb={isHome ? { base: 0, md: 24 } : 0}>
        {fullBleed ? (
          children
        ) : (
          <Box maxW={contentMaxW} mx="auto" px={contentPx}>
            {children}
          </Box>
        )}
      </Box>
      <Box
        as="footer"
        display={isHome ? { base: "none", md: "block" } : "block"}
        position={isHome ? { base: "static", md: "fixed" } : "static"}
        bottom={isHome ? { md: 0 } : undefined}
        left={isHome ? { md: 0 } : undefined}
        right={isHome ? { md: 0 } : undefined}
      >
        {footer}
      </Box>
    </Box>
  );
}


