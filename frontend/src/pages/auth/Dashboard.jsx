import { useEffect, useState } from "react";

import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";

import api from "../../api/api.js";
import useAuthStore from "../../store/authStore.js";
import AppLogo from "../../components/auth/AppLogo.jsx";

function Dashboard() {
  const { signOut } = useAuth();

  const clearLoginAttempt = useAuthStore((state) => state.clearLoginAttempt);

  const [user, setUser] = useState(null);

  const [referral, setReferral] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  // ==================================================
  // LOAD DASHBOARD DATA
  // ==================================================

  useEffect(() => {
    const controller = new AbortController();

    const loadDashboard = async () => {
      try {
        setLoading(true);

        setError("");

        // ========================================
        // GET CLERK TOKEN
        // ========================================

        // ========================================
        // LOAD USER
        // ========================================
        const userResponse = await api.get("/auth/me", {
          signal: controller.signal,
        });

        // ========================================
        // LOAD REFERRAL
        // ========================================

        const referralResponse = await api.get("/referrals", {
          signal: controller.signal,
        });

        // ========================================
        // USER
        // ========================================

        setUser(userResponse.data.user);

        // ========================================
        // REFERRAL
        // ========================================

        const referrals = referralResponse.data.data;

        if (Array.isArray(referrals) && referrals.length > 0) {
          setReferral(referrals[0]);
        } else {
          setReferral(null);
        }

        // ========================================
        // CLEAR TEMP LOGIN STATE
        // ========================================

        clearLoginAttempt();
      } catch (error) {
        if (error?.code === "ERR_CANCELED") return;

        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load dashboard.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

    return () => controller.abort();
  }, [clearLoginAttempt]);

  // ==================================================
  // COPY REFERRAL CODE
  // ==================================================

  const handleCopyReferralCode = async () => {
    if (!referral?.code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(referral.code);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {

    }
  };
  // ==================================================
  //logutOUt
  // ==================================================
  const handleLogout = async () => {
  try {
    await api.post("/auth/logout");

    // Backend logout success
    await signOut();

    clearLoginAttempt();

    navigate("/acc/auth/login", {
      replace: true,
    });
  } catch (error) {

  }
};
  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <Box
        minH="100vh"
        bg="gray.50"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={4}
      >
        <VStack gap={4}>
          <AppLogo size="90px" />

          <Text color="gray.500" fontSize="sm">
            Loading dashboard...
          </Text>
        </VStack>
      </Box>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error) {
    return (
      <Box minH="100vh" bg="gray.50" px={4} py={10}>
        <Box maxW="600px" mx="auto">
          <Alert.Root status="error" borderRadius="16px">
            <Alert.Indicator />

            <Alert.Content>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        </Box>
      </Box>
    );
  }

  // ==================================================
  // DASHBOARD
  // ==================================================

  return (
    <Box minH="100vh" bg="gray.50">
      {/* ================================================== */}
      {/* TOP HEADER */}
      {/* ================================================== */}

      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.100"
        position="sticky"
        top="0"
        zIndex="10"
      >
        <Flex
          maxW="1200px"
          mx="auto"
          px={{
            base: 4,
            md: 6,
          }}
          py={4}
          align="center"
          justify="space-between"
        >
          {/* LOGO */}

          <AppLogo size="65px" />

          {/* USER INFO */}

          <Flex align="center" gap={4}>
            {user && (
              <Box textAlign="right">
                <Text fontSize="sm" fontWeight="600" color="gray.800">
                  {user.firstName} {user.lastName}
                </Text>

                <Text fontSize="xs" color="gray.500">
                  {user.email}
                </Text>
              </Box>
            )}

            <Button
              size="sm"
              variant="outline"
              colorPalette="red"
              borderRadius="10px"
              onClick={handleLogout}
            >
              Logout
            </Button>
            <Button
  size="sm"
  variant="outline"
  borderRadius="10px"
  onClick={() => navigate("/acc/auth/sessions")}
>
  Active Sessions
</Button>
          </Flex>
        </Flex>
      </Box>

      {/* ================================================== */}
      {/* MAIN CONTENT */}
      {/* ================================================== */}

      <Box
        maxW="1200px"
        mx="auto"
        px={{
          base: 4,
          md: 6,
        }}
        py={{
          base: 8,
          md: 12,
        }}
      >
        {/* ================================================== */}
        {/* WELCOME HEADER */}
        {/* ================================================== */}

        <Box mb={8}>
          <Text fontSize="sm" fontWeight="600" color="blue.600" mb={2}>
            OVERVIEW
          </Text>

          <Heading
            size={{
              base: "xl",
              md: "2xl",
            }}
            color="gray.800"
          >
            Dashboard
          </Heading>

          {user && (
            <Text
              mt={2}
              color="gray.500"
              fontSize={{
                base: "sm",
                md: "md",
              }}
            >
              Welcome back,{" "}
              <Text as="span" fontWeight="600" color="gray.700">
                {user.firstName}
              </Text>
              . Here's your account overview.
            </Text>
          )}
        </Box>

        {/* ================================================== */}
        {/* PROFILE + REFERRAL */}
        {/* ================================================== */}

        <Grid
          templateColumns={{
            base: "1fr",
            lg: "1fr 1.4fr",
          }}
          gap={6}
        >
          {/* ================================================== */}
          {/* PROFILE CARD */}
          {/* ================================================== */}

          <Card.Root
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="20px"
            boxShadow="0 8px 30px rgba(0,0,0,0.05)"
          >
            <Card.Header
              px={{
                base: 5,
                md: 6,
              }}
              pt={6}
              pb={4}
            >
              <Text fontSize="sm" color="blue.600" fontWeight="600" mb={1}>
                ACCOUNT
              </Text>

              <Heading size="md" color="gray.800">
                My Profile
              </Heading>
            </Card.Header>

            <Card.Body
              px={{
                base: 5,
                md: 6,
              }}
              pb={6}
            >
              {user && (
                <VStack align="stretch" gap={0}>
                  {/* NAME */}

                  <Box py={4}>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Full Name
                    </Text>

                    <Text fontWeight="600" color="gray.800">
                      {user.firstName} {user.lastName}
                    </Text>
                  </Box>

                  <Separator />

                  {/* EMAIL */}

                  <Box py={4}>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Email Address
                    </Text>

                    <Text
                      fontWeight="600"
                      color="gray.800"
                      wordBreak="break-all"
                    >
                      {user.email}
                    </Text>
                  </Box>

                  <Separator />

                  {/* ROLE */}

                  <Box py={4}>
                    <Text fontSize="xs" color="gray.500" mb={2}>
                      Account Role
                    </Text>

                    <Badge
                      colorPalette="blue"
                      variant="subtle"
                      borderRadius="full"
                      px={3}
                      py={1}
                      width="fit-content"
                    >
                      {user.role}
                    </Badge>
                  </Box>

                  <Separator />

                  {/* STATUS */}

                  <Box py={4}>
                    <Text fontSize="xs" color="gray.500" mb={2}>
                      Account Status
                    </Text>

                    <Badge
                      colorPalette={user.isActive ? "green" : "red"}
                      variant="subtle"
                      borderRadius="full"
                      px={3}
                      py={1}
                      width="fit-content"
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </Box>
                </VStack>
              )}
            </Card.Body>
          </Card.Root>

          {/* ================================================== */}
          {/* REFERRAL CARD */}
          {/* ================================================== */}

          <Card.Root
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="20px"
            boxShadow="0 8px 30px rgba(0,0,0,0.05)"
          >
            <Card.Header
              px={{
                base: 5,
                md: 6,
              }}
              pt={6}
              pb={4}
            >
              <Text fontSize="sm" color="blue.600" fontWeight="600" mb={1}>
                REFERRAL
              </Text>

              <Heading size="md" color="gray.800">
                My Referral Code
              </Heading>
            </Card.Header>

            <Card.Body
              px={{
                base: 5,
                md: 6,
              }}
              pb={6}
            >
              {!referral ? (
                <Box py={8} textAlign="center">
                  <Text color="gray.500">Referral code not found.</Text>
                </Box>
              ) : (
                <VStack align="stretch" gap={6}>
                  {/* ================================================== */}
                  {/* REFERRAL CODE */}
                  {/* ================================================== */}

                  <Box
                    bg="blue.50"
                    border="1px solid"
                    borderColor="blue.100"
                    borderRadius="16px"
                    p={{
                      base: 5,
                      md: 6,
                    }}
                  >
                    <Text
                      fontSize="xs"
                      color="blue.600"
                      fontWeight="600"
                      mb={2}
                    >
                      YOUR REFERRAL CODE
                    </Text>

                    <Flex
                      direction={{
                        base: "column",
                        sm: "row",
                      }}
                      gap={4}
                      align={{
                        base: "stretch",
                        sm: "center",
                      }}
                      justify="space-between"
                    >
                      <Text
                        fontSize={{
                          base: "2xl",
                          md: "3xl",
                        }}
                        fontWeight="800"
                        letterSpacing="widest"
                        color="gray.800"
                        wordBreak="break-all"
                      >
                        {referral.code}
                      </Text>

                      <Button
                        onClick={handleCopyReferralCode}
                        colorPalette="blue"
                        borderRadius="12px"
                        flexShrink={0}
                      >
                        {copied ? "Copied!" : "Copy Code"}
                      </Button>
                    </Flex>

                    <Text mt={3} fontSize="xs" color="gray.500">
                      Share this referral code with your friends.
                    </Text>
                  </Box>

                  {/* ================================================== */}
                  {/* STATS */}
                  {/* ================================================== */}

                  <Grid
                    templateColumns={{
                      base: "1fr",
                      sm: "repeat(3, 1fr)",
                    }}
                    gap={4}
                  >
                    {/* USED */}

                    <Box bg="gray.50" borderRadius="14px" p={4}>
                      <Text fontSize="xs" color="gray.500" mb={2}>
                        Used
                      </Text>

                      <Text fontSize="xl" fontWeight="700" color="gray.800">
                        {referral.usedCount}
                      </Text>

                      <Text fontSize="xs" color="gray.500" mt={1}>
                        of {referral.maxUses}
                      </Text>
                    </Box>

                    {/* REMAINING */}

                    <Box bg="gray.50" borderRadius="14px" p={4}>
                      <Text fontSize="xs" color="gray.500" mb={2}>
                        Remaining
                      </Text>

                      <Text fontSize="xl" fontWeight="700" color="gray.800">
                        {referral.remaining}
                      </Text>

                      <Text fontSize="xs" color="gray.500" mt={1}>
                        available
                      </Text>
                    </Box>

                    {/* STATUS */}

                    <Box bg="gray.50" borderRadius="14px" p={4}>
                      <Text fontSize="xs" color="gray.500" mb={2}>
                        Status
                      </Text>

                      <Badge
                        colorPalette={
                          referral.status === "active" ? "green" : "gray"
                        }
                        variant="subtle"
                        borderRadius="full"
                        px={3}
                        py={1}
                        width="fit-content"
                      >
                        {referral.status}
                      </Badge>

                      <Text fontSize="xs" color="gray.500" mt={2}>
                        Referral status
                      </Text>
                    </Box>
                  </Grid>
                </VStack>
              )}
            </Card.Body>
          </Card.Root>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;
