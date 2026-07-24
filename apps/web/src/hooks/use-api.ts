"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function unwrap<T>(payload: unknown, fallback: T): T {
  if (payload === null || payload === undefined) return fallback;
  if (typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    const inner = (payload as Record<string, unknown>).data;
    return (inner === undefined || inner === null ? fallback : inner) as T;
  }
  return payload as T;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (isAxiosError(error)) {
    if (error.code === "ERR_NETWORK" || !error.response) {
      return "Couldn't reach the API server. Check your connection and try again.";
    }
    const msg = (error.response.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(msg) && msg.length > 0) return msg[0];
    if (typeof msg === "string") return msg;
    if (error.response.status === 404) return "Resource not found.";
    if (error.response.status === 403) return "You don't have permission to do that.";
  }
  return fallback;
}

interface UseApiQueryOptions<T> {
  fallback: T;
  params?: Record<string, unknown>;
  enabled?: boolean;
  staleTime?: number;
}

export function useApiQuery<T>(key: QueryKey, url: string, options: UseApiQueryOptions<T>) {
  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get(url, { params: options.params });
      return unwrap<T>(data, options.fallback);
    },
    enabled: options.enabled,
    staleTime: options.staleTime,
  });

  return {
    ...query,
    data: query.data ?? options.fallback,
    isUnavailable: query.isError,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  };
}

interface UseApiMutationExtra {
  successMessage?: string;
  errorMessage?: string;
  invalidateKeys?: QueryKey[];
}

export function useApiMutation<TVariables, TResult = unknown>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
  options?: UseApiMutationExtra & Omit<UseMutationOptions<TResult, unknown, TVariables>, "mutationFn">
) {
  const queryClient = useQueryClient();
  const { successMessage, errorMessage, invalidateKeys, ...rest } = options ?? {};

  return useMutation({
    mutationFn,
    ...rest,
    onSuccess: (...args: Parameters<NonNullable<typeof rest.onSuccess>>) => {
      if (successMessage) toast.success(successMessage);
      invalidateKeys?.forEach((k) => queryClient.invalidateQueries({ queryKey: k }));
      rest.onSuccess?.(...args);
    },
    onError: (...args: Parameters<NonNullable<typeof rest.onError>>) => {
      toast.error(getErrorMessage(args[0], errorMessage));
      rest.onError?.(...args);
    },
  });
}

export async function apiGet<T>(url: string, fallback: T, params?: Record<string, unknown>): Promise<T> {
  try {
    const { data } = await api.get(url, { params });
    return unwrap<T>(data, fallback);
  } catch {
    return fallback;
  }
}
