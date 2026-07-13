import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCustomerAuthStore } from "@/stores/customer-auth-store";
import { claimVoucher, fetchActivePopup, fetchMyVouchers } from "./api";

/** Waits for the customer session to finish hydrating before fetching, so guests
 *  vs. logged-in customers aren't momentarily confused during the silent-refresh window. */
export function useActivePopup() {
  const hasHydrated = useCustomerAuthStore((state) => state.hasHydrated);
  const accessToken = useCustomerAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["active-popup", !!accessToken],
    queryFn: () => fetchActivePopup(accessToken),
    enabled: hasHydrated,
    staleTime: 60_000,
  });
}

export function useClaimVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (popupId: string) => claimVoucher(popupId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-vouchers"] }),
  });
}

export function useMyVouchers() {
  const customer = useCustomerAuthStore((state) => state.customer);
  return useQuery({
    queryKey: ["my-vouchers"],
    queryFn: fetchMyVouchers,
    enabled: !!customer,
  });
}
