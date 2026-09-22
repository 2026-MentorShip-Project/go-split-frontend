import { BASE_URL, apiFetch, apiPatch, apiPost } from "./constant";

export interface MemberShare {
  member_id: number;
  owed: number;
  advanced: number;
  net: number;
}

export interface SharesResponse {
  grand_total?: number;
  per_member: MemberShare[];
}

export interface Transfer {
  from_id: number;
  to_id: number;
  amount: number;
}

export interface TransfersResponse {
  hub_id: number;
  strategy: string;
  transfers: Transfer[];
}

export interface SettleValidationDetail {
  code?: string;
  detail_id?: number;
}

async function readApiError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => ({} as Record<string, unknown>));
  const error = typeof data.error === "string" ? data.error : fallback;
  const details = Array.isArray(data.details)
    ? (data.details as SettleValidationDetail[])
        .map((d) => d.code)
        .filter((code): code is string => Boolean(code))
    : [];
  return details.length > 0 ? `${error}（${details.join("、")}）` : error;
}

export async function getShares(eventId: number): Promise<SharesResponse> {
  const res = await apiFetch(`${BASE_URL}/events/${eventId}/shares`);
  if (!res.ok) {
    throw new Error(await readApiError(res, "取得分攤結果失敗"));
  }
  const data = await res.json();
  return {
    grand_total: data.grand_total,
    per_member: data.per_member ?? [],
  };
}

export async function getTransfers(eventId: number): Promise<TransfersResponse> {
  const res = await apiFetch(`${BASE_URL}/events/${eventId}/transfers`);
  if (!res.ok) {
    throw new Error(await readApiError(res, "取得付款流向失敗"));
  }
  const data = await res.json();
  return {
    hub_id: data.hub_id ?? 0,
    strategy: data.strategy ?? "",
    transfers: data.transfers ?? [],
  };
}

export async function patchSettlementNote(eventId: number, note: string): Promise<void> {
  const res = await apiPatch(`${BASE_URL}/events/${eventId}/settlement-note`, { note });
  if (!res.ok) {
    throw new Error(await readApiError(res, "儲存留言失敗"));
  }
}

export async function settleEvent(eventId: number): Promise<void> {
  const res = await apiPost(`${BASE_URL}/events/${eventId}/settle`, {});
  if (res.status === 204) return;
  if (!res.ok) {
    throw new Error(await readApiError(res, "結帳失敗"));
  }
}
