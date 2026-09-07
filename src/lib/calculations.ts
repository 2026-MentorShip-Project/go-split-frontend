import type { ItemDetail, Member, Rule, ExpenseItem, ShareResult, Transfer } from './types';
import { num } from './formatters';

export function ruleWeight(rules: Rule[], tags: string[], person: Member): number {
  for (const r of rules) {
    if (!r.tag || tags.indexOf(r.tag) < 0) continue;
    for (const g of r.groups || []) {
      const cs = g.conds || [];
      if (!cs.length) continue;
      if (!cs.every(c => (person.tags || []).indexOf(c) >= 0)) continue;
      if ((g.mode || 'exclude') === 'exclude') return 0;
      const v = Number(g.wt === '' || g.wt === undefined || g.wt === null ? 1 : g.wt);
      return isNaN(v) ? 1 : Math.max(0, Math.min(100, v));
    }
    const rest = r.rest || { mode: 'weight' as const, wt: '' };
    if ((rest.mode || 'weight') === 'exclude') return 0;
    const rv = Number(rest.wt === '' || rest.wt === undefined || rest.wt === null ? 1 : rest.wt);
    return isNaN(rv) ? 1 : Math.max(0, Math.min(100, rv));
  }
  return 1;
}

export function detailShares(d: ItemDetail, members: Member[], rules: Rule[]): ShareResult {
  const wOf: Record<string, number> = {};
  members.forEach(m => {
    wOf[m.id] = d.ids ? 1 : ruleWeight(rules, d.tags, m);
  });
  const inc = d.ids
    ? members.filter(m => d.ids!.indexOf(m.id) >= 0)
    : members.filter(m => wOf[m.id] > 0);
  const amount = typeof d.amount === 'number' ? d.amount : num(d.amount);
  const custom = d.custom || {};
  const fixedIds: string[] = [];
  let fixedSum = 0;
  inc.forEach(m => {
    const v = custom[m.id];
    if (v !== undefined && String(v).trim() !== '' && !/[^0-9.]/.test(String(v))) {
      fixedIds.push(m.id);
      fixedSum += Number(v);
    }
  });
  const restIds = inc.filter(m => fixedIds.indexOf(m.id) < 0).map(m => m.id);
  const rest = Math.max(0, amount - fixedSum);
  const restW = restIds.reduce((a, id) => a + (wOf[id] || 0), 0);
  const map: Record<string, number> = {};
  inc.forEach(m => {
    map[m.id] =
      fixedIds.indexOf(m.id) >= 0
        ? Number(custom[m.id])
        : restW
          ? (rest * (wOf[m.id] || 0)) / restW
          : 0;
  });
  const unit = restW ? rest / restW : 0;
  let mismatch = false;
  if (inc.length) {
    let acc = 0;
    fixedIds.forEach(id => {
      const v = Math.round(map[id]);
      map[id] = v;
      acc += v;
    });
    restIds.forEach(id => {
      const v = Math.floor(map[id] + 1e-6);
      map[id] = v;
      acc += v;
    });
    let remainder = Math.round(amount) - acc;
    if (restIds.length) {
      let k = 0;
      while (remainder > 0) {
        const id = restIds[k % restIds.length];
        map[id] += 1;
        remainder -= 1;
        k += 1;
      }
      while (remainder < 0) {
        const id = restIds[k % restIds.length];
        if (map[id] > 0) {
          map[id] -= 1;
          remainder += 1;
        }
        k += 1;
        if (k > restIds.length * 4) break;
      }
    } else if (remainder !== 0) {
      mismatch = true;
    }
  }
  const diff = Math.round(amount) - inc.reduce((a, m) => a + (map[m.id] || 0), 0);
  return {
    inc,
    per: restIds.length ? rest / restIds.length : 0,
    unit,
    restW,
    amount,
    map,
    fixedIds,
    fixedSum,
    mismatch,
    diff,
    overflow: fixedSum - amount > 0.5,
  };
}

export function itemTotal(it: ExpenseItem): number {
  return it.details.reduce(
    (a, d) => a + (typeof d.amount === 'number' ? d.amount : num(d.amount)),
    0,
  );
}

export function computeTransfers(
  members: Member[],
  paidBy: Record<string, number>,
  totals: Record<string, number>,
): Transfer[] {
  const net = members.map(m => ({ m, v: (paidBy[m.id] || 0) - (totals[m.id] || 0) }));
  const debt = net
    .filter(x => x.v < -0.5)
    .map(x => ({ m: x.m, v: -x.v }))
    .sort((a, b) => b.v - a.v);
  const cred = net
    .filter(x => x.v > 0.5)
    .map(x => ({ m: x.m, v: x.v }))
    .sort((a, b) => b.v - a.v);
  const transfers: Transfer[] = [];
  let di = 0;
  let ci = 0;
  while (di < debt.length && ci < cred.length) {
    const amt = Math.min(debt[di].v, cred[ci].v);
    const key = debt[di].m.id + '>' + cred[ci].m.id;
    transfers.push({ key, from: debt[di].m, to: cred[ci].m, amount: amt });
    debt[di].v -= amt;
    cred[ci].v -= amt;
    if (debt[di].v < 0.5) di++;
    if (cred[ci].v < 0.5) ci++;
  }
  return transfers;
}

export function ruleTagUsed(tag: string, items: ExpenseItem[]): boolean {
  if (!tag) return false;
  return items.some(it => it.details.some(d => (d.tags || []).indexOf(tag) >= 0));
}

export function matchCount(conds: string[], members: Member[]): number {
  if (!conds.length) return 0;
  return members.filter(m => conds.every(c => (m.tags || []).indexOf(c) >= 0)).length;
}

export function effLabel(g: { mode?: string; wt?: string } | null): string {
  if (!g) return '';
  if ((g.mode || 'exclude') === 'weight') {
    const v = g.wt === '' || g.wt === undefined || g.wt === null ? 1 : Number(g.wt);
    return '權重 ×' + (isNaN(v) ? 1 : v);
  }
  return '不計入';
}

export function restLabel(r: Rule | null): string {
  const rest = (r && r.rest) || { mode: 'weight' as const, wt: '' };
  if ((rest.mode || 'weight') === 'exclude') return '不計入';
  const v = rest.wt === '' || rest.wt === undefined || rest.wt === null ? 1 : Number(rest.wt);
  return '權重 ×' + (isNaN(v) ? 1 : v);
}
