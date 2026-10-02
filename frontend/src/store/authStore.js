import { create } from "zustand";

const useAuthStore = create((set) => ({
  loginEmail: "",
  signInAttempt: null,

  setLoginAttempt: ({
    email,
    signInAttempt,
  }) => {
    set({
      loginEmail: email,
      signInAttempt,
    });
  },

  clearLoginAttempt: () => {
    set({
      loginEmail: "",
      signInAttempt: null,
    });
  },
}));

export default useAuthStore;

