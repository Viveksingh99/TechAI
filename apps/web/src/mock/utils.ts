/**
 * TechAI mock mode helpers.
 * Set NEXT_PUBLIC_USE_MOCK=true to run the frontend without a backend.
 * When backend is ready: set to false (or remove) and delete the `src/mock` folder.
 */

export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK === "true";
}

export function mockDelay(ms = 180): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function wrapMock<T>(data: T, meta?: Record<string, unknown>) {
  return {
    success: true,
    data,
    meta: meta ?? null,
    timestamp: new Date().toISOString(),
  };
}

export function cuid(prefix = "mock") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
