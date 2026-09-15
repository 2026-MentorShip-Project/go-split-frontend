import type { ItemDetail, Member, Rule, RuleGroup, ExpenseItem, ShareResult, Transfer } from './types';
import { num } from './formatters';

const DEFAULT_WEIGHT = 1;
const MIN_WEIGHT = 0;
const MAX_WEIGHT = 100;
const BALANCE_THRESHOLD = 0.5;

function parseWeight(weight: string | undefined | null): number {
  if (weight === '' || weight === undefined || weight === null) {
    return DEFAULT_WEIGHT;
  }
  const parsed = Number(weight);
  if (isNaN(parsed)) return DEFAULT_WEIGHT;
  return Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, parsed));
}

function isValidNumericString(value: string | number | undefined): boolean {
  if (value === undefined) return false;
  const str = String(value).trim();
  return str !== '' && !/[^0-9.]/.test(str);
}

function personHasAllConditions(person: Member, conditions: string[]): boolean {
  const personTags = person.tags || [];
  return conditions.every(condition => personTags.includes(condition));
}

function findMatchingRuleGroup(
  rule: Rule,
  person: Member
): { group: RuleGroup; isRestGroup: boolean } | null {
  const groups = rule.groups || [];

  for (const group of groups) {
    const conditions = group.conds || [];
    if (conditions.length === 0) continue;
    if (!personHasAllConditions(person, conditions)) continue;
    return { group, isRestGroup: false };
  }

  return null;
}

export function ruleWeight(rules: Rule[], itemTags: string[], person: Member): number {
  for (const rule of rules) {
    if (!rule.tag || !itemTags.includes(rule.tag)) continue;

    const matchResult = findMatchingRuleGroup(rule, person);

    if (matchResult) {
      const { group } = matchResult;
      const mode = group.mode || 'exclude';
      if (mode === 'exclude') return 0;
      return parseWeight(group.wt);
    }

    const restConfig = rule.rest || { mode: 'weight' as const, wt: '' };
    const restMode = restConfig.mode || 'weight';
    if (restMode === 'exclude') return 0;
    return parseWeight(restConfig.wt);
  }

  return DEFAULT_WEIGHT;
}

