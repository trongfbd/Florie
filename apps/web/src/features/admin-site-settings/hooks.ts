import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSiteSettings, updateSiteSettings } from "./api";
import type { SiteSettingsFormInput } from "./types";

const KEY = ["admin-site-settings"];

export function useSiteSettings() {
  return useQuery({ queryKey: KEY, queryFn: fetchSiteSettings });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SiteSettingsFormInput) => updateSiteSettings(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
