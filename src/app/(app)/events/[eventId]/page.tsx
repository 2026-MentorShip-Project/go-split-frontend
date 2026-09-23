"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/store";
import { useShallow } from "zustand/shallow";
import Chip from "@/components/ui/Chip";
import IconButton from "@/components/ui/IconButton";
import { PlusIcon } from "@/components/icons";
import { money, fmtIsoDatetime } from "@/lib/formatters";
import { ntdollars } from "@/lib/settlement";
import { getEvent, type EventDetail } from "@/api/event";
import { getShares, getTransfers, type SharesResponse, type TransfersResponse } from "@/api/settlement";

export default function EventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);

  const { evInfoCollapsed, setEvInfoCollapsed, openMenu } = useStore(
    useShallow((s) => ({
      evInfoCollapsed: s.evInfoCollapsed,
      setEvInfoCollapsed: s.setEvInfoCollapsed,
      openMenu: s.openMenu,
    }))
  );

  const [ev, setEv] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settlementData, setSettlementData] = useState<{
    shares: SharesResponse;
    transfers: TransfersResponse;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setSettlementData(null);
      try {
        const event = await getEvent(eventId);
        if (cancelled) return;
        setEv(event);

        if (event.settled) {
          try {
            const [shares, transfers] = await Promise.all([
              getShares(eventId),
              getTransfers(eventId),
            ]);
            if (!cancelled) setSettlementData({ shares, transfers });
          } catch {
            // Settlement data is supplementary; flow section won't show
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "取得活動失敗");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [eventId]);

  if (loading) return <div className="page-shell">載入中…</div>;
  if (error || !ev) return <div className="page-shell">{error ?? "活動不存在"}</div>;

  const myRole = ev.my_role;
  const roleLabel = myRole === "host" ? "主辦者" : myRole === "co" ? "協辦者" : "參與者";
  const canAddItem = !ev.settled && (myRole === "host" || myRole === "co");

  const me = ev.members.find((m) => m.you);
  const myTags = me?.tags ?? [];
  const noMyTags = myTags.length === 0;

  const memberById = Object.fromEntries(ev.members.map((m) => [m.id, m]));

  // Settlement flow data (host/co only)
  let myFlowLines: { text: string; amount: number; otherId: number }[] = [];
  let myNet = 0;
  const showFlow = ev.settled && settlementData && me;

  if (showFlow) {
    const myShare = settlementData.shares.per_member.find((s) => s.member_id === me.id);
    myNet = myShare?.net ?? 0;

    myFlowLines = (settlementData.transfers.transfers ?? [])
      .filter((t) => t.from_id === me.id || t.to_id === me.id)
      .map((t) => ({
        text: t.from_id === me.id
          ? `→ 付給 ${memberById[t.to_id]?.display ?? `#${t.to_id}`}`
          : `← 收自 ${memberById[t.from_id]?.display ?? `#${t.from_id}`}`,
        amount: t.amount,
        otherId: t.from_id === me.id ? t.to_id : t.from_id,
      }));
  }

  return (
    <div className="page-shell">
      <div className="topbar">
        <div className="topbar-row topbar-row--start">
          <button className="icon-btn hamburger" title="更多操作" onClick={openMenu}>
            <span /><span /><span />
          </button>
          <span className="topbar-title">{ev.name}</span>
          {canAddItem && (
            <IconButton
              variant="primary"
              title="新增款項"
              onClick={() => router.push(`/events/${eventId}/items/new`)}
              style={{ marginLeft: "auto" }}
            >
              <PlusIcon size={18} />
            </IconButton>
          )}
        </div>
      </div>

      {/* Event Info Card */}
      <div className="card mt-16" style={{ padding: "16px 20px" }}>
        <div className="flex items-start gap-12">
          <div className="grow flex items-center gap-12 wrap" style={{ alignItems: "baseline" }}>
            <span style={{ flex: "none", fontSize: 16, color: "var(--text)", minWidth: 72, fontWeight: 500 }}>
              時間地點
            </span>
            <span className="fs14">{fmtIsoDatetime(ev.created_at)} · {ev.place}</span>
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
            {ev.settled && <span className="pill-dark">已結帳</span>}
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
                {noMyTags ? (
                  <span className="fs12 text3">無特殊條件</span>
                ) : (
                  myTags.map((t) =>
                    t === "無標籤" ? (
                      <span key={t} className="fs12 text3">無特殊條件</span>
                    ) : (
                      <Chip key={t} label={t} kind="cond" hash />
                    )
                  )
                )}
              </span>
            </div>
          </>
        )}
      </div>

      {ev.settled ? (
        <>
          {/* My Flow (host/co only) */}
          {showFlow && (
            <div className="card mt-20" style={{ padding: 20 }}>
              <div className="section-title">我的付款流向</div>
              <div className="flex-col gap-8 mt-14">
                {myFlowLines.length > 0 ? (
                  myFlowLines.map((l, i) => (
                    <button
                      key={i}
                      className="card"
                      style={{
                        width: "100%", textAlign: "left", padding: "14px 16px", cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                      }}
                      onClick={() => router.push(`/events/${eventId}/pairs/${l.otherId}`)}
                    >
                      <span className="fs14">{l.text}</span>
                      <span className="flex items-center gap-8">
                        <span className="fs16 fw700">{money(l.amount)}</span>
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
                <span className="fs12 text3">{myNet >= 0 ? "應收回" : "應付出"}</span>
                <span
                  style={{
                    fontSize: 18, fontWeight: 700,
                    color: myNet >= 0 ? "var(--receive)" : "var(--owe)",
                  }}
                >
                  {money(Math.abs(Math.round(myNet)))}
                </span>
              </div>
            </div>
          )}

          {myRole === "host" && (
            <button
              className="btn-pill mt-12"
              style={{
                width: "100%", padding: "12px 16px", fontSize: 14,
                border: "1px solid var(--ln-control)", cursor: "pointer",
              }}
              onClick={() => router.push(`/events/${eventId}/payments`)}
            >
              查看全部付款流向
            </button>
          )}

          {/* Transfer Note */}
          {ev.transfer_note && (
            <div
              className="mt-14"
              style={{
                padding: "16px 20px", borderRadius: 8,
                background: "rgba(111,183,183,.10)", fontSize: 14, lineHeight: 1.7,
              }}
            >
              {ev.transfer_note}
            </div>
          )}

          {/* Items (read-only) */}
          <div className="section-title mt-20">款項現況（結帳不可編輯）</div>
          <div className="grid-cards mt-10">
            {ev.items.map((it) => {
              const payer = memberById[it.payer_member_id];
              return (
                <button
                  key={it.id}
                  className="card card-pad"
                  style={{
                    width: "100%", textAlign: "left", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                  }}
                  onClick={() => router.push(`/events/${eventId}/items/${it.id}`)}
                >
                  <span className="flex-col gap-6">
                    <span className="fs14">
                      {it.details.map((d) => d.name).join("、")}
                    </span>
                    <span className="fs12 text3">
                      {payer?.display ?? "—"} 代墊 · 明細 {it.details.length} 筆
                    </span>
                  </span>
                  <span className="flex items-center gap-8" style={{ flex: "none" }}>
                    <span className="fs14 fw500 text2">{money(ntdollars(it.total, it.total_cents))}</span>
                    <span className="text3">›</span>
                  </span>
                </button>
              );
            })}
          </div>
          {ev.items.length === 0 && <div className="empty-box">尚無款項</div>}
        </>
      ) : (
        <>
          {/* Items (active) */}
          <div className="mt-20 flex items-baseline between wrap gap-6">
            <span className="section-title">款項現況</span>
            <span className="flex gap-8 wrap" style={{ justifyContent: "flex-end" }}>
              <span className="fs14">合計 {money(ntdollars(ev.total, ev.total_cents))}</span>
            </span>
          </div>

          <div className="grid-cards mt-10">
            {ev.items.map((it) => {
              const payer = memberById[it.payer_member_id];
              const tags = [...new Set(it.details.map((d) => d.tag).filter(Boolean))];
              return (
                <button
                  key={it.id}
                  className="card card-pad"
                  style={{ width: "100%", textAlign: "left", cursor: "pointer" }}
                  onClick={() => router.push(`/events/${eventId}/items/${it.id}`)}
                >
                  <div className="flex between items-start gap-10">
                    <span className="grow fs16 fw500">{payer?.display ?? "—"} 代墊</span>
                    <span style={{ flex: "0 1 auto", maxWidth: "55%", textAlign: "right" }} className="fs16 fw500">
                      {money(ntdollars(it.total, it.total_cents))}
                    </span>
                  </div>
                  <div className="mt-6 fs12 text2">
                    {payer?.display ?? "—"} 代墊 · 明細 {it.details.length} 筆
                  </div>
                  <div className="mt-10 flex wrap gap-8 items-center" style={{ minHeight: 23 }}>
                    {tags.map((t) => (
                      <Chip key={t} label={t} kind="item" />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
          {ev.items.length === 0 && <div className="empty-box">尚無款項</div>}
        </>
      )}
    </div>
  );
}
