import { STORAGE_KEY } from "../constants/api";
import { apiFetch } from "./apiClient";

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
  const data = await apiFetch("/api/user", { token });
  return data?.user || null;
}