export function detailShares(
  detail: ItemDetail,
  members: Member[],
  rules: Rule[]
): ShareResult {
  const weightByMemberId: Record<string, number> = {};

  members.forEach(member => {
    weightByMemberId[member.id] = detail.ids
      ? DEFAULT_WEIGHT
      : ruleWeight(rules, detail.tags, member);
  });

  const includedMembers = detail.ids
    ? members.filter(member => detail.ids!.includes(member.id))
    : members.filter(member => weightByMemberId[member.id] > 0);

  const totalAmount = typeof detail.amount === 'number' ? detail.amount : num(detail.amount);
  const customAmounts = detail.custom || {};

  const fixedMemberIds: string[] = [];
  let fixedAmountSum = 0;

  includedMembers.forEach(member => {
    const customValue = customAmounts[member.id];
    if (isValidNumericString(customValue)) {
      fixedMemberIds.push(member.id);
      fixedAmountSum += Number(customValue);
    }
  });

  const dynamicMemberIds = includedMembers
    .filter(member => !fixedMemberIds.includes(member.id))
    .map(member => member.id);

  const remainingAmount = Math.max(0, totalAmount - fixedAmountSum);
  const totalDynamicWeight = dynamicMemberIds.reduce(
    (sum, memberId) => sum + (weightByMemberId[memberId] || 0),
    0
  );

  const shareMap: Record<string, number> = {};

  includedMembers.forEach(member => {
    if (fixedMemberIds.includes(member.id)) {
      shareMap[member.id] = Number(customAmounts[member.id]);
    } else if (totalDynamicWeight > 0) {
      const memberWeight = weightByMemberId[member.id] || 0;
      shareMap[member.id] = (remainingAmount * memberWeight) / totalDynamicWeight;
    } else {
      shareMap[member.id] = 0;
    }
  });

  const unitShare = totalDynamicWeight > 0 ? remainingAmount / totalDynamicWeight : 0;

  let hasMismatch = false;

  if (includedMembers.length > 0) {
    let runningTotal = 0;

    fixedMemberIds.forEach(memberId => {
      const rounded = Math.round(shareMap[memberId]);
      shareMap[memberId] = rounded;
      runningTotal += rounded;
    });

    dynamicMemberIds.forEach(memberId => {
      const floored = Math.floor(shareMap[memberId] + 1e-6);
      shareMap[memberId] = floored;
      runningTotal += floored;
    });

    let remainder = Math.round(totalAmount) - runningTotal;

    if (dynamicMemberIds.length > 0) {
      let index = 0;
      while (remainder > 0) {
        const memberId = dynamicMemberIds[index % dynamicMemberIds.length];
        shareMap[memberId] += 1;
        remainder -= 1;
        index += 1;
      }
      while (remainder < 0) {
        const memberId = dynamicMemberIds[index % dynamicMemberIds.length];
        if (shareMap[memberId] > 0) {
          shareMap[memberId] -= 1;
          remainder += 1;
        }
        index += 1;
        if (index > dynamicMemberIds.length * 4) break;
      }
    } else if (remainder !== 0) {
      hasMismatch = true;
    }
  }

  const actualTotal = includedMembers.reduce(
    (sum, member) => sum + (shareMap[member.id] || 0),
    0
  );
  const difference = Math.round(totalAmount) - actualTotal;

  return {
    inc: includedMembers,
    per: dynamicMemberIds.length > 0 ? remainingAmount / dynamicMemberIds.length : 0,
    unit: unitShare,
    restW: totalDynamicWeight,
    amount: totalAmount,
    map: shareMap,
    fixedIds: fixedMemberIds,
    fixedSum: fixedAmountSum,
    mismatch: hasMismatch,
    diff: difference,
    overflow: fixedAmountSum - totalAmount > BALANCE_THRESHOLD,
  };
}

export function itemTotal(expense: ExpenseItem): number {
  return expense.details.reduce((sum, detail) => {
    const amount = typeof detail.amount === 'number' ? detail.amount : num(detail.amount);
    return sum + amount;
  }, 0);
}

interface BalanceEntry {
  member: Member;
  balance: number;
}

export function computeTransfers(
  members: Member[],
  paidByMember: Record<string, number>,
  owedByMember: Record<string, number>
): Transfer[] {
  const netBalances: BalanceEntry[] = members.map(member => ({
    member,
    balance: (paidByMember[member.id] || 0) - (owedByMember[member.id] || 0),
  }));

  const debtors = netBalances
    .filter(entry => entry.balance < -BALANCE_THRESHOLD)
    .map(entry => ({ member: entry.member, amount: -entry.balance }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = netBalances
    .filter(entry => entry.balance > BALANCE_THRESHOLD)
    .map(entry => ({ member: entry.member, amount: entry.balance }))
    .sort((a, b) => b.amount - a.amount);

  const transfers: Transfer[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const transferAmount = Math.min(debtor.amount, creditor.amount);

    transfers.push({
      key: `${debtor.member.id}>${creditor.member.id}`,
      from: debtor.member,
      to: creditor.member,
      amount: transferAmount,
    });

    debtor.amount -= transferAmount;
    creditor.amount -= transferAmount;

    if (debtor.amount < BALANCE_THRESHOLD) debtorIndex++;
    if (creditor.amount < BALANCE_THRESHOLD) creditorIndex++;
  }

  return transfers;
}

export function ruleTagUsed(tag: string, items: ExpenseItem[]): boolean {
  if (!tag) return false;
  return items.some(expense =>
    expense.details.some(detail => (detail.tags || []).includes(tag))
  );
}

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
