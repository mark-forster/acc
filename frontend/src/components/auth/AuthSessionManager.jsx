import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";

import { configureApiAuth } from "../../api/api.js";
import useAuthStore from "../../store/authStore.js";

function AuthSessionManager() {
  const { getToken, signOut } = useAuth();
  const navigate = useNavigate();
  const clearLoginAttempt = useAuthStore(
    (state) => state.clearLoginAttempt,
  );

  useEffect(() => {
    configureApiAuth(getToken);

    return () => {
      configureApiAuth(null);
    };
  }, [getToken]);

  useEffect(() => {
    let handlingExpiration = false;

    const handleAuthExpired = async () => {
      if (handlingExpiration) return;

      handlingExpiration = true;

      try {
        await signOut();
      } finally {
        clearLoginAttempt();
        navigate("/acc/auth/login", { replace: true });
      }
    };

    window.addEventListener(
      "app:auth-expired",
      handleAuthExpired,
    );

    return () => {
      window.removeEventListener(
        "app:auth-expired",
        handleAuthExpired,
      );
    };
  }, [signOut, navigate, clearLoginAttempt]);

  return null;
}

export default AuthSessionManager;
