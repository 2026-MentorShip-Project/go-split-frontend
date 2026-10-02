"use client";

import { money, num } from "@/lib/formatters";
import { membersByEngineId, splitOneDetail } from "@/lib/engine";
import type { ItemDetail, Member, Rule } from "@/lib/types";
import type { Trace } from "@go-split/engine";

function reason(trace: Trace): string {
  const conds = (trace.hit_cond_tags ?? []).join("、");
  switch (trace.kind) {
    case "excluded":
      return `不計入（${(trace.hit_cond_tags ?? []).map((t) => `#${t}`).join(" ")}）`;
    case "excluded-rest":
      return "不計入（其他人員）";
    case "weighted":
      return `${conds}，權重 ×${trace.weight}`;
    case "rest":
      return trace.weight === 1 ? "其他人員" : `其他人員，權重 ×${trace.weight}`;
    case "custom":
      return "指定金額";
    case "payer-absorbs":
      return "無人符合，由付款人負擔";
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
      {/* Without a payer to absorb it, a rule nobody matches leaves no sharer. */}
      {result.validity === "no-participant" && (
        <div className="fs12" style={{ color: "var(--tag-item-fg)", marginBottom: 6 }}>
          沒有人符合，這筆將由付款人全額負擔
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
