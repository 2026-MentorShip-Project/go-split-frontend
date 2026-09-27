import { validateRule, type RuleIssueCode } from '@go-split/engine';
import { initSplitEngine, toEngineRules } from './engine';
import type { Rule, RuleGroup } from './types';

// Per-field hint while typing; ruleProblem is what gates a save.
export function validWeight(wt: string | undefined): boolean {
  const text = (wt ?? '').trim();
  if (text === '') return true; // omitted, so the server applies its default of 1
  const weight = Number(text);
  return (
    Number.isFinite(weight) &&
    weight >= 0.1 &&
    weight <= 100 &&
    Math.abs(weight * 10 - Math.round(weight * 10)) < 1e-8
  );
}

const condKey = (conds: string[]) => [...conds].sort().join('\u0000');

// Marks the clashing groups; ruleProblem reports the same clash as one message.
export function duplicateGroups(groups: RuleGroup[]): Set<number> {
  const firstSeen = new Map<string, number>();
  const duplicates = new Set<number>();

  groups.forEach((group, i) => {
    const conds = group.conds ?? [];
    if (conds.length === 0) return;
    const key = condKey(conds);
    const seen = firstSeen.get(key);
    if (seen === undefined) firstSeen.set(key, i);
    else {
      duplicates.add(seen);
      duplicates.add(i);
    }
  });

  return duplicates;
}

const ISSUE_MESSAGE: Record<RuleIssueCode, string> = {
  'invalid-groups': '規則格式錯誤',
  'invalid-rest': '「其他人員」設定錯誤',
  'empty-cond-set': '每個群組都要至少選一個人員條件',
  'duplicate-cond-set': '有重複的條件組合',
  'unknown-cond': '有不存在的人員條件',
  'invalid-mode': '效果必須是權重或不計入',
  'invalid-weight': '權重需為 0.1～100，最多一位小數',
};

/**
 * The message to show the host, or null when the rule is savable. Runs the
 * engine's own checks, so the verdict matches what the API will do on save.
 */
export async function ruleProblem(rule: Rule, condTags: string[]): Promise<string | null> {
  if (!rule.tag.trim()) return '請先選擇項目標籤';

  await initSplitEngine();
  const [engineRule] = toEngineRules([rule]);
  const verdict = validateRule({
    groups: engineRule.groups,
    rest: engineRule.rest,
    cond_tags: condTags,
  });
  return verdict.ok ? null : ISSUE_MESSAGE[verdict.code];
}

/**
 * Expense details per item tag, counted the way the backend counts them — one
 * per detail, not per item. Shares recompute live until settlement, so this is
 * how many amounts a rule edit would silently change.
 */
export function itemTagUsage(
  items: { details?: { tag?: string }[] }[] | undefined,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items ?? []) {
    for (const detail of item.details ?? []) {
      if (detail.tag) counts[detail.tag] = (counts[detail.tag] ?? 0) + 1;
    }
  }
  return counts;
}
