import { BASE_URL } from "./constant";

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
  const res = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "建立活動失敗");
  }

  return res.json();
}

export interface EventDetailMember {
  id: number;
  display: string;
  role: string;
  tags: string[];
  guest: boolean;
  you: boolean;
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
  const res = await fetch(`${BASE_URL}/events/${id}`, {
    credentials: "include",
  });

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
  const res = await fetch(`${BASE_URL}/events/${eventId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "新增款項失敗");
  }

  return res.json();
}

export async function getEvents(): Promise<EventListItem[]> {
    const res = await fetch(`${BASE_URL}/events`, {
      credentials: "include",
    });
  
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "取得活動列表失敗");
    }
  
    const data = await res.json();
    return data.events ?? [];
  }