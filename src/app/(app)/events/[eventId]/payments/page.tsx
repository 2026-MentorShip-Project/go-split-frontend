"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/store";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { money } from "@/lib/formatters";
import { getEvent, archiveEvent, type EventDetail } from "@/api/event";
import { getShares, getTransfers, type SharesResponse, type TransfersResponse } from "@/api/settlement";

export default function PaymentsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);
  const openMenu = useStore((s) => s.openMenu);

  const [ev, setEv] = useState<EventDetail | null>(null);
  const [shares, setShares] = useState<SharesResponse | null>(null);
  const [transfers, setTransfers] = useState<TransfersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [event, sharesData, transfersData] = await Promise.all([
          getEvent(eventId),
          getShares(eventId),
          getTransfers(eventId),
        ]);
        if (cancelled) return;
        setEv(event);
        setShares(sharesData);
        setTransfers(transfersData);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "載入失敗");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [eventId]);

  useEffect(() => {
    if (!ev) return;
    if (ev.my_role !== "host") {
      router.replace(`/events/${eventId}`);
    }
  }, [ev, eventId, router]);

  const handleArchive = async () => {
    setArchiving(true);
    try {
      await archiveEvent(eventId);
      router.push("/dashboard");
    } catch {
      setArchiving(false);
      setShowArchiveDialog(false);
    }
  };

  if (loading) return <div className="page-shell">載入中…</div>;
  if (error || !ev || !shares || !transfers) return <div className="page-shell">{error ?? "載入失敗"}</div>;

  const memberById = Object.fromEntries(ev.members.map((m) => [m.id, m]));
  const transferList = transfers.transfers ?? [];

  return (
    <div className="page-shell">
      <div className="topbar">
        <div className="topbar-row topbar-row--start">
          <button className="icon-btn hamburger" title="更多操作" onClick={openMenu}>
            <span /><span /><span />
          </button>
          <span className="topbar-title">付款流向清單</span>
        </div>
      </div>

      <div className="grid-cards mt-10">
        {transferList.map((t) => {
          const from = memberById[t.from_id];
          const to = memberById[t.to_id];
          return (
            <div
              key={`${t.from_id}-${t.to_id}`}
              className="card card-pad flex between items-center gap-12"
            >
              <span className="fs14">
                {from?.display ?? `#${t.from_id}`} → {to?.display ?? `#${t.to_id}`}
              </span>
              <span className="fs16 fw700">{money(Math.round(t.amount))}</span>
            </div>
          );
        })}
        {transferList.length === 0 && (
          <div className="empty-box">所有款項已平衡，無需轉帳</div>
        )}
      </div>

      {!ev.archived && (
        <Button className="mt-20" onClick={() => setShowArchiveDialog(true)}>
          結清活動
        </Button>
      )}

      {showArchiveDialog && (
        <Dialog
          title="結清活動"
          body="結清後活動將完全唯讀、不可還原"
          danger
          onClose={() => setShowArchiveDialog(false)}
          actions={
            <>
              <button
                className="btn-pill"
                onClick={() => setShowArchiveDialog(false)}
              >
                取消
              </button>
              <button
                className="btn-pill"
                style={{ background: "var(--danger)", color: "#fff", border: "none" }}
                onClick={handleArchive}
                disabled={archiving}
              >
                {archiving ? "處理中…" : "確認結清"}
              </button>
            </>
          }
        />
      )}
    </div>
  );
}
