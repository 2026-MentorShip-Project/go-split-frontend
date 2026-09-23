"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/store";
import { useShallow } from "zustand/shallow";
import Chip from "@/components/ui/Chip";
import { money, fmtIsoDatetime } from "@/lib/formatters";
import { ntdollars, buildSettlementPreview } from "@/lib/settlement";
import { roleFromApi } from "@/api/mombers";
import { getEvent, type EventDetail } from "@/api/event";
import { getShares, getTransfers, type SharesResponse, type TransfersResponse } from "@/api/settlement";

export default function ArchivedPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);

  const { openMenu, evInfoCollapsed, setEvInfoCollapsed } = useStore(
    useShallow((s) => ({
      openMenu: s.openMenu,
      evInfoCollapsed: s.evInfoCollapsed,
      setEvInfoCollapsed: s.setEvInfoCollapsed,
    }))
  );

  const [ev, setEv] = useState<EventDetail | null>(null);
  const [shares, setShares] = useState<SharesResponse | null>(null);
  const [transfers, setTransfers] = useState<TransfersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const event = await getEvent(eventId);
        if (cancelled) return;
        setEv(event);

        try {
          const [sharesData, transfersData] = await Promise.all([
            getShares(eventId),
            getTransfers(eventId),
          ]);
          if (!cancelled) {
            setShares(sharesData);
            setTransfers(transfersData);
          }
        } catch {
          // Non-host may not have access; settlement sections will be hidden
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "載入失敗");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [eventId]);

  if (loading) return <div className="page-shell">載入中…</div>;
  if (error || !ev) return <div className="page-shell">{error ?? "載入失敗"}</div>;

  const preview = shares && transfers ? buildSettlementPreview(ev, shares, transfers) : null;
  const memberById = Object.fromEntries(ev.members.map((m) => [m.id, m]));
  const me = ev.members.find((m) => m.you);
  const myTags = me?.tags ?? [];
  const roleLabel = roleFromApi(ev.my_role);

  return (
    <div className="page-shell">
      <div className="topbar">
        <div className="topbar-row">
          <button className="icon-btn hamburger" title="更多操作" onClick={openMenu}>
            <span /><span /><span />
          </button>
          <span className="topbar-title">{ev.name}</span>
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
            <span className="fs14">{fmtIsoDatetime(ev.starts_at)} · {ev.place}</span>
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
            <span className="pill-archived">已封存</span>
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
                {myTags.length === 0 || myTags.every((t) => t === "無標籤") ? (
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

      {/* Items */}
      <div className="mt-20 flex items-baseline between wrap gap-6">
        <span className="section-title">款項現況</span>
        {preview && <span className="fs14">合計 {money(preview.grandTotal)}</span>}
      </div>
      <div className="grid-cards mt-10">
        {ev.items.map((it) => {
          const payer = memberById[it.payer_member_id];
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
                {[...new Set(it.details.map((d) => d.tag).filter(Boolean))].map((t) => (
                  <Chip key={t} label={t} kind="item" />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {preview && (
        <>
          {/* Person Splits */}
          <div className="section-title mt-24">人員分攤結果</div>
          <div className="grid-cards grid-cards--sm mt-10">
            {preview.splits.map((s) => (
              <div key={s.memberId} className="card" style={{ padding: "16px 20px" }}>
                <div className="flex between items-center gap-10">
                  <span className="fs16 fw500">{s.name}</span>
                  <span className="pill-neutral">{s.role}</span>
                </div>
                {s.tags.length > 0 && s.tags.some((t) => t !== "無標籤") && (
                  <div className="mt-8 fs12" style={{ color: "var(--tag-cond-fg)" }}>
                    {s.tags.filter((t) => t !== "無標籤").map((t) => `#${t}`).join(" ")}
                  </div>
                )}
                <div className="flex-col gap-12 mt-12" style={{ paddingTop: 12, borderTop: "1px solid var(--ln-control)" }}>
                  <div>
                    <div className="fs12 text2">分攤金額</div>
                    <div className="mt-4" style={{ fontSize: 18, fontWeight: 700, wordBreak: "break-all" }}>
                      {money(Math.round(s.owed))}
                    </div>
                  </div>
                  <div>
                    <div className="fs12 text2">代墊金額</div>
                    <div className="mt-4" style={{ fontSize: 18, fontWeight: 700, wordBreak: "break-all" }}>
                      {money(Math.round(s.advanced))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Flow Rows */}
          <div className="section-title mt-24">人員付款流向</div>
          <div className="grid-cards grid-cards--sm mt-10">
            {preview.flows.map((row) => (
              <div key={row.memberId} className="card" style={{ padding: "16px 20px" }}>
                <div className="flex between items-center gap-10">
                  <span className="fs16 fw500">{row.name}</span>
                  <span className="pill-neutral">{row.role}</span>
                </div>
                <div className="flex-col gap-8 mt-12">
                  {row.lines.map((l, i) => (
                    <div key={i} className="flex between" style={{ alignItems: "baseline", gap: 10 }}>
                      <span className="fs14 text2" style={{ whiteSpace: "nowrap", flex: "none" }}>{l.text}</span>
                      <span className="grow fs14" style={{ textAlign: "right" }}>{money(l.amount)}</span>
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
                  <span className="fs12 text3" style={{ whiteSpace: "nowrap", flex: "none" }}>
                    {row.net >= 0 ? "應收回" : "應付出"}
                  </span>
                  <span
                    className="grow"
                    style={{
                      textAlign: "right", fontSize: 18, fontWeight: 700,
                      color: row.net >= 0 ? "var(--receive)" : "var(--owe)",
                    }}
                  >
                    {money(Math.abs(Math.round(row.net)))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
