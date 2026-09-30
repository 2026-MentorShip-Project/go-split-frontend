"use client";

import Chip from "@/components/ui/Chip";
import { LockIcon } from "@/components/icons";
import type { TemplateSummary } from "@/api/event";

const MAX_CHIPS = 3;

export default function TemplateSummaryBar({ summary }: { summary: TemplateSummary }) {
  const { label, rule_count, cond_tag_count, item_tag_count, rule_tags = [] } = summary;
  const isEmpty = rule_count === 0 && cond_tag_count === 0 && item_tag_count === 0;

  return (
    <div
      className="card card-pad-sm flex-col gap-10 mt-10"
      style={{ borderColor: "var(--teal)", borderWidth: 1 }}
    >
      {isEmpty ? (
        <span className="fs14">{label}從空白設定開始，可自行新增規則與標籤。</span>
      ) : (
        <>
          <span className="fs14">
            {label}將帶入 <b>{rule_count}</b> 條規則、<b>{cond_tag_count}</b> 個人員條件、
            <b>{item_tag_count}</b> 個項目標籤
          </span>
          {rule_tags.length > 0 && (
            <div className="flex wrap items-center gap-8">
              {rule_tags.slice(0, MAX_CHIPS).map((tag, i) => (
                <Chip key={`${tag}-${i}`} kind="item" md label={tag} />
              ))}
              {rule_count > MAX_CHIPS && <span className="fs12 text3">等 {rule_count} 條規則</span>}
            </div>
          )}
        </>
      )}
      <span className="flex items-center gap-4 fs12 text3">
        <LockIcon size={14} />
        建立後無法更換模板，規則與標籤可再編輯。
      </span>
    </div>
  );
}
