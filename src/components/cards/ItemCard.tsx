"use client";

import Chip from "@/components/ui/Chip";

interface ItemCardProps {
  title: string;
  amountText: string;
  by: string;
  detailCount: number;
  mineText: string;
  tags: string[];
  onClick: () => void;
}

export default function ItemCard({
  title,
  amountText,
  by,
  detailCount,
  mineText,
  tags,
  onClick,
}: ItemCardProps) {
  return (
    <div className="card card-pad" onClick={onClick} role="button" tabIndex={0}>
      <div className="card-head">
        <span className="card-name">{title}</span>
        <span className="card-amount">{amountText}</span>
      </div>
      <div className="card-meta">
        <span>代墊：{by}</span>
        <span>・</span>
        <span>{detailCount} 筆明細</span>
      </div>
      <div className="card-mine">{mineText}</div>
      {tags.length > 0 && (
        <div className="card-tags">
          {tags.map((tag) => (
            <Chip key={tag} label={tag} kind="item" hash />
          ))}
        </div>
      )}
    </div>
  );
}
