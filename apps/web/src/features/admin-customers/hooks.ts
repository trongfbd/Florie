import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCustomerNote,
  fetchCustomer,
  fetchCustomers,
  removeCustomerNote,
  setCustomerVip,
} from "./api";

const KEY = ["admin-customers"];

export function useCustomers(query: { page?: number; search?: string; isVip?: boolean; enabled?: boolean }) {
  const { enabled, ...params } = query;
  return useQuery({ queryKey: [...KEY, params], queryFn: () => fetchCustomers(params), enabled });
}

export function useCustomer(id: string) {
  return useQuery({ queryKey: [...KEY, id], queryFn: () => fetchCustomer(id), enabled: !!id });
}

export function useSetCustomerVip(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isVip: boolean) => setCustomerVip(id, isVip),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAddCustomerNote(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => addCustomerNote(id, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...KEY, id] }),
  });
}

export function useRemoveCustomerNote(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => removeCustomerNote(id, noteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...KEY, id] }),
  });
}
