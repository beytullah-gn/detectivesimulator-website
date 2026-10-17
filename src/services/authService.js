import { API_BASE_URL, STORAGE_KEY } from "../constants/api";
import { apiFetch } from "./apiClient";

export const SESSION_TOKEN = "__directus_session__";

export function getStoredToken() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

export function storeToken(token) {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function login({ email, password }) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  if (!data?.access_token) {
    throw new Error("Giriş başarısız oldu.");
  }

  return data.access_token;
}

export async function register({ email, password }) {
  return apiFetch("/api/register", {
    method: "POST",
    body: { email, password },
  });
}

export async function fetchUser(token) {
  try {
    const data = await apiFetch("/api/user", { token });
    if (data?.user) return data.user;
  } catch {
    // Fallback to standard Directus user endpoint
  }
  try {
    const me = await apiFetch("/users/me", { token });
    return me || null;
  } catch {
    return null;
  }
}

export function oauthLoginUrl(provider, redirectUrl) {
  const redirect =
    redirectUrl ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : "https://detectivesimulator.com/auth/callback");
  const params = new URLSearchParams({ redirect });
  return `${API_BASE_URL}/auth/login/${provider}?${params.toString()}`;
}

