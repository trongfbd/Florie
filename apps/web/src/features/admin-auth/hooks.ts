import { useMutation } from "@tanstack/react-query";
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { loginAdmin, logoutAdmin } from "./api";

export function useLoginAdmin() {
  const setSession = useAdminAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: loginAdmin,
    onSuccess: (data) => setSession(data.accessToken, data.user),
  });
}

export function useLogoutAdmin() {
  const clearSession = useAdminAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: logoutAdmin,
    onSettled: () => clearSession(),
  });
}
