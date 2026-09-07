"use client";

interface PersonSplitCardProps {
  name: string;
  role: string;
  tagText?: string;
  share: string;
  advance: string;
}

export default function PersonSplitCard({
  name,
  role,
  tagText,
  share,
  advance,
}: PersonSplitCardProps) {
  return (
    <div className="card card-pad">
      <div className="card-head">
        <span className="card-name">{name}</span>
        <span className="pill pill-role">{role}</span>
      </div>
      {tagText && <div className="card-tag-text">{tagText}</div>}
      <div className="card-split-row">
        <span className="card-split-label">應分攤</span>
        <span className="card-split-value">{share}</span>
      </div>
      <div className="card-split-row">
        <span className="card-split-label">已代墊</span>
        <span className="card-split-value">{advance}</span>
      </div>
    </div>
  );
}
