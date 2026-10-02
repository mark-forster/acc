import { useState } from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  Heading,
  Input,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";

import AppLogo from "../../components/auth/AppLogo.jsx";
import api from "../../api/api.js";

function Referral() {
  const navigate = useNavigate();

  const [code, setCode] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    const referralCode =
      code.trim();

    if (!referralCode) {
      setError(
        "Please enter your referral code."
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await api.post(
          "/referrals/validate",
          {
            referralCode,
          }
        );

      if (response.data.success) {
        navigate("/acc/auth/register", {
          state: {
            referralCode,
          },
        });
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Invalid referral code."
      );
    } finally {
      setLoading(false);
    }
  };

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

        <AppLogo size="100px" />

        <Card.Root
          w="full"
          bg="white"
          borderRadius="20px"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="0 12px 40px rgba(0,0,0,0.08)"
        >
          <Card.Body
            p={{ base: 6, md: 8 }}
          >
            <VStack
              gap={5}
              align="stretch"
            >

              <Box textAlign="center">
                <Heading size="xl">
                  Join Us
                </Heading>

                <Text
                  mt={2}
                  color="gray.500"
                  fontSize="sm"
                >
                  Enter your referral
                  code to continue.
                </Text>
              </Box>

              {error && (
                <Box
                  bg="red.50"
                  color="red.600"
                  borderRadius="10px"
                  px={4}
                  py={3}
                  fontSize="sm"
                >
                  {error}
                </Box>
              )}

              <form
                onSubmit={handleSubmit}
              >
                <VStack gap={4}>

                  <Input
                    size="lg"
                    borderRadius="12px"
                    textAlign="center"
                    letterSpacing="1px"
                    placeholder="Enter referral code"
                    value={code}
                    onChange={(event) =>
                      setCode(
                        event.target.value
                      )
                    }
                  />

                  <Button
                    type="submit"
                    w="full"
                    size="lg"
                    borderRadius="12px"
                    colorPalette="blue"
                    loading={loading}
                    loadingText="Checking..."
                  >
                    Continue
                  </Button>

                </VStack>
              </form>

              <Text
                fontSize="sm"
                textAlign="center"
                color="gray.500"
              >
                Already have an account?{" "}
                <Link
                  color="blue.500"
                  fontWeight="600"
                  cursor="pointer"
                  onClick={() =>
                    navigate("/acc/auth/login")
                  }
                >
                  Login
                </Link>
              </Text>

            </VStack>
          </Card.Body>
        </Card.Root>

      </VStack>
    </Box>
  );
}

export default Referral;