import type { EventForm, RoleType } from './types';

export function money(n: number): string {
  return 'NT$ ' + Math.round(n).toLocaleString('en-US');
}

export function num(v: string | number): number {
  return parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0;
}

export function fmtD(s: string): string {
  if (!s) return '';
  const p = String(s).split('-');
  return p.length === 3 ? p[0] + '/' + p[1] + '/' + p[2] : s;
}

export function fmtDT(s: string): string {
  if (!s) return '';
  const parts = String(s).split('T');
  const d = fmtD(parts[0]);
  const t = (parts[1] || '').slice(0, 5);
  return t ? d + ' ' + t : d;
}

export function fmtEvDT(ev: EventForm): string {
  const j = (d: string, t: string) => {
    const dd = fmtD(d);
    return dd ? (t ? dd + ' ' + t : dd) : '';
  };
  const a = j(ev.d1, ev.t1);
  const b = j(ev.d2, ev.t2);
  if (!a) return b || '';
  return b ? a + '～' + b : a;
}

export function roleName(r: RoleType): string {
  return r === 'host' ? '主辦者' : r === 'co' ? '協辦者' : '參與者';
}
