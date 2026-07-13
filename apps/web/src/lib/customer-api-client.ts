import axios from "axios";
import { useCustomerAuthStore } from "@/stores/customer-auth-store";

export const customerApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  timeout: 10_000,
  withCredentials: true, // sends the customer refresh cookie
});

customerApiClient.interceptors.request.use((config) => {
  const token = useCustomerAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshSession(): Promise<string | null> {
  try {
    const { data } = await axios.post(
      `${customerApiClient.defaults.baseURL}/api/v1/customer-auth/refresh`,
      {},
      { withCredentials: true },
    );
    useCustomerAuthStore.getState().setSession(data.accessToken, data.customer);
    return data.accessToken as string;
  } catch {
    useCustomerAuthStore.getState().clearSession();
    return null;
  }
}

customerApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retried) {
      originalRequest._retried = true;

      refreshPromise ??= refreshSession().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return customerApiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  },
);

export { refreshSession };
