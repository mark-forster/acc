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

function ProtectedRoute() {
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
  // USER IS NOT AUTHENTICATED
  // ==========================================

  if (!isSignedIn) {
    return (
      <Navigate
        to="/acc/auth/login"
        replace
      />
    );
  }

  // ==========================================
  // USER IS AUTHENTICATED
  // ==========================================

  return <Outlet />;
}

export default ProtectedRoute;