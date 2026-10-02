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
  Field,
  Heading,
  Input,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";

import api from "../../api/api.js";
import AppLogo from "../../components/auth/AppLogo.jsx";

function Register() {
  const location = useLocation();
  const navigate = useNavigate();

  const referralCode =
    location.state?.referralCode || "";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================
  // NO REFERRAL CODE
  // ==========================================

  if (!referralCode) {
    navigate("/acc/auth/referral", {
      replace: true,
    });

    return null;
  }

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const firstName =
      form.firstName.trim();

    const lastName =
      form.lastName.trim();

    const email =
      form.email.trim().toLowerCase();

    if (!firstName || !lastName) {
      setError(
        "First name and last name are required."
      );

      return;
    }

    if (!email) {
      setError(
        "Email address is required."
      );

      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );

      return;
    }

    try {
      setLoading(true);

      // ========================================
      // START BACKEND REGISTRATION
      // ========================================
      //
      // IMPORTANT:
      // password is NOT sent here.
      //
      // Backend stores:
      // firstName
      // lastName
      // email
      // referralId
      // referredBy
      //
      // Then sends OTP.
      // ========================================

      const response =
        await api.post(
          "/auth/register",
          {
            firstName,
            lastName,
            email,
            referralCode,
          }
        );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Registration could not be started."
        );
      }

      // ========================================
      // MOVE TO OTP
      // ========================================

      navigate("/acc/auth/verify-otp", {
        state: {
          email,
          password: form.password,
        },
      });
    } catch (error) {

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Registration failed."
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
        maxW="460px"
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
            <VStack gap={5}>

              <Box textAlign="center">
                <Heading size="xl">
                  Create Account
                </Heading>

                <Text
                  mt={2}
                  color="gray.500"
                  fontSize="sm"
                >
                  Create your account
                  to get started.
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

                  <Field.Root required>
                    <Field.Label>
                      First Name
                    </Field.Label>

                    <Input
                      name="firstName"
                      size="lg"
                      borderRadius="12px"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                    />
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label>
                      Last Name
                    </Field.Label>

                    <Input
                      name="lastName"
                      size="lg"
                      borderRadius="12px"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                    />
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label>
                      Email
                    </Field.Label>

                    <Input
                      type="email"
                      name="email"
                      size="lg"
                      borderRadius="12px"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="example@gmail.com"
                    />
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label>
                      Password
                    </Field.Label>

                    <Input
                      type="password"
                      name="password"
                      size="lg"
                      borderRadius="12px"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                    />
                  </Field.Root>

                  <Button
                    type="submit"
                    w="full"
                    size="lg"
                    borderRadius="12px"
                    colorPalette="blue"
                    loading={loading}
                    loadingText="Sending OTP..."
                  >
                    Create Account
                  </Button>

                </VStack>
              </form>

              <Text
                fontSize="sm"
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

export default Register;
