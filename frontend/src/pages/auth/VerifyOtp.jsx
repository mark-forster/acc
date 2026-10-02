import { useState } from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";

import api from "../../api/api.js";
import AppLogo from "../../components/auth/AppLogo.jsx";

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const email =
    location.state?.email || "";

  const password =
    location.state?.password || "";

  const [otp, setOtp] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================
  // INVALID REGISTRATION SESSION
  // ==========================================

  if (!email || !password) {
    navigate("/acc/auth/register", {
      replace: true,
    });

    return null;
  }

  // ==========================================
  // OTP INPUT
  // ==========================================

  const handleOtpChange = (event) => {
    const value =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 6);

    setOtp(value);
  };

  // ==========================================
  // VERIFY
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (otp.length !== 6) {
      setError(
        "Please enter the 6-digit OTP."
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await api.post(
          "/auth/register/verify",
          {
            email:
              email.trim().toLowerCase(),

            otp,

            password,
          }
        );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "OTP verification failed."
        );
      }

      // ========================================
      // REGISTRATION COMPLETE
      // ========================================

      navigate("/acc/auth/login", {
        replace: true,
        state: {
          registered: true,
        },
      });
    } catch (error) {

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "OTP verification failed."
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
          borderRadius="20px"
          bg="white"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="0 12px 40px rgba(0,0,0,0.08)"
        >
          <Card.Body
            p={{ base: 6, md: 8 }}
          >
            <VStack gap={5}>

              <Box textAlign="center">
                <Heading size="xl">
                  Verify Email
                </Heading>

                <Text
                  mt={2}
                  color="gray.500"
                  fontSize="sm"
                >
                  Enter the 6-digit code
                  sent to
                </Text>

                <Text
                  mt={1}
                  fontWeight="600"
                  wordBreak="break-all"
                >
                  {email}
                </Text>
              </Box>

              {error && (
                <Alert.Root
                  status="error"
                  w="full"
                  borderRadius="10px"
                >
                  <Alert.Indicator />

                  <Alert.Content>
                    <Alert.Description>
                      {error}
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}

              <form
                onSubmit={handleSubmit}
                style={{
                  width: "100%",
                }}
              >
                <VStack gap={4}>

                  <Input
                    size="lg"
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="000000"
                    textAlign="center"
                    fontSize="2xl"
                    fontWeight="600"
                    letterSpacing="10px"
                    borderRadius="12px"
                    inputMode="numeric"
                    autoFocus
                  />

                  <Button
                    type="submit"
                    w="full"
                    size="lg"
                    borderRadius="12px"
                    colorPalette="blue"
                    loading={loading}
                    loadingText="Verifying..."
                  >
                    Verify OTP
                  </Button>

                </VStack>
              </form>

            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
}

export default VerifyOtp;

