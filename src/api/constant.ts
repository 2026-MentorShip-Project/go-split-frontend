export const BASE_URL = process.env.API_URL;

export function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, { credentials: "include", ...init });
}

export function apiPost(url: string, body: unknown): Promise<Response> {
  return apiFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function apiPatch(url: string, body: unknown): Promise<Response> {
  return apiFetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function apiDelete(url: string): Promise<Response> {
  return apiFetch(url, { method: "DELETE" });
}