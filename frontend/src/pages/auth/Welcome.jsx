import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  Heading,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";

import AppLogo from "../../components/auth/AppLogo.jsx";

function Welcome() {
  const navigate = useNavigate();

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={8}
    >
      <VStack
        w="full"
        maxW="430px"
        gap={5}
      >

        {/* LOGO */}

        <AppLogo size="100px" />

        {/* CARD */}

        <Card.Root
          w="full"
          bg="white"
          border="1px solid"
          borderColor="gray.100"
          borderRadius="20px"
          boxShadow="0 12px 40px rgba(0,0,0,0.08)"
        >
          <Card.Body p={{ base: 6, md: 8 }}>
            <VStack gap={6}>

              <Box textAlign="center">
                <Heading
                  size="xl"
                  fontWeight="700"
                >
                  Welcome
                </Heading>

                <Text
                  mt={2}
                  color="gray.500"
                  fontSize="sm"
                >
                  Welcome to our
                  application.
                </Text>
              </Box>

              <Button
                w="full"
                size="lg"
                borderRadius="12px"
                colorPalette="blue"
                onClick={() =>
                  navigate("/acc/auth/login")
                }
              >
                Login
              </Button>

              <Text
                fontSize="sm"
                color="gray.500"
              >
                Don't have an account?{" "}
                <Link
                  color="blue.500"
                  fontWeight="600"
                  cursor="pointer"
                  onClick={() =>
                    navigate("/acc/auth/referral")
                  }
                >
                  Register
                </Link>
              </Text>

            </VStack>
          </Card.Body>
        </Card.Root>

      </VStack>
    </Box>
  );
}

export default Welcome;