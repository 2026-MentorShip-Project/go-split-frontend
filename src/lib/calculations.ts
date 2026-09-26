import type { ItemDetail, Member, Rule, ExpenseItem, ShareResult } from './types';
import { num } from './formatters';
import { membersByEngineId, splitOneDetail } from './engine';

const DEFAULT_WEIGHT = 1;
const MIN_WEIGHT = 0;
const MAX_WEIGHT = 100;

function parseWeight(weight: string | undefined | null): number {
  if (weight === '' || weight === undefined || weight === null) {
    return DEFAULT_WEIGHT;
  }
  const parsed = Number(weight);
  if (isNaN(parsed)) return DEFAULT_WEIGHT;
  return Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, parsed));
}

function personHasAllConditions(person: Member, conditions: string[]): boolean {
  const personTags = person.tags || [];
  return conditions.every(condition => personTags.includes(condition));
}

/**
 * Allocation comes from the shared WASM engine so previews agree with what the
 * backend will compute on save. Throws until initSplitEngine() has resolved.
 */
export function detailShares(
  detail: ItemDetail,
  members: Member[],
  rules: Rule[]
): ShareResult {
  const result = splitOneDetail(detail, members, rules);
  const byEngineId = membersByEngineId(members);

  const includedMembers: Member[] = [];
  const shareMap: Record<string, number> = {};
  const fixedMemberIds: string[] = [];
  let fixedAmountSum = 0;

  result.shares.forEach(share => {
    const member = byEngineId.get(share.member_id);
    if (!member) return;

    includedMembers.push(member);
    shareMap[member.id] = share.amount;

    if (share.trace.kind === 'custom') {
      fixedMemberIds.push(member.id);
      fixedAmountSum += share.amount;
    }
  });

  const totalAmount = typeof detail.amount === 'number' ? detail.amount : num(detail.amount);
  const dynamicCount = includedMembers.length - fixedMemberIds.length;

  return {
    inc: includedMembers,
    per: dynamicCount > 0 ? (totalAmount - fixedAmountSum) / dynamicCount : 0,
    unit: result.unit_price,
    restW: result.total_weight,
    amount: totalAmount,
    map: shareMap,
    fixedIds: fixedMemberIds,
    fixedSum: fixedAmountSum,
    mismatch: result.validity === 'custom-mismatch',
    diff: result.diff ?? 0,
    overflow: result.validity === 'custom-overflow',
    validity: result.validity,
  };
}

export function itemTotal(expense: ExpenseItem): number {
  return expense.details.reduce((sum, detail) => {
    const amount = typeof detail.amount === 'number' ? detail.amount : num(detail.amount);
    return sum + amount;
  }, 0);
}

export function ruleTagUsed(tag: string, items: ExpenseItem[]): boolean {
  if (!tag) return false;
  return items.some(expense =>
    expense.details.some(detail => (detail.tags || []).includes(tag))
  );
}

/**
 * Counts people a condition set applies to. An empty set deliberately counts
 * nobody: the engine would match everyone, but the backend rejects empty sets,
 * so a group still being filled in should not claim to cover the whole event.
 */
export function matchCount(conditions: string[], members: Member[]): number {
  if (conditions.length === 0) return 0;
  return members.filter(member => personHasAllConditions(member, conditions)).length;
}

export function effLabel(group: { mode?: string; wt?: string } | null): string {
  if (!group) return '';
  const mode = group.mode || 'exclude';
  if (mode === 'weight') {
    const weight = parseWeight(group.wt);
    return `權重 ×${weight}`;
  }
  return '不計入';
}

export function restLabel(rule: Rule | null): string {
  const restConfig = rule?.rest || { mode: 'weight' as const, wt: '' };
  const mode = restConfig.mode || 'weight';
  if (mode === 'exclude') return '不計入';
  const weight = parseWeight(restConfig.wt);
  return `權重 ×${weight}`;
}
