import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminRole } from "@/stores/admin-auth-store";
import { createAdminUser, fetchAdminUsers, setAdminUserActive, updateAdminUserRole } from "./api";
import type { CreateAdminUserInput } from "./types";

const KEY = ["admin-users"];

export function useAdminUsers() {
  return useQuery({ queryKey: KEY, queryFn: fetchAdminUsers });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAdminUserInput) => createAdminUser(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateAdminUserRole(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (role: AdminRole) => updateAdminUserRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useSetAdminUserActive(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isActive: boolean) => setAdminUserActive(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
