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