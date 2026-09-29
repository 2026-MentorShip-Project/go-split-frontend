"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Input from "@/components/ui/Input";
import { effLabel, restLabel } from "@/lib/calculations";
import { draftRules, type RuleDraft, type RuleDraftIssue } from "@/api/event";
import type { Member, Rule } from "@/lib/types";

const ISSUE_TEXT: Record<string, string> = {
  "unknown-item-tag": "沒有這個項目標籤",
  "duplicate-item-tag": "同一個標籤出現兩條規則",
  "unknown-member": "找不到這位成員",
  "invalid-op": "無法判斷要新增還是取代",
  "rule-lock": "這個標籤已有支出，不能新增規則",
  "invalid-weight": "權重需介於 0.1 到 100，最多一位小數",
  "unknown-cond": "沒有這個人員條件",
  "empty-cond-set": "有一組沒有指定人員條件",
  "duplicate-cond-set": "兩組的人員條件完全相同",
  "invalid-mode": "分攤方式不正確",
  "invalid-groups": "分組格式不正確",
  "invalid-rest": "其他人員的設定不正確",
};

function ruleSummary(rule: Rule): string {
  const groups = rule.groups.map((g) => `${g.conds.join("＋")} ${effLabel(g)}`);
  return [...groups, `其他人員 ${restLabel(rule)}`].join("；");
}

function issueSubject(issue: RuleDraftIssue, members: Member[]): string {
  if (issue.item_tag) return `「${issue.item_tag}」`;
  if (issue.member_id) {
    return members.find((m) => m.id === String(issue.member_id))?.name ?? `成員 #${issue.member_id}`;
  }
  return "";
}

export default function RuleDraftPanel({ eventId, members }: { eventId: number; members: Member[] }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<RuleDraft | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  if (unavailable) return null;

  const handleDraft = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await draftRules(eventId, text.trim());
      if (result === null) {
        setUnavailable(true);
        return;
      }
      setDraft(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "草擬分攤規則失敗");
    } finally {
      setLoading(false);
    }
  };

  const newTags = [...draft?.newItemTags ?? [], ...draft?.newCondTags ?? []];

  return (
    <div className="mt-16 card card-pad">
      <div className="section-title">用一句話草擬規則</div>
      <div className="mt-10 flex items-center gap-8">
        <Input
          className="grow"
          value={text}
          maxLength={500}
          placeholder="例如：吃素的不用分肉錢，小孩算半份"
          onChange={(e) => setText(e.target.value)}
        />
        <Button variant="pill" onClick={() => void handleDraft()} disabled={loading || text.trim() === ""}>
          {loading ? "草擬中…" : "草擬"}
        </Button>
      </div>
      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
      {draft && (
        <div className="mt-12 flex-col gap-8 fs14" style={{ textAlign: "left" }}>
          {draft.note && <div className="text2">{draft.note}</div>}
          {newTags.length > 0 && (
            <div className="flex wrap items-center gap-8">
              <span>新增標籤</span>
              {draft.newItemTags.map((t) => <Chip key={`item-${t}`} label={t} kind="item" />)}
              {draft.newCondTags.map((t) => <Chip key={`cond-${t}`} label={t} kind="cond" />)}
            </div>
          )}
          {draft.rules.map(({ op, rule, note }) => (
            <div key={rule.tag}>
              <div className="fw500">{op === "replace" ? "取代" : "新增"}「{rule.tag}」</div>
              <div className="fs12 text2">{ruleSummary(rule)}</div>
              {note && <div className="fs12 text2">{note}</div>}
            </div>
          ))}
          {draft.memberConds.map(({ memberId, add }) => (
            <div key={memberId}>
              {members.find((m) => m.id === String(memberId))?.name ?? `成員 #${memberId}`} 加上 {add.map((t) => `#${t}`).join(" ")}
            </div>
          ))}
          {draft.issues.map((issue, i) => (
            <div key={i} className="fs12" style={{ color: "var(--danger)" }}>
              {issueSubject(issue, members)}{ISSUE_TEXT[issue.code] ?? issue.detail}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
