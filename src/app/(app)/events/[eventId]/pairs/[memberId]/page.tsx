"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import IconButton from "@/components/ui/IconButton";
import { BackIcon } from "@/components/icons";
import { money } from "@/lib/formatters";
import { getEvent, type EventDetail } from "@/api/event";
import { getShares, type SharesResponse } from "@/api/settlement";

interface PairLine {
  label: string;
  dirText: string;
  amount: number;
}

// /events/{id} has the payer and the names; only /shares has who owes what, and
// after settlement that is the frozen snapshot rather than a live recount.
function pairLines(
  ev: EventDetail,
  shares: SharesResponse,
  meId: number,
  otherId: number,
): PairLine[] {
  const nameById = new Map(ev.members.map((m) => [m.id, m.display]));
  const me = nameById.get(meId) ?? `#${meId}`;
  const other = nameById.get(otherId) ?? `#${otherId}`;
  const owedByDetail = new Map(shares.per_detail.map((d) => [d.detail_id, d.shares]));
  const lines: PairLine[] = [];

  for (const item of ev.items ?? []) {
    for (const detail of item.details ?? []) {
      const owed = (id: number) =>
        owedByDetail.get(detail.id)?.find((s) => s.member_id === id)?.amount ?? 0;

      if (item.payer_member_id === meId && owed(otherId) > 0) {
        lines.push({ label: detail.name, dirText: `${me} 代墊 → ${other} 分攤`, amount: owed(otherId) });
      }
      if (item.payer_member_id === otherId && owed(meId) > 0) {
        lines.push({ label: detail.name, dirText: `${other} 代墊 → ${me} 分攤`, amount: -owed(meId) });
      }
    }
  }
  return lines;
}

export default function PairDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);
  const otherId = Number(params.memberId);

  const [data, setData] = useState<{ event: EventDetail; shares: SharesResponse } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getEvent(eventId), getShares(eventId)])
      .then(([event, shares]) => setData({ event, shares }))
      .catch((e) => setError(e instanceof Error ? e.message : "載入分攤明細失敗"));
  }, [eventId]);

  if (error) return <div className="page-shell">{error}</div>;
  if (!data) return <div className="page-shell">載入中…</div>;
  const { event, shares } = data;

  const me = event.members.find((m) => m.you);
  const other = event.members.find((m) => m.id === otherId);
  if (!me || !other) return <div className="page-shell">找不到人員</div>;

  const lines = pairLines(event, shares, me.id, other.id);
  const net = lines.reduce((sum, l) => sum + l.amount, 0);
  const title = net >= 0
    ? `${other.display} 應付給 ${me.display}`
    : `${me.display} 應付給 ${other.display}`;

  return (
    <div className="page-shell">
      <div className="topbar">
        <div className="topbar-row">
          <IconButton onClick={() => router.push(`/events/${eventId}`)}>
            <BackIcon />
          </IconButton>
          <span className="topbar-title">分攤明細</span>
        </div>
      </div>

      <div
        className="mt-12 flex between items-center gap-12"
        style={{ padding: "14px 20px", borderRadius: 8, background: "rgba(111,183,183,.12)" }}
      >
        <span style={{ fontSize: 24, fontWeight: 700 }}>{title}</span>
        <span style={{ flex: "none", fontSize: 24, fontWeight: 700, color: "var(--teal-hover)" }}>
          {money(Math.abs(net))}
        </span>
      </div>

      <div className="section-title mt-20">項目分攤明細</div>
      <div className="grid-cards mt-10">
        {lines.map((l, i) => (
          <div key={i} className="card card-pad flex between items-center gap-10">
            <span className="flex-col gap-4">
              <span className="fs16">{l.label}</span>
              <span className="fs12 text3">{l.dirText}</span>
            </span>
            <span className="fs16 fw700">{money(Math.abs(l.amount))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
