const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const fallbackBaseUrl =
  process.env.NODE_ENV === "production"
    ? "https://panel.detectivesimulator.com"
    : "http://localhost:8057";

export const API_BASE_URL = configuredBaseUrl || fallbackBaseUrl;

export const STORAGE_KEY = "detective_simulator_token";
