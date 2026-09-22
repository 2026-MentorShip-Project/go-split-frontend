import type { EventDetail, EventDetailItem } from "@/api/event";
import type { MemberShare, SharesResponse, Transfer, TransfersResponse } from "@/api/settlement";
import { roleFromApi } from "@/api/mombers";

export interface SettlementItemRow {
  id: number;
  label: string;
  amount: number;
}

export interface SettlementSplitRow {
  memberId: number;
  name: string;
  role: string;
  tags: string[];
  owed: number;
  advanced: number;
}

export interface SettlementFlowLine {
  text: string;
  amount: number;
}

export interface SettlementFlowRow {
  memberId: number;
  name: string;
  role: string;
  lines: SettlementFlowLine[];
  net: number;
}

export interface SettlementPreview {
  eventName: string;
  settled: boolean;
  myRole: string;
  transferNote: string;
  grandTotal: number;
  items: SettlementItemRow[];
  splits: SettlementSplitRow[];
  flows: SettlementFlowRow[];
}

/** Swagger money fields are whole NT dollars. `total_cents` is only a leftover key, same unit. */
export function ntdollars(...candidates: Array<number | undefined>): number {
  return candidates.find((value): value is number => typeof value === "number") ?? 0;
}

function itemAmount(item: EventDetailItem): number {
  return ntdollars(item.total, item.total_cents);
}

function memberName(
  membersById: Map<number, { display: string }>,
  id: number,
): string {
  return membersById.get(id)?.display ?? `#${id}`;
}

export function buildSettlementPreview(
  event: EventDetail,
  shares: SharesResponse,
  transfers: TransfersResponse,
): SettlementPreview {
  const membersById = new Map(event.members.map((m) => [m.id, m]));
  const shareByMemberId = new Map<number, MemberShare>(
    (shares.per_member ?? []).map((row) => [row.member_id, row]),
  );
  const transferList: Transfer[] = transfers.transfers ?? [];

  const items: SettlementItemRow[] = (event.items ?? []).map((item) => ({
    id: item.id,
    label: (item.details ?? []).map((d) => d.name).filter(Boolean).join("、") || "（未命名）",
    amount: itemAmount(item),
  }));

  const splits: SettlementSplitRow[] = event.members.map((m) => {
    const share = shareByMemberId.get(m.id);
    return {
      memberId: m.id,
      name: m.display,
      role: roleFromApi(m.role),
      tags: m.tags ?? [],
      owed: share?.owed ?? 0,
      advanced: share?.advanced ?? 0,
    };
  });

  const flows: SettlementFlowRow[] = event.members.map((m) => {
    const share = shareByMemberId.get(m.id);
    const lines = transferList
      .filter((t) => t.from_id === m.id || t.to_id === m.id)
      .map((t) => ({
        text: t.from_id === m.id
          ? `→ 付給 ${memberName(membersById, t.to_id)}`
          : `← 收自 ${memberName(membersById, t.from_id)}`,
        amount: t.amount,
      }));
    return {
      memberId: m.id,
      name: m.display,
      role: roleFromApi(m.role),
      lines,
      net: share?.net ?? 0,
    };
  });

  return {
    eventName: event.name,
    settled: event.settled,
    myRole: event.my_role,
    transferNote: event.transfer_note ?? "",
    grandTotal: shares.grand_total != null
      ? shares.grand_total
      : ntdollars(event.total, event.total_cents),
    items,
    splits,
    flows,
  };
}
