"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/store";
import Chip from "@/components/ui/Chip";
import { itemTotal, detailShares, computeTransfers } from "@/lib/calculations";
import { money, fmtIsoDatetime } from "@/lib/formatters";
import { getEvent, type EventDetail } from "@/api/event";
import { roleFromApi } from "@/api/mombers";

export default function SettledEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);

  const itemsBy = useStore((s) => s.itemsBy);
  const members = useStore((s) => s.members);
  const rules = useStore((s) => s.rules);
  const openMenu = useStore((s) => s.openMenu);
  const evInfoCollapsed = useStore((s) => s.evInfoCollapsed);
  const setEvInfoCollapsed = useStore((s) => s.setEvInfoCollapsed);
  const transferNote = useStore((s) => s.transferNote);
  const paidBy2 = useStore((s) => s.paidBy2);
  const setPaidAsk = useStore((s) => s.setPaidAsk);
  const setSel = useStore((s) => s.setSel);

  const [evData, setEvData] = useState<EventDetail | null>(null);
  useEffect(() => {
    void getEvent(eventId).then(setEvData).catch(() => {});
  }, [eventId]);

  if (!evData) return <div className="page-shell">載入中…</div>;

  const items = itemsBy[eventId] || [];
  const evName = evData.name;
  const evDate = fmtIsoDatetime(evData.starts_at);
  const evPlace = evData.place;
  const roleLabel = roleFromApi(evData.my_role);
  const myTags = members[0]?.tags || [];

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

  const me = members[0];
  const transfers = computeTransfers(members, paidByMap, totals);
  const myTransfers = transfers.filter((t) => t.from.id === me?.id || t.to.id === me?.id);
  const myNet = (paidByMap[me?.id] || 0) - (totals[me?.id] || 0);
  const eventPaid = paidBy2[eventId] || {};

  const myFlow = {
    hasLines: myTransfers.length > 0,
    lines: myTransfers.map((t) => ({
      text: t.from.id === me.id ? `→ 付給 ${t.to.name}` : `← 收自 ${t.from.name}`,
      amount: money(Math.round(t.amount)),
      open: () => {
        const otherId = t.from.id === me.id ? t.to.id : t.from.id;
        const memberIdx = members.findIndex((m) => m.id === otherId);
        router.push(`/events/${eventId}/pairs/${otherId}`);
      },
    })),
    summaryLabel: myNet >= 0 ? "應收回" : "應付出",
    summary: money(Math.abs(Math.round(myNet))),
    positive: myNet >= 0,
  };

  const myUnpaid = myNet < -0.5;
  const myPaid = myTransfers.length > 0 && myTransfers.every((t) => {
    if (t.from.id !== me.id) return true;
    return eventPaid[t.key];
  });
  const myReceiving = myNet > 0.5;

  return (
    <div className="page-shell">
      <div className="topbar">
        <div className="topbar-row topbar-row--start">
          <button className="icon-btn hamburger" title="更多操作" onClick={openMenu}>
            <span /><span /><span />
          </button>
          <span className="topbar-title">{evName}</span>
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
            <span className="pill-dark">已結帳</span>
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

      {/* My Flow — visible to host/co only */}
      {(evData.my_role === "host" || evData.my_role === "co") && (
        <div className="card mt-20" style={{ padding: 20 }}>
          <div className="section-title">我的付款流向</div>
          <div className="flex-col gap-8 mt-14">
            {myFlow.hasLines ? (
              myFlow.lines.map((l, i) => (
                <button
                  key={i}
                  className="card"
                  style={{
                    width: "100%", textAlign: "left", padding: "14px 16px", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                  }}
                  onClick={l.open}
                >
                  <span className="fs14">{l.text}</span>
                  <span className="flex items-center gap-8">
                    <span className="fs16 fw700">{l.amount}</span>
                    <span className="text3">›</span>
                  </span>
                </button>
              ))
            ) : (
              <div className="fs14 text3">你的款項已平衡，無需轉帳</div>
            )}
          </div>
          <div
            className="flex between"
            style={{
              alignItems: "baseline", gap: 10, marginTop: 14, paddingTop: 12,
              borderTop: "1px solid var(--ln-control)",
            }}
          >
            <span className="fs12 text3">{myFlow.summaryLabel}</span>
            <span
              style={{
                fontSize: 18, fontWeight: 700,
                color: myFlow.positive ? "var(--receive)" : "var(--owe)",
              }}
            >
              {myFlow.summary}
            </span>
          </div>
        </div>
      )}

      {/* Transfer Note */}
      <div
        className="mt-14"
        style={{
          padding: "16px 20px", borderRadius: 8,
          background: "rgba(111,183,183,.10)", fontSize: 14, lineHeight: 1.7,
        }}
      >
        {transferNote}
      </div>

      {/* Payment Status */}
      {myPaid && (
        <div
          className="mt-14"
          style={{
            width: "100%", padding: 16, borderRadius: 8,
            background: "var(--text)", color: "#fff", fontSize: 16, textAlign: "center",
          }}
        >
          ✓ 已確認繳清
        </div>
      )}
      {!myPaid && myUnpaid && (
        <button
          className="btn mt-14"
          style={{ border: "1px solid var(--teal)", background: "#fff", color: "var(--teal-hover)" }}
          onClick={() => setPaidAsk(true)}
        >
          確認已繳清
        </button>
      )}
      {!myPaid && !myUnpaid && myReceiving && (
        <div
          className="mt-14"
          style={{
            width: "100%", padding: 16, borderRadius: 8,
            background: "var(--bg-neutral)", color: "var(--text3)", fontSize: 14, textAlign: "center",
          }}
        >
          等待對方確認繳款中…
        </div>
      )}

      {/* Items */}
      <div className="section-title mt-20">款項現況（結帳不可編輯）</div>
      <div className="grid-cards mt-10">
        {items.map((it, idx) => (
          <button
            key={it.id}
            className="card card-pad"
            style={{
              width: "100%", textAlign: "left", cursor: "pointer",
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
            }}
            onClick={() => {
              setSel(idx);
              router.push(`/events/${eventId}/items/${idx}`);
            }}
          >
            <span className="flex-col gap-6">
              <span className="fs14">{it.details.map((d) => d.name).join("、")}</span>
              <span className="fs12 text3">{it.by} 代墊 · 明細 {it.details.length} 筆</span>
            </span>
            <span className="flex items-center gap-8" style={{ flex: "none" }}>
              <span className="fs14 fw500 text2">{money(itemTotal(it))}</span>
              <span className="text3">›</span>
            </span>
          </button>
        ))}
      </div>
      {items.length === 0 && <div className="empty-box">尚無款項</div>}
    </div>
  );
}
