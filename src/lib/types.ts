export interface Account {
  name: string;
  mail: string;
  pass: string;
}

export interface JoinInfo {
  mail: string;
  phone: string;
}

export interface JoinForm {
  name: string;
  conds: string[];
  note: string;
}

export interface EventForm {
  name: string;
  date: string;
  place: string;
  template: string;
  d1: string;
  t1: string;
  d2: string;
  t2: string;
}

export interface EventData {
  name: string;
  date: string;
  place: string;
  role: 'host' | 'co' | 'member';
  archived: boolean;
  settled?: boolean;
  template?: string;
}

export interface Member {
  id: string;
  name: string;
  role: '主辦者' | '協辦者' | '參與者';
  tags: string[];
  login: string;
  guest: boolean;
  mail?: string;
  phone?: string;
  note?: string;
  you?: boolean;
}

export interface ItemDetail {
  name: string;
  amount: number | string;
  tags: string[];
  note: string;
  ids: string[] | null;
  custom?: Record<string, string | number>;
}

export interface ExpenseItem {
  id: string;
  by: string;
  receipt: boolean;
  details: ItemDetail[];
}

export interface Draft {
  receipt: boolean;
  details: ItemDetail[];
}

export interface RuleGroup {
  conds: string[];
  mode: 'exclude' | 'weight';
  wt: string;
}

export interface Rule {
  tag: string;
  groups: RuleGroup[];
  rest?: {
    mode: 'exclude' | 'weight';
    wt: string;
  };
}

export interface TagEdit {
  kind: 'item' | 'cond';
  i: number;
  value: string;
  isNew?: boolean;
  dup?: boolean;
}

export interface TagMenu {
  kind: 'item' | 'cond';
  i: number;
}

export interface EventEdit {
  name: string;
  place: string;
  d1: string;
  t1: string;
  d2: string;
  t2: string;
  dateText?: string;
  touched?: boolean;
}

export interface EvSettings {
  rules: Rule[];
  members: Member[];
  itemTags: string[];
  condTags: string[];
}

export interface TemplateOption {
  label: string;
  hint: string;
  soon?: boolean;
}

export type RoleType = 'host' | 'co' | 'member';
export type ScreenName =
  | 'login' | 'register' | 'home' | 'create' | 'invite' | 'joinForm'
  | 'event' | 'group' | 'rules' | 'rulesEdit' | 'addItem' | 'itemDetail'
  | 'settle' | 'settleDone' | 'settledEvent' | 'payments'
  | 'archived' | 'pairDetail';

export interface ShareResult {
  inc: Member[];
  per: number;
  unit: number;
  restW: number;
  amount: number;
  map: Record<string, number>;
  fixedIds: string[];
  fixedSum: number;
  mismatch: boolean;
  diff: number;
  overflow: boolean;
}

export interface Transfer {
  key: string;
  from: Member;
  to: Member;
  amount: number;
}

export interface FlowLine {
  text: string;
  amount: string;
}

export interface FlowRow {
  name: string;
  role: string;
  lines: FlowLine[];
  summaryLabel: string;
  summary: string;
  positive: boolean;
  negative: boolean;
}
