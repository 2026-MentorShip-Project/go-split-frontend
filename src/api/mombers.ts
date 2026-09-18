import { BASE_URL, apiFetch, apiPost, apiPatch, apiDelete } from "./constant";

export type ApiRole = "host" | "co" | "member";
export type UiRole = "主辦者" | "協辦者" | "參與者";

export interface EventDetailMember {
  id: number;
  display: string;
  role: string;
  tags: string[];
  guest: boolean;
  you: boolean;
}

export function roleFromApi(r: string): UiRole {
  if (r === "host") return "主辦者";
  if (r === "co") return "協辦者";
  return "參與者";
}

export function roleToApi(r: string): ApiRole {
  if (r === "主辦者") return "host";
  if (r === "協辦者") return "co";
  return "member";
}

export interface MemberBody {
  display: string;
  role: ApiRole;
  tags?: string[];
}

export async function getEventMembers(
  eventId: number,
): Promise<EventDetailMember[]> {
  const res = await apiFetch(`${BASE_URL}/events/${eventId}/members`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "取得成員失敗");
  }
  const data = await res.json();
  return data.members ?? [];
}

export async function createMember(
  eventId: number,
  body: MemberBody,
): Promise<EventDetailMember> {
  const res = await apiPost(`${BASE_URL}/events/${eventId}/members`, body);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "新增成員失敗");
  }
  return res.json();
}

export async function patchMember(
  eventId: number,
  memberId: number,
  body: Partial<MemberBody>,
): Promise<EventDetailMember> {
  const res = await apiPatch(`${BASE_URL}/events/${eventId}/members/${memberId}`, body);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "更新成員失敗");
  }
  return res.json();
}

export async function deleteMemberById(
  eventId: number,
  memberId: number,
): Promise<void> {
  const res = await apiDelete(`${BASE_URL}/events/${eventId}/members/${memberId}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "刪除成員失敗");
  }
}
