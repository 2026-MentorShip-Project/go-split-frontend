"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import Chip from "@/components/ui/Chip";
import { itemTotal, detailShares, computeTransfers } from "@/lib/calculations";
import { money } from "@/lib/formatters";
import type { FlowRow } from "@/lib/types";

export default function ArchivedPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);

  const events = useStore((s) => s.events);
  const itemsBy = useStore((s) => s.itemsBy);
  const members = useStore((s) => s.members);
  const rules = useStore((s) => s.rules);
  const openMenu = useStore((s) => s.openMenu);
  const evInfoCollapsed = useStore((s) => s.evInfoCollapsed);
  const setEvInfoCollapsed = useStore((s) => s.setEvInfoCollapsed);
  const setSel = useStore((s) => s.setSel);

  const ev = events[eventId];
  if (!ev) return <div className="page-shell">活動不存在</div>;

  const items = itemsBy[eventId] || [];
  const evName = ev.name;
  const evDate = ev.date;
  const evPlace = ev.place;
  const roleLabel = ev.role === "host" ? "主辦者" : ev.role === "co" ? "協辦者" : "參與者";
  const myTags = members[0]?.tags || [];

  const totalAmount = items.reduce((a, it) => a + itemTotal(it), 0);

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
  const flowRows: FlowRow[] = members.map((m) => {
    const lines = transfers
      .filter((t) => t.from.id === m.id || t.to.id === m.id)
      .map((t) => ({
        text: t.from.id === m.id ? `→ 付給 ${t.to.name}` : `← 收自 ${t.from.name}`,
        amount: money(Math.round(t.amount)),
      }));
    const net = (paidByMap[m.id] || 0) - (totals[m.id] || 0);
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

  return (
    <div className="page-shell">
      <div className="topbar">
        <div className="topbar-row">
          <button className="icon-btn hamburger" title="更多操作" onClick={openMenu}>
            <span /><span /><span />
          </button>
          <span className="topbar-title">{evName}</span>
          <span className="pill-archived" style={{ marginLeft: "auto" }}>已封存</span>
        </div>
      </div>

      {/* Event Info Card */}
      <div className="card mt-16" style={{ padding: "16px 20px" }}>
        <div className="flex items-start gap-12">
          <div className="grow flex items-center gap-12 wrap" style={{ alignItems: "baseline" }}>
            <span style={{ flex: "none", fontSize: 16, color: "var(--text)", minWidth: 72, fontWeight: 500 }}>
              時間地點
            </span>
            <span className="fs14">{evDate} · {evPlace}</span>
          </div>
          <button
            className="icon-btn"
            title={evInfoCollapsed ? "展開" : "收合"}
            style={{ width: 32, height: 32, fontSize: 30, margin: "-4px -6px 0 0" }}
            onClick={() => setEvInfoCollapsed(!evInfoCollapsed)}
          >
            {evInfoCollapsed ? "›" : "⌄"}
          </button>
        </div>
        {evInfoCollapsed ? (
          <div className="flex items-center gap-6 wrap mt-12">
            <span className="pill-neutral">{roleLabel}</span>
            {myTags.filter((t) => t !== "無標籤").map((t) => (
              <Chip key={t} label={t} kind="cond" hash />
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-12 wrap mt-12">
              <span style={{ flex: "none", fontSize: 16, color: "var(--text)", minWidth: 72, fontWeight: 500 }}>身份</span>
              <span className="pill-neutral">{roleLabel}</span>
            </div>
            <div className="flex items-center gap-12 wrap mt-12">
              <span style={{ flex: "none", fontSize: 16, color: "var(--text)", minWidth: 72, fontWeight: 500 }}>人員條件</span>
              <span className="flex items-center gap-6 wrap">
                {myTags.length === 0 ? (
                  <span className="fs12 text3">無特殊條件</span>
                ) : (
                  myTags.map((t) => <Chip key={t} label={t} kind="cond" hash />)
                )}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Items */}
      <div className="mt-20 flex items-baseline between wrap gap-6">
        <span className="section-title">款項現況</span>
        <span className="flex gap-8 wrap" style={{ justifyContent: "flex-end" }}>
          <span className="fs14">合計 {money(totalAmount)}</span>
          <span className="fs14">｜</span>
          <span className="fs14">應分攤 {money(totalAmount)}</span>
          <span className="fs14">｜</span>
          <span className="fs14">已代墊 {money(totalAmount)}</span>
        </span>
      </div>
      <div className="grid-cards mt-10">
        {items.map((it, idx) => {
          const total = itemTotal(it);
          return (
            <button
              key={it.id}
              className="card card-pad"
              style={{ width: "100%", textAlign: "left", cursor: "pointer" }}
              onClick={() => {
                setSel(idx);
                router.push(`/events/${eventId}/items/${idx}`);
              }}
            >
              <div className="flex between items-start gap-10">
                <span className="grow fs16 fw500">{it.by} 代墊</span>
                <span style={{ flex: "0 1 auto", maxWidth: "55%", textAlign: "right" }} className="fs16 fw500">
                  {money(total)}
                </span>
              </div>
              <div className="mt-6 fs12 text2">
                {it.by} 代墊 · 明細 {it.details.length} 筆
              </div>
              <div className="mt-10 flex wrap gap-8 items-center" style={{ minHeight: 23 }}>
                {it.details.flatMap((d) => d.tags).filter((v, i, a) => a.indexOf(v) === i).map((t) => (
                  <Chip key={t} label={t} kind="item" />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Person Splits */}
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
                  {money(Math.round(paidByMap[m.id] || 0))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Flow Rows */}
      <div className="section-title mt-24">人員付款流向</div>
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
    </div>
  );
}
