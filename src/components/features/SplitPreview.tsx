"use client";

import { money, num } from "@/lib/formatters";
import { membersByEngineId, splitOneDetail } from "@/lib/engine";
import type { ItemDetail, Member, Rule } from "@/lib/types";
import type { Trace } from "@go-split/engine";

const INVALID_TEXT: Record<string, string> = {
  "no-participant": "沒有人分攤這筆，請調整標籤或人員條件",
  "custom-mismatch": "指定金額加總與品項金額不符",
  "custom-overflow": "指定金額超過品項金額",
};

function reason(trace: Trace): string {
  const conds = (trace.hit_cond_tags ?? []).join("、");
  switch (trace.kind) {
    case "excluded":
      return `${conds}，不計入`;
    case "excluded-rest":
      return "其他人員，不計入";
    case "weighted":
      return `${conds}，權重 ×${trace.weight}`;
    case "rest":
      return trace.weight === 1 ? "其他人員" : `其他人員，權重 ×${trace.weight}`;
    case "custom":
      return "指定金額";
    default:
      return "均分";
  }
}

interface SplitPreviewProps {
  detail: ItemDetail;
  members: Member[];
  rules: Rule[];
}

export default function SplitPreview({ detail, members, rules }: SplitPreviewProps) {
  const amount = typeof detail.amount === "number" ? detail.amount : num(String(detail.amount));
  if (amount <= 0 || members.length === 0) return null;

  const result = splitOneDetail(detail, members, rules);
  const byEngineId = membersByEngineId(members);
  const rows = [...result.shares, ...result.excluded];

  return (
    <div>
      <div className="fs12 text2" style={{ marginBottom: 6 }}>分攤預覽</div>
      {result.validity !== "ok" && (
        <div className="fs12" style={{ color: "var(--danger)", marginBottom: 6 }}>
          {INVALID_TEXT[result.validity] ?? "無法分攤"}
        </div>
      )}
      {rows.map((share) => (
        <div key={share.member_id} className="flex between items-center" style={{ padding: "2px 0" }}>
          <span className="fs13">{byEngineId.get(share.member_id)?.name}</span>
          <span className="flex items-center gap-8">
            <span className="fs12 text3">{reason(share.trace)}</span>
            <span className="fs13 text2">{money(share.amount)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
