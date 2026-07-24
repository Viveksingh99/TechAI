import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { handleMockRequest } from "@/mock/handlers";
import { mockDelay } from "@/mock/utils";

/**
 * Axios adapter that serves mock data instead of hitting the network.
 */
export const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  await mockDelay(120);

  try {
    const data = await handleMockRequest(config);
    return {
      data,
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json", "x-techai-mock": "1" },
      config,
    };
  } catch (error) {
    const err = error as Error & { response?: { status: number; data: unknown } };
    const status = err.response?.status ?? 500;
    return Promise.reject({
      isAxiosError: true,
      name: "AxiosError",
      message: err.message,
      config,
      response: {
        data: err.response?.data ?? { message: err.message },
        status,
        statusText: status === 401 ? "Unauthorized" : "Error",
        headers: { "x-techai-mock": "1" },
        config,
      },
      toJSON: () => ({}),
    });
  }
};
