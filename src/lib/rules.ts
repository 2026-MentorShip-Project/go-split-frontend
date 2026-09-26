import type { Rule, RuleGroup } from './types';

/** Mirrors normalizeGroup on the server: 0.1–100 with at most one decimal. */
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

/** Indexes of groups sharing a condition set — the server rejects duplicates. */
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

/** The message to show the host, or null when the rule is savable. */
export function ruleProblem(rule: Rule): string | null {
  if (!rule.tag.trim()) return '請先選擇項目標籤';
  if ((rule.groups ?? []).some((group) => (group.conds ?? []).length === 0)) {
    return '每個群組都要至少選一個人員條件';
  }
  if (duplicateGroups(rule.groups ?? []).size > 0) return '有重複的條件組合';

  const weighted = [...(rule.groups ?? []), ...(rule.rest ? [rule.rest] : [])];
  if (weighted.some((group) => group.mode === 'weight' && !validWeight(group.wt))) {
    return '權重需為 0.1～100，最多一位小數';
  }
  return null;
}
