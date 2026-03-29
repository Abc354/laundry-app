import { useQueryClient } from "@tanstack/react-query";
import {
  useListOrders,
  useCreateOrder as useGeneratedCreateOrder,
  useUpdateOrder as useGeneratedUpdateOrder,
  useDeleteOrder as useGeneratedDeleteOrder,
  getListOrdersQueryKey,
} from "../lib/api-client-react";

export function useOrders() {
  return useListOrders();
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useGeneratedCreateOrder({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      },
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useGeneratedUpdateOrder({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      },
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useGeneratedDeleteOrder({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      },
    },
  });
}
