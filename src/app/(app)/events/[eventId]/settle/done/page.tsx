"use client";

import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/store";
import Button from "@/components/ui/Button";
import { itemTotal, detailShares, computeTransfers } from "@/lib/calculations";
import { money } from "@/lib/formatters";
import type { FlowRow } from "@/lib/types";

export default function SettleDonePage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);

  const events = useStore((s) => s.events);
  const itemsBy = useStore((s) => s.itemsBy);
  const members = useStore((s) => s.members);
  const rules = useStore((s) => s.rules);
  const transferNote = useStore((s) => s.transferNote);
  const copiedReport = useStore((s) => s.copiedReport);
  const setCopiedReport = useStore((s) => s.setCopiedReport);

  const ev = events[eventId];
  const items = itemsBy[eventId] || [];
  const totalAmount = items.reduce((a, it) => a + itemTotal(it), 0);

  const totals: Record<string, number> = {};
  const paidBy: Record<string, number> = {};
  members.forEach((m) => { totals[m.id] = 0; paidBy[m.id] = 0; });
  items.forEach((it) => {
    const payer = members.find((m) => m.name === it.by);
    if (payer) paidBy[payer.id] = (paidBy[payer.id] || 0) + itemTotal(it);
    it.details.forEach((d) => {
      const shares = detailShares(d, members, rules);
      members.forEach((m) => {
        totals[m.id] = (totals[m.id] || 0) + (shares.map[m.id] || 0);
      });
    });
  });

  const transfers = computeTransfers(members, paidBy, totals);
  const flowRows: FlowRow[] = members.map((m) => {
    const lines = transfers
      .filter((t) => t.from.id === m.id || t.to.id === m.id)
      .map((t) => ({
        text: t.from.id === m.id ? `→ 付給 ${t.to.name}` : `← 收自 ${t.from.name}`,
        amount: money(Math.round(t.amount)),
      }));
    const net = (paidBy[m.id] || 0) - (totals[m.id] || 0);
    return {
      name: m.name,
      role: m.role,
      lines,
      summaryLabel: net >= 0 ? "應收回" : "應付出",
      summary: money(Math.abs(Math.round(net))),
      positive: net >= 0,
      negative: net < 0,
    };
  });

  const handleCopyReport = () => {
    const text = flowRows
      .map((r) => `${r.name}（${r.role}）: ${r.summaryLabel} ${r.summary}`)
      .join("\n");
    navigator.clipboard?.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="page-shell">
      <div className="flex-col items-center">
        <div
          style={{
            width: 56, height: 56, borderRadius: 99, background: "var(--teal)",
            color: "#fff", fontSize: 32, display: "flex", alignItems: "center",
            justifyContent: "center", fontWeight: 700,
          }}
        >
          ✓
        </div>
        <div className="mt-16" style={{ fontSize: 24, fontWeight: 700 }}>分帳已產出</div>
        <div className="mt-6 fs14">
          {ev?.name} · 合計 {money(totalAmount)}
        </div>
      </div>

      <div
        className="mt-20"
        style={{
          padding: "16px 20px", borderRadius: 8,
          background: "rgba(111,183,183,.10)", fontSize: 14, lineHeight: 1.7,
        }}
      >
        {transferNote}
      </div>

      <div className="card mt-16" style={{ padding: "16px 20px" }}>
        <div className="flex between items-center">
          <span className="section-title">人員付款流向</span>
          <button
            className="btn-pill"
            style={{ fontSize: 12, padding: "6px 12px" }}
            onClick={handleCopyReport}
          >
            {copiedReport ? "已複製" : "複製報告"}
          </button>
        </div>
        <div
          className="mt-12"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,235px),1fr))",
            gap: 16,
          }}
        >
          {flowRows.map((row) => (
            <div key={row.name} className="card" style={{ padding: "14px 16px" }}>
              <div className="flex between items-center gap-10">
                <span className="fs16 fw500">{row.name}</span>
                <span className="pill-neutral">{row.role}</span>
              </div>
              <div className="flex-col gap-8 mt-10">
                {row.lines.map((l, i) => (
                  <div key={i} className="flex between" style={{ alignItems: "baseline", gap: 10 }}>
                    <span className="fs14 text2">{l.text}</span>
                    <span className="fs14 fw500" style={{ flex: "none" }}>{l.amount}</span>
                  </div>
                ))}
              </div>
              <div
                className="flex between"
                style={{
                  alignItems: "baseline", gap: 10, marginTop: 10, paddingTop: 10,
                  borderTop: "1px solid var(--ln-control)",
                }}
              >
                <span className="fs12 text2">{row.summaryLabel}</span>
                <span
                  style={{
                    fontSize: 16, fontWeight: 700,
                    color: row.positive ? "var(--receive)" : "var(--owe)",
                  }}
                >
                  {row.summary}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button className="mt-12" onClick={() => router.push(`/events/${eventId}/settled`)}>
        返回活動頁
      </Button>
    </div>
  );
}
