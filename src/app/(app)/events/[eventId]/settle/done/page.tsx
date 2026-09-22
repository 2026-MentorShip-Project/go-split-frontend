"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { useSettlementPreview } from "@/hooks/useSettlementPreview";
import { money } from "@/lib/formatters";

export default function SettleDonePage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);

  const { loading, error, preview } = useSettlementPreview(eventId);
  const [copiedReport, setCopiedReport] = useState(false);

  const handleCopyReport = () => {
    if (!preview) return;
    const text = preview.flows
      .map((r) => `${r.name}（${r.role}）: ${r.net >= 0 ? "應收回" : "應付出"} ${money(Math.abs(r.net))}`)
      .join("\n");
    void navigator.clipboard?.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  if (loading) return <div className="page-shell">載入中…</div>;
  if (error || !preview) return <div className="page-shell">{error ?? "載入分帳資料失敗"}</div>;

  return (
    <div className="page-shell">
      <div className="flex-col items-center">
        <div
          style={{
            width: 56, height: 56, borderRadius: 99, background: "var(--teal)",
            color: "#fff", fontSize: 32, display: "flex", alignItems: "center",
            justifyContent: "center", fontWeight: 700,
          }}
        >
          ✓
        </div>
        <div className="mt-16" style={{ fontSize: 24, fontWeight: 700 }}>分帳已產出</div>
        <div className="mt-6 fs14">
          {preview.eventName} · 合計 {money(preview.grandTotal)}
        </div>
      </div>

      {preview.transferNote && (
        <div
          className="mt-20"
          style={{
            padding: "16px 20px", borderRadius: 8,
            background: "rgba(111,183,183,.10)", fontSize: 14, lineHeight: 1.7,
          }}
        >
          {preview.transferNote}
        </div>
      )}

      <div className="card mt-16" style={{ padding: "16px 20px" }}>
        <div className="flex between items-center">
          <span className="section-title">人員付款流向</span>
          <button
            className="btn-pill"
            style={{ fontSize: 12, padding: "6px 12px" }}
            onClick={handleCopyReport}
          >
            {copiedReport ? "已複製" : "複製報告"}
          </button>
        </div>
        <div
          className="mt-12"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,235px),1fr))",
            gap: 16,
          }}
        >
          {preview.flows.map((row) => (
            <div key={row.memberId} className="card" style={{ padding: "14px 16px" }}>
              <div className="flex between items-center gap-10">
                <span className="fs16 fw500">{row.name}</span>
                <span className="pill-neutral">{row.role}</span>
              </div>
              <div className="flex-col gap-8 mt-10">
                {row.lines.map((l, i) => (
                  <div key={i} className="flex between" style={{ alignItems: "baseline", gap: 10 }}>
                    <span className="fs14 text2">{l.text}</span>
                    <span className="fs14 fw500" style={{ flex: "none" }}>{money(l.amount)}</span>
                  </div>
                ))}
              </div>
              <div
                className="flex between"
                style={{
                  alignItems: "baseline", gap: 10, marginTop: 10, paddingTop: 10,
                  borderTop: "1px solid var(--ln-control)",
                }}
              >
                <span className="fs12 text2">{row.net >= 0 ? "應收回" : "應付出"}</span>
                <span
                  style={{
                    fontSize: 16, fontWeight: 700,
                    color: row.net >= 0 ? "var(--receive)" : "var(--owe)",
                  }}
                >
                  {money(Math.abs(row.net))}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button className="mt-12" onClick={() => router.push(`/events/${eventId}/settled`)}>
        返回活動頁
      </Button>
    </div>
  );
}
