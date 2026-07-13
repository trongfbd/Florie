import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCustomerAuthStore } from "@/stores/customer-auth-store";
import { addToWishlist, fetchWishlist, removeFromWishlist } from "./api";

const WISHLIST_KEY = ["wishlist"];

export function useWishlistQuery() {
  const isLoggedIn = useCustomerAuthStore((state) => !!state.customer);

  return useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: fetchWishlist,
    enabled: isLoggedIn,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();

  const add = useMutation({
    mutationFn: addToWishlist,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WISHLIST_KEY }),
  });

  const remove = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WISHLIST_KEY }),
  });

  return { add, remove };
}
