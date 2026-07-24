import axios from "axios";
import { useAuthStore } from "@/lib/auth-store";
import { isMockMode } from "@/mock/utils";
import { mockAdapter } from "@/mock/adapter";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  ...(isMockMode() ? { adapter: mockAdapter } : {}),
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // In mock mode we never clear auth on 401 from unrelated routes during exploration
    if (!isMockMode() && error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);

export default api;
