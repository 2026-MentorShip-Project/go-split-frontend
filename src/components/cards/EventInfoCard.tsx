"use client";

import Chip from "@/components/ui/Chip";

interface EventInfoCardProps {
  date: string;
  place: string;
  roleLabel: string;
  myTags: string[];
  collapsed: boolean;
  onToggle: () => void;
  statusPill?: React.ReactNode;
}

export default function EventInfoCard({
  date,
  place,
  roleLabel,
  myTags,
  collapsed,
  onToggle,
  statusPill,
}: EventInfoCardProps) {
  return (
    <div className="card mt-16" style={{ padding: "16px 20px" }}>
      <div className="flex items-start gap-12">
        <div className="grow flex items-center gap-12 wrap" style={{ alignItems: "baseline" }}>
          <span style={{ flex: "none", fontSize: 16, color: "var(--text)", minWidth: 72, fontWeight: 500 }}>
            時間地點
          </span>
          <span className="fs14">{date} · {place}</span>
          {statusPill}
        </div>
        <button
          className="icon-btn"
          title={collapsed ? "展開" : "收合"}
          style={{ width: 32, height: 32, fontSize: 30, margin: "-4px -6px 0 0" }}
          onClick={onToggle}
        >
          {collapsed ? "›" : "⌄"}
        </button>
      </div>
      {collapsed ? (
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
              {myTags.length === 0 ? (
                <span className="fs12 text3">無特殊條件</span>
              ) : (
                myTags.map((t) => <Chip key={t} label={t} kind="cond" hash />)
              )}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
