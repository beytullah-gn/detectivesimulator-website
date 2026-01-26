export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  (import.meta.env.DEV ? "http://localhost:8055" : "https://panel.detectivesimulator.com");

export const STORAGE_KEY = "detective_simulator_token";
