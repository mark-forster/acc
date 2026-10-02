import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Link,
  Menu,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink, NavLink } from "react-router-dom";

const links = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Faculties & Staff", to: "/faculties-staff" },
  { label: "Collaboration", to: "/collaboration" },
  { label: "News", to: "/news" },
  { label: "Programs", to: "/programs" },
  { label: "Contact", to: "/contact" },
];

function NavItem({ to, children, onClick }) {
  return (
    <Link
      as={NavLink}
      to={to}
      onClick={onClick}
      fontWeight="600"
      fontSize="sm"
      color="gray.700"
      _hover={{ color: "blue.600" }}
      _activeLink={{ color: "blue.600" }}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <Box
      position="sticky"
      top="0"
      zIndex="1000"
      bg="white"
      borderBottomWidth="1px"
      borderColor="gray.200"
      boxShadow="sm"
    >
      <Container maxW="1280px">
        <Flex minH="76px" align="center" justify="space-between">
          <Link as={RouterLink} to="/" onClick={() => setOpen(false)}>
            <HStack gap="3">
              <Box
                w="70px"
                h="70px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Box
                  as="img"
                  src="/acc_logo.png"
                  w="100%"
                  h="100%"
                  objectFit="contain"
                />
              </Box>
              <Box>
                <Text fontWeight="900" lineHeight="1">
                  ARAKKHA
                </Text>
                <Text fontSize="xs" color="gray.500" mt="1">
                  COMPUTER COLLAGE{" "}
                </Text>
              </Box>
            </HStack>
          </Link>

          <HStack display={{ base: "none", lg: "flex" }} gap="6">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/about">About Us</NavItem>

            <Menu.Root>
              <Menu.Trigger asChild>
                <Button variant="ghost" size="sm" fontWeight="600">
                  Academic ▾
                </Button>
              </Menu.Trigger>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item value="courses">
                    <Link as={RouterLink} to="/academic/courses" width="100%">
                      Courses
                    </Link>
                  </Menu.Item>
                  <Menu.Item value="students">
                    <Link as={RouterLink} to="/academic/students" width="100%">
                      Student Information
                    </Link>
                  </Menu.Item>
                  <Menu.Item value="entrance">
                    <Link
                      as={RouterLink}
                      to="/academic/entrance-list"
                      width="100%"
                    >
                      Entrance List
                    </Link>
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>

            {links.slice(2).map((link) => (
              <NavItem key={link.to} to={link.to}>
                {link.label}
              </NavItem>
            ))}

          
          </HStack>

          <IconButton
            display={{ base: "flex", lg: "none" }}
            aria-label="Toggle navigation"
            variant="outline"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "✕" : "☰"}
          </IconButton>
        </Flex>

        {open && (
          <VStack
            display={{ base: "flex", lg: "none" }}
            align="stretch"
            gap="5"
            py="5"
            borderTopWidth="1px"
            borderColor="gray.100"
          >
            {links.map((link) => (
              <NavItem
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavItem>
            ))}

           

            <Box>
              <Text fontSize="sm" fontWeight="700" color="gray.500" mb="3">
                Academic
              </Text>
              <VStack align="stretch" gap="3" pl="4">
                <NavItem to="/academic/courses" onClick={() => setOpen(false)}>
                  Courses
                </NavItem>
                <NavItem to="/academic/students" onClick={() => setOpen(false)}>
                  Student Information
                </NavItem>
                <NavItem
                  to="/academic/entrance-list"
                  onClick={() => setOpen(false)}
                >
                  Entrance List
                </NavItem>
              </VStack>
            </Box>
          </VStack>
        )}
      </Container>
    </Box>
  );
}
