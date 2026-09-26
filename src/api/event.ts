import { BASE_URL, apiFetch, apiPost, apiPatch, apiDelete } from "./constant";
import { EventDetailMember } from "./mombers";
import type { Rule, RuleGroup } from "@/lib/types";

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
  amount: number;
  tag: string;
  note: string;
  ordinal: number;
  custom_amounts?: Record<string, number>;
  custom_shares?: Record<string, number>;
  allocation?: {
    shares: { member_id: number; amount: number }[];
    excluded: { member_id: number; amount: number }[];
  };
}

export interface EventDetailItem {
  id: number;
  payer_member_id: number;
  author_member_id: number;
  has_receipt: boolean;
  total?: number;
  total_cents?: number;
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
  total?: number;
  total_cents?: number;
  transfer_note?: string;
  members: EventDetailMember[];
  items: EventDetailItem[];
}

export interface JoinEventRequest {
  code: string;
  name?: string;
  note?: string;
  cond_tags?: string[];
}

export interface JoinEventResponse {
  event_id: number;
  name: string;
  role: string;
}

export async function joinEvent(body: JoinEventRequest): Promise<JoinEventResponse> {
  const res = await apiPost(`${BASE_URL}/events/join`, body);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 404) throw new Error("找不到此邀請碼，請確認後再試");
    if (res.status === 410) throw new Error("此活動已結算，無法再加入");
    throw new Error(data.error ?? "加入活動失敗");
  }
  return res.json();
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
  amount?: number;
  tag?: string;
  note?: string;
  custom_amounts?: Record<string, number>;
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

export async function getItem(eventId: number, itemId: number): Promise<EventDetailItem> {
  const res = await apiFetch(`${BASE_URL}/events/${eventId}/items/${itemId}`);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 404) throw new Error("款項不存在");
    throw new Error(data.error ?? "取得款項失敗");
  }

  return res.json();
}

export interface UpdateItemRequest {
  payer_member_id?: number;
  has_receipt?: boolean;
  details?: CreateDetailRequest[];
}

export async function updateItem(eventId: number, itemId: number, body: UpdateItemRequest): Promise<EventDetailItem> {
  const res = await apiPatch(`${BASE_URL}/events/${eventId}/items/${itemId}`, body);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "更新款項失敗");
  }

  return res.json();
}

export async function deleteItem(eventId: number, itemId: number): Promise<void> {
  const res = await apiDelete(`${BASE_URL}/events/${eventId}/items/${itemId}`);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "刪除款項失敗");
  }
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

// Archive

export async function archiveEvent(eventId: number): Promise<void> {
  const res = await apiPost(`${BASE_URL}/events/${eventId}/archive`, {});
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "封存活動失敗");
  }
}

// Rules

interface ApiRuleGroup {
  conds?: string[];
  mode?: "weight" | "exclude";
  weight?: number;
}

/** The API carries a numeric `weight`; the UI binds a `wt` text field. */
function groupFromApi(group: ApiRuleGroup): RuleGroup {
  return {
    conds: group.conds ?? [],
    mode: group.mode === "exclude" ? "exclude" : "weight",
    wt: group.weight === undefined ? "" : String(group.weight),
  };
}

function groupToApi(group: RuleGroup): ApiRuleGroup {
  const conds = group.conds ?? [];
  if (group.mode === "exclude") return { conds, mode: "exclude" };
  // An omitted weight lets the server apply its own default of 1.
  const weight = Number((group.wt ?? "").trim());
  return (group.wt ?? "").trim() === "" || !Number.isFinite(weight)
    ? { conds, mode: "weight" }
    : { conds, mode: "weight", weight };
}

function restFromApi(rest: ApiRuleGroup | undefined | null): Rule["rest"] {
  if (!rest) return undefined;
  const { mode, wt } = groupFromApi(rest);
  return { mode, wt };
}

function restToApi(rest: Rule["rest"] | null | undefined): ApiRuleGroup | null {
  if (!rest) return null;
  const { mode, weight } = groupToApi({ conds: [], ...rest });
  return mode === "exclude" ? { mode } : { mode, ...(weight === undefined ? {} : { weight }) };
}

function mapRuleFromApi(dto: Record<string, unknown>): Rule {
  return {
    id: dto.id as number,
    tag: dto.item_tag as string,
    ordinal: dto.ordinal as number | undefined,
    groups: ((dto.groups as ApiRuleGroup[]) ?? []).map(groupFromApi),
    rest: restFromApi(dto.rest as ApiRuleGroup | undefined),
  };
}

export async function getRules(eventId: number): Promise<Rule[]> {
  const res = await apiFetch(`${BASE_URL}/events/${eventId}/rules`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "取得分攤規則失敗");
  }
  const data = await res.json();
  return (data.rules ?? []).map(mapRuleFromApi);
}

export async function createRule(
  eventId: number,
  rule: { tag: string; groups?: RuleGroup[]; rest?: Rule["rest"] | null },
): Promise<Rule> {
  const res = await apiPost(`${BASE_URL}/events/${eventId}/rules`, {
    item_tag: rule.tag,
    groups: (rule.groups ?? []).map(groupToApi),
    rest: restToApi(rule.rest),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "新增分攤規則失敗");
  }
  return mapRuleFromApi(await res.json());
}

export async function updateRuleApi(
  eventId: number,
  ruleId: number,
  body: { groups?: RuleGroup[]; rest?: Rule["rest"] | null },
): Promise<Rule> {
  const res = await apiPatch(`${BASE_URL}/events/${eventId}/rules/${ruleId}`, {
    ...(body.groups === undefined ? {} : { groups: body.groups.map(groupToApi) }),
    ...(body.rest === undefined ? {} : { rest: restToApi(body.rest) }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "更新分攤規則失敗");
  }
  return mapRuleFromApi(await res.json());
}

export async function deleteRuleApi(eventId: number, ruleId: number): Promise<void> {
  const res = await apiDelete(`${BASE_URL}/events/${eventId}/rules/${ruleId}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "刪除分攤規則失敗");
  }
}

