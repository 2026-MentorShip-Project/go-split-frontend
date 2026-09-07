"use client";

interface FlowRowCardProps {
  name: string;
  role: string;
  lines: { text: string; amount: string }[];
  summaryLabel: string;
  summary: string;
  positive: boolean;
  small?: boolean;
}

export default function FlowRowCard({
  name,
  role,
  lines,
  summaryLabel,
  summary,
  positive,
  small,
}: FlowRowCardProps) {
  if (small) {
    return (
      <div className="card card-pad card--sm">
        <div className="card-head">
          <span className="card-name">{name}</span>
          <span className="pill pill-role">{role}</span>
        </div>
        <div className={`card-summary${positive ? " is-positive" : " is-negative"}`}>
          <span>{summaryLabel}</span>
          <span className="card-summary-amount">{summary}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-pad">
      <div className="card-head">
        <span className="card-name">{name}</span>
        <span className="pill pill-role">{role}</span>
      </div>
      <div className="card-flow-lines">
        {lines.map((line, i) => (
          <div key={i} className="card-flow-line">
            <span>{line.text}</span>
            <span className="card-flow-amount">{line.amount}</span>
          </div>
        ))}
      </div>
      <div className={`card-summary${positive ? " is-positive" : " is-negative"}`}>
        <span>{summaryLabel}</span>
        <span className="card-summary-amount">{summary}</span>
      </div>
    </div>
  );
}
