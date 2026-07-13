import axios from "axios";
import { useAdminAuthStore } from "@/stores/admin-auth-store";

export const adminApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  timeout: 10_000,
  withCredentials: true, // sends the admin refresh cookie
});

adminApiClient.interceptors.request.use((config) => {
  const token = useAdminAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAdminSession(): Promise<string | null> {
  try {
    const { data } = await axios.post(
      `${adminApiClient.defaults.baseURL}/api/v1/auth/refresh`,
      {},
      { withCredentials: true },
    );
    useAdminAuthStore.getState().setSession(data.accessToken, data.user);
    return data.accessToken as string;
  } catch {
    useAdminAuthStore.getState().clearSession();
    return null;
  }
}

adminApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retried) {
      originalRequest._retried = true;
      refreshPromise ??= refreshAdminSession().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return adminApiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  },
);

export { refreshAdminSession };
