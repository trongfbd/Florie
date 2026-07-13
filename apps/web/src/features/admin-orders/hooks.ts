import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changeOrderStatus, fetchOrder, fetchOrders } from "./api";
import type { OrderStatus, QueryOrdersInput } from "./types";

export function useOrders(query: QueryOrdersInput) {
  return useQuery({ queryKey: ["admin-orders", query], queryFn: () => fetchOrders(query) });
}

export function useOrder(id: string) {
  return useQuery({ queryKey: ["admin-orders", id], queryFn: () => fetchOrder(id) });
}

export function useChangeOrderStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ toStatus, note }: { toStatus: OrderStatus; note?: string }) =>
      changeOrderStatus(id, toStatus, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
}
