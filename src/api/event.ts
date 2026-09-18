import { BASE_URL, apiFetch, apiPost, apiDelete } from "./constant";
import { EventDetailMember } from "./mombers";

export interface CreateEventRequest {
  name: string;
  template: string;
  place?: string;
  starts_at?: string;
  ends_at?: string;
}

export interface CreateEventResponse {
  id: number;
  invite_code: string;
  name: string;
  place?: string;
  starts_at?: string;
  ends_at?: string;
  template: string;
}

export interface EventListItem {
    id: number;
    name: string;
    place: string;
    starts_at: string;
    ends_at: string;
    template: string;
    role: string;
    member_count: number;
    settled: boolean;
    archived: boolean;
  }

export function toRfc3339(date: string, time: string): string | undefined {
  if (!date) return undefined;
  const [year, month, day] = date.split("-").map(Number);
  const [hour = 0, minute = 0] = (time || "00:00").split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute).toISOString();
}

export async function createEvent(body: CreateEventRequest): Promise<CreateEventResponse> {
  const res = await apiPost(`${BASE_URL}/events`, body);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "建立活動失敗");
  }

  return res.json();
}


export interface EventDetailDetail {
  id: number;
  name: string;
  amount_cents: number;
  tag: string;
  note: string;
  ordinal: number;
  custom_shares: Record<string, number>;
}

export interface EventDetailItem {
  id: number;
  payer_member_id: number;
  author_member_id: number;
  has_receipt: boolean;
  total_cents: number;
  created_at: string;
  details: EventDetailDetail[];
}

export interface EventDetail {
  id: number;
  name: string;
  place: string;
  starts_at: string;
  ends_at: string;
  template: string;
  created_at: string;
  invite_code: string;
  settled: boolean;
  archived: boolean;
  my_role: string;
  total_cents: number;
  members: EventDetailMember[];
  items: EventDetailItem[];
}

export async function getEvent(id: number): Promise<EventDetail> {
  const res = await apiFetch(`${BASE_URL}/events/${id}`);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 404) throw new Error("活動不存在");
    if (res.status === 403) throw new Error("你不是此活動成員");
    throw new Error(data.error ?? "取得活動失敗");
  }

  return res.json();
}

export interface CreateDetailRequest {
  name: string;
  amount_cents?: number;
  tag?: string;
  note?: string;
  custom_shares?: Record<string, number>;
}

export interface CreateItemRequest {
  payer_member_id: number;
  details: CreateDetailRequest[];
  has_receipt?: boolean;
}

export async function createItem(eventId: number, body: CreateItemRequest): Promise<EventDetailItem> {
  const res = await apiPost(`${BASE_URL}/events/${eventId}/items`, body);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "新增款項失敗");
  }

  return res.json();
}

export async function getEvents(): Promise<EventListItem[]> {
    const res = await apiFetch(`${BASE_URL}/events`);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "取得活動列表失敗");
    }

    const data = await res.json();
    return data.events ?? [];
  }

export interface TemplateItem {
  label: string;
  description: string;
}

export async function getTemplates(): Promise<TemplateItem[]> {
  const res = await apiFetch(`${BASE_URL}/templates`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "取得模板失敗");
  }
  const data = await res.json();
  return data.templates ?? [];
}

// Settings 
export async function getItemTags(eventId: number): Promise<string[]> {
  const res = await apiFetch(`${BASE_URL}/events/${eventId}/tags/items`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "取得項目標籤失敗");
  }
  const data = await res.json();
  return data.labels ?? [];
}

export async function addItemTag(eventId: number, label: string): Promise<string[]> {
  const res = await apiPost(`${BASE_URL}/events/${eventId}/tags/items`, { label });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "新增項目標籤失敗");
  }
  const data = await res.json();
  return data.labels ?? [];
}

export async function deleteItemTag(eventId: number, label: string): Promise<void> {
  const res = await apiDelete(`${BASE_URL}/events/${eventId}/tags/items/${encodeURIComponent(label)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "刪除項目標籤失敗");
  }
}

export async function getCondTags(eventId: number): Promise<string[]> {
  const res = await apiFetch(`${BASE_URL}/events/${eventId}/tags/conds`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "取得條件標籤失敗");
  }
  const data = await res.json();
  return data.labels ?? [];
}

export async function addCondTag(eventId: number, label: string): Promise<string[]> {
  const res = await apiPost(`${BASE_URL}/events/${eventId}/tags/conds`, { label });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "新增條件標籤失敗");
  }
  const data = await res.json();
  return data.labels ?? [];
}

export async function deleteCondTag(eventId: number, label: string): Promise<void> {
  const res = await apiDelete(`${BASE_URL}/events/${eventId}/tags/conds/${encodeURIComponent(label)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "刪除條件標籤失敗");
  }
}

