"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Dialog from "@/components/ui/Dialog";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Input from "@/components/ui/Input";
import SplitPreview from "@/components/features/SplitPreview";
import { useSplitEngine } from "@/hooks/useSplitEngine";
import { effLabel, restLabel } from "@/lib/calculations";
import { num } from "@/lib/formatters";
import { applyRulePlan, draftRules, type RuleDraft, type RuleDraftIssue } from "@/api/event";
import type { Member, Rule } from "@/lib/types";

const ISSUE_TEXT: Record<string, string> = {
  "unknown-item-tag": "沒有這個項目標籤",
  "duplicate-item-tag": "同一個標籤出現兩條規則",
  "unknown-member": "找不到這位成員",
  "invalid-op": "規則在草擬後有變動，請重新草擬",
  "invalid-label": "標籤名稱需為 1 到 64 個字，前後不能有空白",
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

function withPlannedConds(members: Member[], draft: RuleDraft): Member[] {
  return members.map((m) => {
    const add = draft.memberConds.find((mc) => String(mc.memberId) === m.id)?.add ?? [];
    return add.length === 0 ? m : { ...m, tags: [...m.tags, ...add.filter((t) => !m.tags.includes(t))] };
  });
}

function withPlannedRules(rules: Rule[], draft: RuleDraft): Rule[] {
  const planned = draft.rules.map((r) => r.rule);
  return [...rules.filter((r) => !planned.some((p) => p.tag === r.tag)), ...planned];
}

interface RuleDraftPanelProps {
  eventId: number;
  members: Member[];
  rules: Rule[];
  usage: Record<string, number>;
  onApplied: () => void;
}

export default function RuleDraftPanel({ eventId, members, rules, usage, onApplied }: RuleDraftPanelProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<RuleDraft | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [previewAmount, setPreviewAmount] = useState("1200");
  const [confirming, setConfirming] = useState(false);
  const [applying, setApplying] = useState(false);
  const [stale, setStale] = useState(false);
  const engine = useSplitEngine();

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
      setStale(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "草擬分攤規則失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!draft) return;
    setConfirming(false);
    setApplying(true);
    setError(null);
    try {
      const issues = await applyRulePlan(eventId, draft.plan);
      if (issues) {
        setDraft({ ...draft, issues });
        setStale(true);
        setError("活動在草擬後有變動，這份草稿已無法套用，請重新草擬");
        return;
      }
      setDraft(null);
      setText("");
      onApplied();
    } catch (e) {
      setError(e instanceof Error ? e.message : "套用分攤規則失敗");
    } finally {
      setApplying(false);
    }
  };

  const newTags = [...draft?.newItemTags ?? [], ...draft?.newCondTags ?? []];
  const resplit = draft?.rules.filter((r) => r.op === "replace" && (usage[r.rule.tag] ?? 0) > 0) ?? [];
  const empty = !draft || (newTags.length === 0 && draft.rules.length === 0 && draft.memberConds.length === 0);
  const previewMembers = draft ? withPlannedConds(members, draft) : members;
  const previewRules = draft ? withPlannedRules(rules, draft) : rules;

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
          {draft.rules.length > 0 && engine.ready && (
            <div className="flex items-center gap-8">
              <span className="fs12 text2">假設每個標籤的一筆支出是</span>
              <input
                className="input input--sm"
                style={{ width: 90, textAlign: "right" }}
                value={previewAmount}
                inputMode="numeric"
                onChange={(e) => setPreviewAmount(e.target.value)}
              />
            </div>
          )}
          {draft.rules.map(({ op, rule, note }) => (
            <div key={rule.tag}>
              <div className="fw500">{op === "replace" ? "取代" : "新增"}「{rule.tag}」</div>
              <div className="fs12 text2">{ruleSummary(rule)}</div>
              {note && <div className="fs12 text2">{note}</div>}
              {engine.ready && (
                <div className="mt-4">
                  <SplitPreview
                    detail={{ name: "", amount: num(previewAmount), tags: [rule.tag], note: "", ids: null }}
                    members={previewMembers}
                    rules={previewRules}
                  />
                </div>
              )}
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
          <div className="flex items-center gap-8">
            <Button
              variant="pill"
              disabled={applying || stale || empty}
              onClick={() => (resplit.length > 0 ? setConfirming(true) : void handleApply())}
            >
              {applying ? "套用中…" : "套用"}
            </Button>
            <Button variant="pill" disabled={applying} onClick={() => { setDraft(null); setError(null); }}>
              捨棄
            </Button>
          </div>
        </div>
      )}
      {confirming && (
        <Dialog
          title="套用會重算已記錄的金額"
          body={`${resplit.map((r) => `「${r.rule.tag}」已有 ${usage[r.rule.tag]} 筆支出`).join("、")}。分攤結果在結清前都會即時重算，套用後這些支出的金額和成員看到的分攤都會跟著改變。`}
          danger
          onClose={() => setConfirming(false)}
          actions={
            <>
              <button className="btn-pill" onClick={() => setConfirming(false)}>
                取消
              </button>
              <button
                className="btn-pill"
                style={{ background: "var(--danger)", color: "#fff", border: "none" }}
                onClick={() => void handleApply()}
              >
                仍要套用
              </button>
            </>
          }
        />
      )}
    </div>
  );
}
