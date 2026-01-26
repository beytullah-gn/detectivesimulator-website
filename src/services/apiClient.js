import { API_BASE_URL } from "../constants/api";

export function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("API response parse error:", error);
    return text;
  }
}

export async function apiFetch(path, { method = "GET", body, token } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  let payload;
  try {
    response = await fetch(buildUrl(path), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    payload = await parseResponse(response);
  } catch (error) {
    console.error("API network error:", error);
    throw new Error("Sunucuya ulaşılamıyor. Lütfen bağlantınızı kontrol edin.");
  }

  if (!response.ok) {
    const errorMessage =
      payload?.error ||
      payload?.errors?.[0]?.message ||
      payload?.message ||
      response.statusText ||
      "Beklenmeyen bir hata oluştu.";
    throw new Error(errorMessage);
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload;
}
