"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/store";
import { useShallow } from "zustand/shallow";
import Chip from "@/components/ui/Chip";
import IconButton from "@/components/ui/IconButton";
import { PlusIcon } from "@/components/icons";
import { money, fmtIsoDatetime } from "@/lib/formatters";
import { getEvent, type EventDetail } from "@/api/event";

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

  useEffect(() => {
    getEvent(eventId)
      .then(setEv)
      .catch((e) => setError(e instanceof Error ? e.message : "取得活動失敗"))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <div className="page-shell">載入中…</div>;
  if (error || !ev) return <div className="page-shell">{error ?? "活動不存在"}</div>;

  const myRole = ev.my_role;
  const canAddItem = myRole === "host" || myRole === "co";
  const roleLabel = myRole === "host" ? "主辦者" : myRole === "co" ? "協辦者" : "參與者";

  const me = ev.members.find((m) => m.you);
  const myTags = me?.tags ?? [];
  const noMyTags = myTags.length === 0;

  const memberById = Object.fromEntries(ev.members.map((m) => [m.id, m]));

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

      {/* Items */}
      <div className="mt-20 flex items-baseline between wrap gap-6">
        <span className="section-title">款項現況</span>
        <span className="flex gap-8 wrap" style={{ justifyContent: "flex-end" }}>
          <span className="fs14">合計 {money(ev.total_cents / 100)}</span>
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
                  {money(it.total_cents / 100)}
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
    </div>
  );
}
