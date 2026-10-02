"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { patchSettlementNote, settleEvent } from "@/api/settlement";
import { useSettlementPreview } from "@/hooks/useSettlementPreview";
import { money } from "@/lib/formatters";

export default function SettlePage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);

  const openMenu = useStore((s) => s.openMenu);
  const setSettled = useStore((s) => s.setSettled);

  const { loading, error, event, preview } = useSettlementPreview(eventId);
  const [noteDraft, setNoteDraft] = useState<string | null>(null);
  const [noteEventId, setNoteEventId] = useState(eventId);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (noteEventId !== eventId) {
    setNoteEventId(eventId);
    setNoteDraft(null);
  }

  const note = noteDraft ?? preview?.transferNote ?? "";

  useEffect(() => {
    if (!event) return;
    if (event.my_role !== "host") {
      router.replace(`/events/${eventId}`);
      return;
    }
    if (event.settled) {
      router.replace(`/events/${eventId}/settle/done`);
    }
  }, [event, eventId, router]);

  const handleSettle = async () => {
    if (submitting) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await patchSettlementNote(eventId, note);
      await settleEvent(eventId);
      setSettled(true);
      router.push(`/events/${eventId}/settle/done`);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "結帳失敗");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || (event && (event.my_role !== "host" || event.settled))) {
    return <div className="page-shell">載入中…</div>;
  }

  if (error || !preview) {
    return <div className="page-shell">{error ?? "載入分帳資料失敗"}</div>;
  }

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

      {actionError && (
        <div className="mt-14">
          <ErrorBanner message={actionError} onClose={() => setActionError(null)} />
        </div>
      )}

      <div className="section-title mt-20">全部款項</div>
      <div className="card mt-10" style={{ padding: 20 }}>
        <div className="section-title">款項現況</div>
        {preview.items.length === 0 ? (
          <div className="empty-box mt-12">尚無款項</div>
        ) : (
          <div className="mt-12 flex-col gap-12">
            {preview.items.map((it) => (
              <div key={it.id} className="flex between items-center">
                <span className="fs14">{it.label}</span>
                <span className="fs14 fw500">{money(it.amount)}</span>
              </div>
            ))}
          </div>
        )}
        <div
          className="flex"
          style={{
            justifyContent: "flex-end", alignItems: "baseline", gap: 10,
            marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--ln-control)",
          }}
        >
          <span className="fs14 text3">合計</span>
          <span style={{ fontSize: 24, fontWeight: 700 }}>{money(preview.grandTotal)}</span>
        </div>
      </div>

      <div className="section-title mt-24">人員分攤結果</div>
      <div className="grid-cards grid-cards--sm mt-10">
        {preview.splits.map((m) => (
          <div key={m.memberId} className="card" style={{ padding: "16px 20px" }}>
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
                  {money(m.owed)}
                </div>
              </div>
              <div>
                <div className="fs12 text2">代墊金額</div>
                <div className="mt-4" style={{ fontSize: 18, fontWeight: 700, wordBreak: "break-all" }}>
                  {money(m.advanced)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
                {money(Math.abs(row.net))}
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
          value={note}
          onChange={(e) => setNoteDraft(e.target.value)}
          maxLength={2000}
        />
      </div>

      <div className="bottom-cta">
        <button
          className="btn btn-primary btn-cta-lg"
          onClick={() => void handleSettle()}
          disabled={submitting}
        >
          {submitting ? "結帳中…" : "確認結帳產出"}
        </button>
      </div>
    </div>
  );
}
