import { BASE_URL, apiFetch, apiPatch, apiPost, readApiError } from "./constant";

export interface MemberShare {
  member_id: number;
  owed: number;
  advanced: number;
  net: number;
}

export interface DetailShare {
  item_id: number;
  detail_id: number;
  amount: number;
  shares: { member_id: number; amount: number; trace?: { kind: string } }[];
  validity?: string;
}

export interface SharesResponse {
  grand_total?: number;
  per_member: MemberShare[];
  per_detail: DetailShare[];
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

export async function getShares(eventId: number): Promise<SharesResponse> {
  const res = await apiFetch(`${BASE_URL}/events/${eventId}/shares`);
  if (!res.ok) {
    throw new Error(await readApiError(res, "取得分攤結果失敗"));
  }
  const data = await res.json();
  return {
    grand_total: data.grand_total,
    per_member: data.per_member ?? [],
    per_detail: data.per_detail ?? [],
  };
}

export interface MyDetails {
  member_id: number;
  net: number;
  transfers: Transfer[];
}

/** The caller's own net and transfers; open to every member, unlike /transfers before archive. */
export async function getMyDetails(eventId: number): Promise<MyDetails> {
  const res = await apiFetch(`${BASE_URL}/events/${eventId}/me/details`);
  if (!res.ok) {
    throw new Error(await readApiError(res, "取得個人分帳結果失敗"));
  }
  const data = await res.json();
  return {
    member_id: data.member_id,
    net: data.net ?? 0,
    transfers: data.transfers ?? [],
  };
}

export interface InvalidSplitLine {
  item_id: number;
  detail_id: number;
  code: string;
}

/** Transfers can't be balanced while any saved line is invalid. */
export class InvalidSplitsError extends Error {
  constructor(readonly lines: InvalidSplitLine[]) {
    super(`有 ${lines.length} 筆細項需要調整`);
  }
}

export async function getTransfers(eventId: number): Promise<TransfersResponse> {
  const res = await apiFetch(`${BASE_URL}/events/${eventId}/transfers`);
  if (res.status === 422) {
    const data = await res.clone().json().catch(() => null);
    if (Array.isArray(data?.details) && data.details.length > 0) {
      throw new InvalidSplitsError(data.details);
    }
  }
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
