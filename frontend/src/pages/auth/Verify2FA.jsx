import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

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

import { useSignIn } from "@clerk/react";

import AppLogo from "../../components/auth/AppLogo.jsx";
import useAuthStore from "../../store/authStore.js";

function Verify2FA() {
  const navigate = useNavigate();
const {
  signIn,
  errors,
  fetchStatus,
} = useSignIn();

  const loginEmail = useAuthStore(
    (state) => state.loginEmail,
  );

  const [otp, setOtp] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==================================================
  // CHECK LOGIN FLOW
  // ==================================================

  useEffect(() => {

    if (!loginEmail) {

      navigate("/acc/auth/login", {
        replace: true,
      });
    }
  }, [loginEmail, navigate]);

  // ==================================================
  // CHECK CLERK SIGN-IN STATE
  // ==================================================

  useEffect(() => {
    if ( !signIn) {
      return;
    }

  }, [ signIn]);

  // ==================================================
  // OTP INPUT
  // ==================================================

  const handleOtpChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);
    setError("");
  };

  // ==================================================
  // VERIFY CODE
  // ==================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // ================================================
    // VALIDATION
    // ================================================

    if (otp.length !== 6) {
      setError(
        "Please enter the 6-digit verification code.",
      );

      return;
    }

    // ================================================
    // CHECK CLERK
    // ================================================

    if (!signIn) {
      setError(
        "Authentication service is not ready yet. Please try again.",
      );

      return;
    }

    try {
      setLoading(true);

      // ==============================================
      // DEVICE TRUST / EMAIL CODE
      // ==============================================
      //
      // Clerk v6:
      //
      // needs_client_trust
      //        ↓
      // mfa.verifyEmailCode()
      //
      // ==============================================

      if (
        signIn.status ===
        "needs_client_trust"
      ) {

        const {
          error: verifyError,
        } =
          await signIn.mfa.verifyEmailCode({
            code: otp,
          });

        if (verifyError) {

          setError(
            verifyError.longMessage ||
              verifyError.message ||
              "Invalid verification code.",
          );

          return;
        }

      }

      // ==============================================
      // NORMAL MFA
      // ==============================================
      //
      // If normal MFA also uses email_code,
      // the same current Clerk v6 method is used.
      //
      // ==============================================

      else if (
        signIn.status ===
        "needs_second_factor"
      ) {

        const emailCodeFactor =
          signIn.supportedSecondFactors?.find(
            (factor) =>
              factor.strategy ===
              "email_code",
          );

        if (!emailCodeFactor) {
          setError(
            "Email verification is not available for this sign-in.",
          );

          return;
        }

        const {
          error: verifyError,
        } =
          await signIn.mfa.verifyEmailCode({
            code: otp,
          });

        if (verifyError) {

          setError(
            verifyError.longMessage ||
              verifyError.message ||
              "Invalid verification code.",
          );

          return;
        }

      }

      // ==============================================
      // UNEXPECTED STATUS
      // ==============================================

      else {

        setError(
          `Verification cannot continue. Clerk status: ${signIn.status}`,
        );

        return;
      }

      // ==============================================
      // CHECK FINAL STATUS
      // ==============================================

      if (
        signIn.status !== "complete"
      ) {
        setError(
          `Verification is not complete. Clerk status: ${signIn.status}`,
        );

        return;
      }

      // ==============================================
      // FINALIZE CLERK SIGN-IN
      // ==============================================
      //
      // Clerk v6:
      //
      // status === complete
      //        ↓
      // signIn.finalize()
      //        ↓
      // active session
      //
      // ==============================================

      const {
        error: finalizeError,
      } = await signIn.finalize();

      if (finalizeError) {

        setError(
          finalizeError.longMessage ||
            finalizeError.message ||
            "Unable to activate your session.",
        );

        return;
      }

      // ==============================================
      // SUCCESS
      // ==============================================

      // Do not clear login attempt here.
      //
      // Dashboard can clear it after successful
      // authentication if needed.

      navigate("/acc/auth/dashboard", {
        replace: true,
      });
    } catch (error) {

      const message =
        error?.errors?.[0]
          ?.longMessage ||
        error?.errors?.[0]
          ?.message ||
        error?.message ||
        errors?.[0]?.message ||
        "Verification failed.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // RESEND DEVICE TRUST CODE
  // ==================================================

  const handleResendCode = async () => {
    setError("");

    if (!signIn) {
      setError(
        "Authentication service is not ready yet.",
      );

      return;
    }

    try {
      setLoading(true);

      const {
        error: resendError,
      } =
        await signIn.mfa.sendEmailCode();

      if (resendError) {

        setError(
          resendError.longMessage ||
            resendError.message ||
            "Unable to resend verification code.",
        );

        return;
      }

      setError(
        "A new verification code has been sent to your email.",
      );
    } catch (error) {

      setError(
        error?.errors?.[0]
          ?.longMessage ||
          error?.errors?.[0]
            ?.message ||
          error?.message ||
          "Unable to resend verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // NO LOGIN ATTEMPT
  // ==================================================

  if (!loginEmail) {
    return null;
  }

  // ==================================================
  // UI
  // ==================================================

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
          boxShadow="0 12px 40px rgba(0, 0, 0, 0.08)"
        >
          <Card.Body
            p={{
              base: 6,
              md: 8,
            }}
          >
            <VStack gap={5}>
              {/* TITLE */}

              <Box textAlign="center">
                <Heading
                  size="xl"
                  fontWeight="700"
                >
                  Verify Login
                </Heading>

                <Text
                  mt={2}
                  color="gray.500"
                  fontSize="sm"
                >
                  We sent a verification
                  code to
                </Text>

                <Text
                  mt={1}
                  fontWeight="600"
                >
                  {loginEmail}
                </Text>
              </Box>

              {/* ERROR / MESSAGE */}

              {error && (
                <Alert.Root
                  status={
                    error.includes(
                      "sent to your email",
                    )
                      ? "success"
                      : "error"
                  }
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

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                style={{
                  width: "100%",
                }}
              >
                <VStack gap={4}>
                  {/* OTP */}

                  <Input
                    size="lg"
                    value={otp}
                    onChange={
                      handleOtpChange
                    }
                    placeholder="000000"
                    textAlign="center"
                    fontSize="2xl"
                    fontWeight="600"
                    letterSpacing="10px"
                    borderRadius="12px"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    disabled={loading}
                  />

                  {/* VERIFY */}

                  <Button
                    type="submit"
                    w="full"
                    size="lg"
                    borderRadius="12px"
                    colorPalette="blue"
                    loading={loading}
                    loadingText="Verifying..."
                    disabled={
                      otp.length !== 6 ||
                      fetchStatus ===
                        "fetching"
                    }
                  >
                    Verify Code
                  </Button>

                  {/* RESEND */}

                  <Button
                    type="button"
                    variant="ghost"
                    w="full"
                    onClick={
                      handleResendCode
                    }
                    disabled={
                      loading 
                    }
                  >
                    Resend Code
                  </Button>

                  {/* BACK */}

                  <Button
                    type="button"
                    variant="plain"
                    w="full"
                    onClick={() =>
                      navigate(
                        "/login",
                        {
                          replace: true,
                        },
                      )
                    }
                    disabled={loading}
                  >
                    Back to Login
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

export default Verify2FA;