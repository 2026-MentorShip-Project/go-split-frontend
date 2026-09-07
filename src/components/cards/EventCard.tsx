"use client";

interface EventCardProps {
  name: string;
  date: string;
  place: string;
  role?: string;
  status?: string;
  total?: string;
  archived?: boolean;
  onClick: () => void;
}

const ROLE_MAP: Record<string, string> = {
  host: "主辦者",
  co: "協辦者",
  member: "參與者",
};

export default function EventCard({
  name,
  date,
  place,
  role,
  status,
  total,
  archived,
  onClick,
}: EventCardProps) {
  return (
    <div
      className={`card card-pad${archived ? " card--archived" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="card-head">
        <span className="card-name">{name}</span>
        {role && <span className="pill pill-role">{ROLE_MAP[role] ?? role}</span>}
      </div>
      <div className="card-meta">
        <span>{date}</span>
        <span>・</span>
        <span>{place}</span>
      </div>
      {(status || total) && (
        <div className="card-foot">
          {status && <span className="card-status">{status}</span>}
          {total && <span className="card-total">{total}</span>}
        </div>
      )}
    </div>
  );
}
