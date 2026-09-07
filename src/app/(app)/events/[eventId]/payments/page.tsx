"use client";

import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/store";
import Button from "@/components/ui/Button";
import { itemTotal, detailShares, computeTransfers } from "@/lib/calculations";
import { money } from "@/lib/formatters";

export default function PaymentsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);

  const members = useStore((s) => s.members);
  const itemsBy = useStore((s) => s.itemsBy);
  const rules = useStore((s) => s.rules);
  const openMenu = useStore((s) => s.openMenu);
  const paidBy2 = useStore((s) => s.paidBy2);
  const setPaidBy2 = useStore((s) => s.setPaidBy2);
  const events = useStore((s) => s.events);
  const setEvents = useStore((s) => s.setEvents);

  const items = itemsBy[eventId] || [];
  const totals: Record<string, number> = {};
  const paidByMap: Record<string, number> = {};
  members.forEach((m) => { totals[m.id] = 0; paidByMap[m.id] = 0; });
  items.forEach((it) => {
    const payer = members.find((m) => m.name === it.by);
    if (payer) paidByMap[payer.id] = (paidByMap[payer.id] || 0) + itemTotal(it);
    it.details.forEach((d) => {
      const shares = detailShares(d, members, rules);
      members.forEach((m) => {
        totals[m.id] = (totals[m.id] || 0) + (shares.map[m.id] || 0);
      });
    });
  });

  const transfers = computeTransfers(members, paidByMap, totals);
  const eventPaid = paidBy2[eventId] || {};

  const togglePaid = (key: string) => {
    const updated = { ...paidBy2, [eventId]: { ...eventPaid, [key]: !eventPaid[key] } };
    setPaidBy2(updated);
  };

  const handleArchive = () => {
    const updated = [...events];
    updated[eventId] = { ...updated[eventId], archived: true };
    setEvents(updated);
    router.push("/");
  };

  return (
    <div className="page-shell">
      <div className="topbar">
        <div className="topbar-row topbar-row--start">
          <button className="icon-btn hamburger" title="更多操作" onClick={openMenu}>
            <span /><span /><span />
          </button>
          <span className="topbar-title">繳款情況確認</span>
        </div>
      </div>

      <div className="grid-cards mt-10">
        {transfers.map((t) => (
          <div key={t.key} className="card card-pad flex between items-center gap-12">
            <span className="flex-col gap-4">
              <span className="fs14">{t.from.name} → {t.to.name}</span>
              <span className="fs12 text3">{eventPaid[t.key] ? "已繳清" : "未繳"}</span>
            </span>
            <span className="flex items-center gap-12">
              <span className="fs16 fw700">{money(Math.round(t.amount))}</span>
              {eventPaid[t.key] ? (
                <button
                  style={{
                    width: 20, height: 20, borderRadius: 99, border: "none",
                    background: "var(--teal)", color: "#fff", fontSize: 12,
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  }}
                  onClick={() => togglePaid(t.key)}
                >
                  ✓
                </button>
              ) : (
                <button
                  style={{
                    width: 20, height: 20, borderRadius: 99,
                    border: "1px solid var(--ln-control)", background: "#fff", cursor: "pointer",
                  }}
                  onClick={() => togglePaid(t.key)}
                />
              )}
            </span>
          </div>
        ))}
      </div>

      <Button className="mt-20" onClick={handleArchive}>
        已結清，封存活動
      </Button>
    </div>
  );
}
