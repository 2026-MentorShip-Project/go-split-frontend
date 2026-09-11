"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import Button from "@/components/ui/Button";

export default function InvitePage() {
  const router = useRouter();
  const cur = useStore((s) => s.cur);
  const events = useStore((s) => s.events);
  const ev = events[cur];

  const evName = ev?.name || "";
  const evDate = ev?.date || "";
  const evPlace = ev?.place || "";

  return (
    <div
      className="page-shell page-shell--narrow"
      style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}
    >
      <div className="topbar">
        <div className="topbar-row">
          <span className="topbar-title" style={{ position: "static", transform: "none" }}>
            活動邀請
          </span>
        </div>
      </div>

      <div className="card mt-20" style={{ padding: 20 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", lineHeight: 1.35 }}>
          {evName}
        </div>
        <div className="mt-8 fs14 text2">{evDate} · {evPlace}</div>
        <div
          className="mt-16 flex-col gap-12"
          style={{ paddingTop: 18, borderTop: "1px solid var(--ln-control)" }}
        >
          <div className="flex between fs14">
            <span>主辦人</span>
            <span className="fw500">小凱</span>
          </div>
          <div className="flex between fs14">
            <span>你的身份</span>
            <span className="fw500">參與者</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div className="fs16 fw500" style={{ textAlign: "center", marginTop: 20 }}>
        確認是否加入活動？
      </div>
      <div className="flex-col gap-12 mt-16">
        <Button onClick={() => router.push("/events/join")}>加入活動</Button>
        <Button variant="secondary" onClick={() => router.push("/")}>暫不加入</Button>
      </div>
    </div>
  );
}
