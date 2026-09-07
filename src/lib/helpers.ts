import type { EvSettings, EventData, ExpenseItem, ItemDetail, Member } from './types';

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export function evSettings(x: {
  rules: EvSettings['rules'];
  members: EvSettings['members'];
  itemTags: EvSettings['itemTags'];
  condTags: EvSettings['condTags'];
}): EvSettings {
  return { rules: x.rules, members: x.members, itemTags: x.itemTags, condTags: x.condTags };
}

export function isOutdoorEvent(name: string): boolean {
  return /烤肉|露營/.test(name || '');
}

export function isOutdoorTemplate(t: string | undefined): boolean {
  return t === '烤肉/露營模板';
}

export function mapAllItems(
  itemsBy: Record<number, ExpenseItem[]>,
  fn: (d: ItemDetail) => ItemDetail,
): Record<number, ExpenseItem[]> {
  const out: Record<number, ExpenseItem[]> = {};
  Object.keys(itemsBy).forEach(k => {
    const key = Number(k);
    out[key] = (itemsBy[key] || []).map(it => ({
      ...it,
      details: it.details.map(fn),
    }));
  });
  return out;
}

export function tagUsedWhere(
  kind: 'item' | 'cond',
  t: string,
  state: {
    rules: EvSettings['rules'];
    members: Member[];
    itemsBy: Record<number, ExpenseItem[]>;
    join: { conds: string[] };
  },
): { text: string } | null {
  if (!t) return null;
  const q = (n: string) => ({ text: '「' + t + '」已被使用在' + n + '，不可刪除。' });
  if (kind === 'item') {
    if (state.rules.some(r => r.tag === t)) return q('分攤規則');
    const by = state.itemsBy;
    const inItems = Object.keys(by).some(k =>
      (by[Number(k)] || []).some(it => it.details.some(d => d.tags.indexOf(t) >= 0)),
    );
    return inItems ? q('款項上') : null;
  }
  if (state.members.some(m => (m.tags || []).indexOf(t) >= 0)) return q('人員上');
  if ((state.join.conds || []).indexOf(t) >= 0) return q('加入訊息');
  const inRule = state.rules.some(r =>
    (r.groups || []).some(g => (g.conds || []).indexOf(t) >= 0),
  );
  return inRule ? q('條件式分攤規則') : null;
}

export function roleAt(
  st: { firstJoin: boolean; guest: boolean; persona?: string; role: string },
  e: EventData,
  i: number,
): string {
  if (st.firstJoin) return 'member';
  return i === 0 && !st.guest ? st.persona || st.role : e.role;
}
