"use client";

import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/store";
import IconButton from "@/components/ui/IconButton";
import { BackIcon } from "@/components/icons";
import { itemTotal, detailShares } from "@/lib/calculations";
import { money } from "@/lib/formatters";

export default function PairDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);
  const memberId = params.memberId as string;

  const members = useStore((s) => s.members);
  const itemsBy = useStore((s) => s.itemsBy);
  const rules = useStore((s) => s.rules);

  const me = members[0];
  const other = members.find((m) => m.id === memberId);
  if (!me || !other) return <div className="page-shell">找不到人員</div>;

  const items = itemsBy[eventId] || [];

  const lines: { label: string; dirText: string; amount: string }[] = [];
  let netAmount = 0;

  items.forEach((it) => {
    const payer = members.find((m) => m.name === it.by);
    it.details.forEach((d) => {
      const shares = detailShares(d, members, rules);
      const myShare = shares.map[me.id] || 0;
      const otherShare = shares.map[other.id] || 0;

      if (payer?.id === me.id && otherShare > 0) {
        lines.push({
          label: d.name,
          dirText: `${me.name} 代墊 → ${other.name} 分攤`,
          amount: money(Math.round(otherShare)),
        });
        netAmount += otherShare;
      }
      if (payer?.id === other.id && myShare > 0) {
        lines.push({
          label: d.name,
          dirText: `${other.name} 代墊 → ${me.name} 分攤`,
          amount: money(Math.round(myShare)),
        });
        netAmount -= myShare;
      }
    });
  });

  const title = netAmount >= 0
    ? `${other.name} 應付給 ${me.name}`
    : `${me.name} 應付給 ${other.name}`;

  return (
    <div className="page-shell">
      <div className="topbar">
        <div className="topbar-row">
          <IconButton onClick={() => router.push(`/events/${eventId}/settled`)}>
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
          {money(Math.abs(Math.round(netAmount)))}
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
            <span className="fs16 fw700">{l.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
