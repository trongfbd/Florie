import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addOrderImage,
  changeOrderStatus,
  createOrder,
  deleteOrderImage,
  fetchOrder,
  fetchOrders,
  updateOrder,
  updateOrderPayment,
} from "./api";
import type { CreateOrderInput, OrderStatus, QueryOrdersInput, UpdateOrderInput, UpdatePaymentInput } from "./types";

export function useOrders(query: QueryOrdersInput & { enabled?: boolean }) {
  const { enabled, ...params } = query;
  return useQuery({ queryKey: ["admin-orders", params], queryFn: () => fetchOrders(params), enabled });
}

export function useOrder(id: string) {
  return useQuery({ queryKey: ["admin-orders", id], queryFn: () => fetchOrder(id) });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
  });
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

export function useUpdateOrder(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateOrderInput) => updateOrder(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
}

export function useUpdateOrderPayment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePaymentInput) => updateOrderPayment(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
  });
}

export function useAddOrderImage(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, altText }: { file: File; altText?: string }) =>
      addOrderImage(orderId, file, altText),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders", orderId] }),
  });
}

export function useDeleteOrderImage(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => deleteOrderImage(orderId, imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders", orderId] }),
  });
}
