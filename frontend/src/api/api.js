import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim();

if (!apiBaseUrl) {
  throw new Error("Missing VITE_API_URL");
}

let tokenProvider = null;

export const configureApiAuth = (getToken) => {
  tokenProvider = getToken;
};

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  if (tokenProvider) {
    const token = await tokenProvider();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    config.headers["X-Client-Request-Id"] = crypto.randomUUID();
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 401 &&
      error?.config?.headers?.Authorization
    ) {
      window.dispatchEvent(new CustomEvent("app:auth-expired"));
    }

    return Promise.reject(error);
  },
);

export default api;
