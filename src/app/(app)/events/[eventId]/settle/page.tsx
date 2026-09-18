"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import SegmentedTabs from "@/components/ui/SegmentedTabs";
import Chip from "@/components/ui/Chip";
import { itemTotal, detailShares, computeTransfers } from "@/lib/calculations";
import { money, num } from "@/lib/formatters";
import type { FlowRow } from "@/lib/types";

export default function SettlePage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);

  const itemsBy = useStore((s) => s.itemsBy);
  const members = useStore((s) => s.members);
  const rules = useStore((s) => s.rules);
  const settleTab = useStore((s) => s.settleTab);
  const setSettleTab = useStore((s) => s.setSettleTab);
  const transferNote = useStore((s) => s.transferNote);
  const setTransferNote = useStore((s) => s.setTransferNote);
  const openMenu = useStore((s) => s.openMenu);
  const setSettled = useStore((s) => s.setSettled);

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

  const handleSettle = () => {
    setSettled(true);
    router.push(`/events/${eventId}/settle/done`);
  };

  return (
    <div className="page-shell">
      <div className="topbar">
        <div className="topbar-row topbar-row--start">
          <button className="icon-btn hamburger" title="更多操作" onClick={openMenu}>
            <span /><span /><span />
          </button>
          <span className="topbar-title">分帳產出</span>
        </div>
      </div>

      <div className="mt-14">
        <SegmentedTabs
          tabs={[
            { label: "分帳", active: settleTab === "split", onClick: () => setSettleTab("split") },
            { label: "活動", active: settleTab === "event", onClick: () => setSettleTab("event") },
          ]}
        />
      </div>

      {settleTab === "event" && (
        <>
          <div className="section-title mt-20">全部款項</div>
          <div className="card mt-10" style={{ padding: 20 }}>
            <div className="section-title">款項現況</div>
            <div
              className="mt-12"
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 16 }}
            >
              {items.map((it) => (
                <div key={it.id} className="flex between items-center">
                  <span className="fs14">{it.details.map((d) => d.name).join("、")}</span>
                  <span className="fs14 fw500">{money(itemTotal(it))}</span>
                </div>
              ))}
            </div>
            <div
              className="flex"
              style={{
                justifyContent: "flex-end", alignItems: "baseline", gap: 10,
                marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--ln-control)",
              }}
            >
              <span className="fs14 text3">合計</span>
              <span style={{ fontSize: 24, fontWeight: 700 }}>{money(totalAmount)}</span>
            </div>
          </div>

          <div className="section-title mt-24">人員分攤結果</div>
          <div className="grid-cards grid-cards--sm mt-10">
            {members.map((m) => (
              <div key={m.id} className="card" style={{ padding: "16px 20px" }}>
                <div className="flex between items-center gap-10">
                  <span className="fs16 fw500">{m.name}</span>
                  <span className="pill-neutral">{m.role}</span>
                </div>
                {m.tags.length > 0 && (
                  <div className="mt-8 fs12" style={{ color: "var(--tag-cond-fg)" }}>
                    {m.tags.map((t) => `#${t}`).join(" ")}
                  </div>
                )}
                <div className="flex-col gap-12 mt-12" style={{ paddingTop: 12, borderTop: "1px solid var(--ln-control)" }}>
                  <div>
                    <div className="fs12 text2">分攤金額</div>
                    <div className="mt-4" style={{ fontSize: 18, fontWeight: 700, wordBreak: "break-all" }}>
                      {money(Math.round(totals[m.id] || 0))}
                    </div>
                  </div>
                  <div>
                    <div className="fs12 text2">代墊金額</div>
                    <div className="mt-4" style={{ fontSize: 18, fontWeight: 700, wordBreak: "break-all" }}>
                      {money(Math.round(paidBy[m.id] || 0))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {settleTab === "split" && (
        <>
          <div className="section-title mt-20">人員付款流向</div>
          <div className="grid-cards grid-cards--sm mt-10">
            {flowRows.map((row) => (
              <div key={row.name} className="card" style={{ padding: "16px 20px" }}>
                <div className="flex between items-center gap-10">
                  <span className="fs16 fw500">{row.name}</span>
                  <span className="pill-neutral">{row.role}</span>
                </div>
                <div className="flex-col gap-8 mt-12">
                  {row.lines.map((l, i) => (
                    <div key={i} className="flex between" style={{ alignItems: "baseline", gap: 10 }}>
                      <span className="fs14 text2" style={{ whiteSpace: "nowrap", flex: "none" }}>{l.text}</span>
                      <span className="grow fs14" style={{ textAlign: "right" }}>{l.amount}</span>
                    </div>
                  ))}
                </div>
                <div
                  className="flex between"
                  style={{
                    alignItems: "baseline", gap: 10, marginTop: 12, paddingTop: 12,
                    borderTop: "1px solid var(--ln-control)",
                  }}
                >
                  <span className="fs12 text3" style={{ whiteSpace: "nowrap", flex: "none" }}>{row.summaryLabel}</span>
                  <span
                    className="grow"
                    style={{
                      textAlign: "right", fontSize: 18, fontWeight: 700,
                      color: row.positive ? "var(--receive)" : "var(--owe)",
                    }}
                  >
                    {row.summary}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="section-title mt-24">留言</div>
          <div className="mt-10">
            <textarea
              className="input"
              rows={3}
              style={{ lineHeight: 1.6 }}
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
            />
          </div>
        </>
      )}

      <div className="bottom-cta">
        <button className="btn btn-primary btn-cta-lg" onClick={handleSettle}>
          確認結帳產出
        </button>
      </div>
    </div>
  );
}
