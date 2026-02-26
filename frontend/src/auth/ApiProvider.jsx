import { createContext, useContext, useMemo } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const ApiContext = createContext(null);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export function ApiProvider({ children }) {
  const { token, logout } = useAuth();

  const client = useMemo(() => {
    const instance = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      withCredentials: true, // Needed for HttpOnly refresh token
    });

    // Request interceptor: Attach access token
    instance.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor: Handle standard backend errors and 401s
    instance.interceptors.response.use(
      (response) => {
        // Our backend now returns { success: true, ...data } but mostly we care about the whole response
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized (Token Expiration)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            // Attempt silent refresh
            const refreshRes = await axios.post(
              `${API_BASE_URL}/api/auth/refresh`,
              {},
              { withCredentials: true }
            );

            if (refreshRes.data?.success && refreshRes.data?.token) {
              const newToken = refreshRes.data.token;

              // We need a way to tell the context to update the token globally,
              // but because we are inside the hook, we can just attach it immediately for this request
              // Note: React state (setToken) update timing might be slightly delayed
              import("./AuthContext").then(mod => {
                // The actual token saving to localStorage mechanism should happen in the UI trigger,
                // but we'll manually patch the header for the retry
              });


              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return instance(originalRequest);
            }
          } catch (refreshErr) {
            // If refresh fails, log out
            logout();
          }
        }

        // Ensure consistent error surfacing
        throw error;
      }
    );

    return instance;
  }, [token, logout]);

  return (
    <ApiContext.Provider value={client}>{children}</ApiContext.Provider>
  );
}

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) {
    throw new Error("useApi must be used within ApiProvider");
  }
  return ctx;
}

