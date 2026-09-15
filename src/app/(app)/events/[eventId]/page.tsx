"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/store";
import { useShallow } from "zustand/shallow";
import Chip from "@/components/ui/Chip";
import IconButton from "@/components/ui/IconButton";
import { PlusIcon } from "@/components/icons";
import { itemTotal } from "@/lib/calculations";
import { money } from "@/lib/formatters";

export default function EventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);

  const { events, itemsBy, members, role, persona } = useStore(
    useShallow((s) => ({
      events: s.events,
      itemsBy: s.itemsBy,
      members: s.members,
      role: s.role,
      persona: s.persona,
    }))
  );

  const { evInfoCollapsed, setEvInfoCollapsed, openMenu, setSel, setCur } = useStore(
    useShallow((s) => ({
      evInfoCollapsed: s.evInfoCollapsed,
      setEvInfoCollapsed: s.setEvInfoCollapsed,
      openMenu: s.openMenu,
      setSel: s.setSel,
      setCur: s.setCur,
    }))
  );

  const ev = events[eventId];

  useEffect(() => {
    if (ev) {
      setCur(eventId);
    }
  }, [eventId, ev, setCur]);

  const items = useMemo(() => itemsBy[eventId] || [], [itemsBy, eventId]);

  if (!ev) return <div className="page-shell">活動不存在</div>;
  const canAddItem = role === "host" || persona === "host" || persona === "co";
  const evName = ev.name;
  const evDate = ev.date;
  const evPlace = ev.place;
  const roleLabel = ev.role === "host" ? "主辦者" : ev.role === "co" ? "協辦者" : "參與者";
  const myTags = members[0]?.tags || [];
  const noMyTags = myTags.length === 0;

  const totalAmount = items.reduce((a, it) => a + itemTotal(it), 0);

  return (
    <div className="page-shell">
      <div className="topbar">
        <div className="topbar-row topbar-row--start">
          <button className="icon-btn hamburger" title="更多操作" onClick={openMenu}>
            <span /><span /><span />
          </button>
          <span className="topbar-title">{evName}</span>
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
      {items.length === 0 && <div className="empty-box">尚無款項</div>}
    </div>
  );
}
