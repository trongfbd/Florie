import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchInvoiceSettings, updateInvoiceSettings } from "./api";
import type { InvoiceSettingsFormInput } from "./types";

const KEY = ["admin-invoice-settings"];

export function useInvoiceSettings() {
  return useQuery({ queryKey: KEY, queryFn: fetchInvoiceSettings });
}

export function useUpdateInvoiceSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InvoiceSettingsFormInput) => updateInvoiceSettings(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
