import { useMutation } from "@tanstack/react-query";
import { useCustomerAuthStore } from "@/stores/customer-auth-store";
import { loginCustomer, loginWithGoogle, logoutCustomer, registerCustomer } from "./api";

export function useRegisterCustomer() {
  const setSession = useCustomerAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: registerCustomer,
    onSuccess: (data) => setSession(data.accessToken, data.customer),
  });
}

export function useLoginCustomer() {
  const setSession = useCustomerAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: loginCustomer,
    onSuccess: (data) => setSession(data.accessToken, data.customer),
  });
}

export function useLoginWithGoogle() {
  const setSession = useCustomerAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: (data) => setSession(data.accessToken, data.customer),
  });
}

export function useLogoutCustomer() {
  const clearSession = useCustomerAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: logoutCustomer,
    onSuccess: () => clearSession(),
  });
}
