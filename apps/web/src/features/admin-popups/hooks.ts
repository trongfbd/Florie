import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPopup, deletePopup, fetchPopup, fetchPopups, updatePopup } from "./api";
import type { PopupFormInput } from "./types";

const KEY = ["admin-popups"];

export function usePopups() {
  return useQuery({ queryKey: KEY, queryFn: fetchPopups });
}

export function usePopup(id: string) {
  return useQuery({ queryKey: [...KEY, id], queryFn: () => fetchPopup(id), enabled: !!id });
}

export function useCreatePopup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PopupFormInput) => createPopup(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdatePopup(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<PopupFormInput>) => updatePopup(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeletePopup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePopup(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
