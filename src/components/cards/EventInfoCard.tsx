"use client";

import { ChevDownIcon } from "@/components/icons";

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
    <div className="card card-pad">
      <button className="card-toggle" onClick={onToggle}>
        <span className="card-toggle-label">活動資訊</span>
        <ChevDownIcon
          size={18}
          className={`card-toggle-icon${collapsed ? "" : " is-open"}`}
        />
      </button>

      {!collapsed && (
        <div className="card-info-body">
          <div className="card-info-row">
            <span className="card-info-label">日期</span>
            <span>{date}</span>
          </div>
          <div className="card-info-row">
            <span className="card-info-label">地點</span>
            <span>{place}</span>
          </div>
          <div className="card-info-row">
            <span className="card-info-label">身份</span>
            <span>{roleLabel}</span>
            {statusPill}
          </div>
          {myTags.length > 0 && (
            <div className="card-info-row">
              <span className="card-info-label">標籤</span>
              <div className="card-info-tags">
                {myTags.map((tag) => (
                  <span key={tag} className="chip chip-cond chip-sm">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
