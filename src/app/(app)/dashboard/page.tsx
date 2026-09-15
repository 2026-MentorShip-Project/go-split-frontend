"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import { useShallow } from "zustand/shallow";
import Input from "@/components/ui/Input";
import { roleName } from "@/lib/formatters";
import { itemTotal } from "@/lib/calculations";
import { money } from "@/lib/formatters";

export default function HomePage() {
  const router = useRouter();

  const { acc, guest, events, itemsBy } = useStore(
    useShallow((s) => ({
      acc: s.acc,
      guest: s.guest,
      events: s.events,
      itemsBy: s.itemsBy,
    }))
  );

  const { setCur, code, setCode, setGuest } = useStore(
    useShallow((s) => ({
      setCur: s.setCur,
      code: s.code,
      setCode: s.setCode,
      setGuest: s.setGuest,
    }))
  );

  const isAccount = !guest;
  const isGuest = guest;
  const userName = acc.name;

  const { activeEvents, pastEvents } = useMemo(() => {
    const active: Array<{ ev: typeof events[0]; i: number }> = [];
    const past: Array<{ ev: typeof events[0]; i: number }> = [];

    events.forEach((ev, i) => {
      if (ev.archived) {
        past.push({ ev, i });
      } else {
        active.push({ ev, i });
      }
    });

    return { activeEvents: active, pastEvents: past };
  }, [events]);

  const eventTotals = useMemo(() => {
    const totals: Record<number, { count: number; total: number }> = {};
    Object.entries(itemsBy).forEach(([key, items]) => {
      const idx = Number(key);
      const total = items.reduce((a, it) => a + itemTotal(it), 0);
      totals[idx] = { count: items.length, total };
    });
    return totals;
  }, [itemsBy]);

  const getStatus = useCallback((i: number) => {
    const data = eventTotals[i] || { count: 0, total: 0 };
    return `${data.count} 筆款項 · ${money(data.total)}`;
  }, [eventTotals]);

  const getTotal = useCallback((i: number) => {
    const data = eventTotals[i] || { count: 0, total: 0 };
    return money(data.total);
  }, [eventTotals]);

  const noActive = activeEvents.length === 0;
  const hasPast = pastEvents.length > 0;

  const openEvent = useCallback((i: number) => {
    setCur(i);
    const ev = events[i];
    if (ev.archived) {
      router.push(`/events/${i}/archived`);
    } else if (ev.settled) {
      router.push(`/events/${i}/settled`);
    } else {
      router.push(`/events/${i}`);
    }
  }, [setCur, events, router]);

  const handleJoinByCode = useCallback(() => {
    if (code.trim()) router.push("/events/invite");
  }, [code, router]);

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
                onClick={() => { setGuest(false); router.push("/login"); }}
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
        {activeEvents.map(({ ev, i }) => (
          <button
            key={i}
            className="card card-pad"
            style={{ width: "100%", textAlign: "left", cursor: "pointer" }}
            onClick={() => openEvent(i)}
          >
            <div className="flex between items-start gap-10">
              <span className="fs16 fw500" style={{ color: "var(--text)" }}>{ev.name}</span>
              <span className="pill-neutral">{roleName(ev.role)}</span>
            </div>
            <div className="mt-6 fs12 text3">
              {ev.date} · {ev.place} · {getStatus(i)}
            </div>
          </button>
        ))}
      </div>
      {noActive && (
        <div className="empty-box">目前沒有進行中的活動<br />新增活動或輸入邀請碼加入</div>
      )}

      {hasPast && (
        <>
          <div className="section-title mt-24">過去活動</div>
          <div className="grid-cards mt-10">
            {pastEvents.map(({ ev, i }) => (
              <button
                key={i}
                className="card card-pad"
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  background: "var(--bg-neutral)", borderColor: "var(--ln-control)",
                }}
                onClick={() => openEvent(i)}
              >
                <div className="flex between items-start gap-10">
                  <span className="fs16 fw500" style={{ color: "var(--text2)" }}>{ev.name}</span>
                  <span className="pill-archived">已封存</span>
                </div>
                <div className="mt-6 fs12 text3">
                  {ev.date} · {ev.place} · {getTotal(i)}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
