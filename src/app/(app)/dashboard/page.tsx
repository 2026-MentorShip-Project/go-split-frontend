"use client";

import { useMemo, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import { useShallow } from "zustand/shallow";
import Input from "@/components/ui/Input";
import { roleName, fmtIsoDatetime } from "@/lib/formatters";
import { getEvents, joinEvent, type EventListItem } from "@/api/event";
import { logout } from "@/api/auth";

export default function HomePage() {
  const router = useRouter();

  const { guest, userName } = useStore(
    useShallow((s) => ({
      guest: s.guest,
      userName: s.userName,
    }))
  );
  const setUserName = useStore((s) => s.setUserName);

  const { setCur, code, setCode, setGuest } = useStore(
    useShallow((s) => ({
      setCur: s.setCur,
      code: s.code,
      setCode: s.setCode,
      setGuest: s.setGuest,
    }))
  );

  const [apiEvents, setApiEvents] = useState<EventListItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    if (!userName) {
      const stored = sessionStorage.getItem('userName');
      if (stored) setUserName(stored);
    }
  }, [userName, setUserName]);

  useEffect(() => {
    getEvents()
      .then(setApiEvents)
      .catch(console.error)
      .finally(() => setEventsLoading(false));
  }, []);

  const isAccount = !guest;
  const isGuest = guest;

  const { activeEvents, pastEvents } = useMemo(() => {
    const active: EventListItem[] = [];
    const past: EventListItem[] = [];
    apiEvents.forEach((ev) => {
      if (ev.archived) past.push(ev);
      else active.push(ev);
    });
    return { activeEvents: active, pastEvents: past };
  }, [apiEvents]);


  const noActive = activeEvents.length === 0;
  const hasPast = pastEvents.length > 0;

  const openEvent = useCallback((ev: EventListItem) => {
    setCur(ev.id);
    if (ev.archived) {
      router.push(`/events/${ev.id}/archived`);
    } else if (ev.settled) {
      router.push(`/events/${ev.id}`);
    } else {
      router.push(`/events/${ev.id}`);
    }
  }, [setCur, router]);

  const handleJoinByCode = useCallback(async () => {
    if (!code.trim()) return;
    try {
      const result = await joinEvent({ code: code.trim() });
      setCur(result.event_id);
      router.push(`/events/${result.event_id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "加入活動失敗");
    }
  }, [code, router, setCur]);

  return (
    <div className="page-shell">
      <div className="topbar">
        <div className="topbar-row between" style={{ justifyContent: "space-between" }}>
          <span className="flex items-center gap-10">
            <span
              style={{
                flex: "none", width: 36, height: 36, borderRadius: 10,
                background: "var(--teal)", color: "#fff", fontSize: 18,
                fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              分
            </span>
            <span className="fs18" style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>
              嗨，{userName}
            </span>
          </span>
          <span className="flex items-center gap-8">
            {isAccount && (
              <button
                className="btn-pill"
                style={{ fontSize: 14, padding: "4px 10px", border: "1px solid var(--ln-control)" }}
                onClick={() => { logout().finally(() => { window.location.href = "/login"; }); }}
              >
                登出
              </button>
            )}
          </span>
        </div>
      </div>

      {isGuest && (
        <div
          className="mt-16"
          style={{
            padding: "16px 20px", borderRadius: 8,
            background: "rgba(111,183,183,.12)",
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
          }}
        >
          <span className="fs14">
            訪客登入<br />綁定帳號後可保留活動紀錄
          </span>
          <button
            className="btn-pill"
            style={{ background: "var(--teal)", color: "#fff", border: "none", fontSize: 14 }}
            onClick={() => router.push("/register")}
          >
            綁定帳號
          </button>
        </div>
      )}

      {isAccount && (
        <button
          className="btn-primary mt-16"
          style={{
            width: "100%", textAlign: "left", padding: 20, border: "none",
            borderRadius: 8, color: "#fff", display: "flex", alignItems: "center",
            gap: 16, cursor: "pointer",
          }}
          onClick={() => router.push("/events/create")}
        >
          <span
            style={{
              width: 36, height: 36, flex: "none", borderRadius: 99,
              background: "rgba(255,255,255,.2)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 24,
            }}
          >
            +
          </span>
          <span className="fs18 fw700">新增活動</span>
        </button>
      )}

      <div className="flex gap-10 items-center mt-12">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="輸入活動邀請碼"
          style={{ flex: 1, padding: "12px 14px", fontSize: 14 }}
        />
        <button className="btn-pill" onClick={handleJoinByCode}>加入</button>
      </div>

      <div className="section-title mt-24">進行中的活動</div>
      <div className="grid-cards mt-10">
        {eventsLoading && <div className="empty-box">載入中…</div>}
        {activeEvents.map((ev) => (
          <button
            key={ev.id}
            className="card card-pad"
            style={{ width: "100%", textAlign: "left", cursor: "pointer" }}
            onClick={() => openEvent(ev)}
          >
            <div className="flex between items-start gap-10">
              <span className="fs16 fw500" style={{ color: "var(--text)" }}>{ev.name}</span>
              <span className="pill-neutral">{roleName(ev.role as import("@/lib/types").RoleType)}</span>
            </div>
            <div className="mt-6 fs12 text3">
              {fmtIsoDatetime(ev.starts_at)} · {ev.place} · {ev.member_count} 人參與 · {ev.settled ? '' : '已結帳，待繳款'}
            </div>
          </button>
        ))}
      </div>
      {!eventsLoading && noActive && (
        <div className="empty-box">目前沒有進行中的活動<br />新增活動或輸入邀請碼加入</div>
      )}

      {hasPast && (
        <>
          <div className="section-title mt-24">過去活動</div>
          <div className="grid-cards mt-10">
            {pastEvents.map((ev) => (
              <button
                key={ev.id}
                className="card card-pad"
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  background: "var(--bg-neutral)", borderColor: "var(--ln-control)",
                }}
                onClick={() => openEvent(ev)}
              >
                <div className="flex between items-start gap-10">
                  <span className="fs16 fw500" style={{ color: "var(--text2)" }}>{ev.name}</span>
                  <span className="pill-archived">已封存</span>
                </div>
                <div className="mt-6 fs12 text3">
                  {ev.place} · {ev.member_count} 人
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
