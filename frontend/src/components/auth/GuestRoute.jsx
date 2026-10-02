import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  Center,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";

import { useAuth } from "@clerk/react";

function GuestRoute() {
  const {
    isLoaded,
    isSignedIn,
  } = useAuth();

  // ==========================================
  // CLERK IS STILL LOADING
  // ==========================================

  if (!isLoaded) {
    return (
      <Center minH="100vh">
        <VStack gap={4}>
          <Spinner size="xl" />

          <Text>
            Checking authentication...
          </Text>
        </VStack>
      </Center>
    );
  }

  // ==========================================
  // USER ALREADY SIGNED IN
  // ==========================================

  if (isSignedIn) {
    return (
      <Navigate
        to="/acc/auth/dashboard"
        replace
      />
    );
  }

  // ==========================================
  // USER IS GUEST
  // ==========================================

  return <Outlet />;
}

export default GuestRoute;