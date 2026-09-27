export const BASE_URL = "/api";

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
export interface ApiErrorDetail {
  code?: string;
  detail_id?: number;
}

/** Unpacks the API's `{error, details:[{code}]}` shape; 422 and 409 carry codes. */
export async function readApiError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => ({} as Record<string, unknown>));
  const error = typeof data.error === "string" ? data.error : fallback;
  const details = Array.isArray(data.details)
    ? (data.details as ApiErrorDetail[])
        .map((d) => d.code)
        .filter((code): code is string => Boolean(code))
    : [];
  return details.length > 0 ? `${error}（${details.join("、")}）` : error;
}
