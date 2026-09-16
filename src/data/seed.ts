import type {
  Account,
  JoinInfo,
  JoinForm,
  EventForm,
  EventData,
  Member,
  ExpenseItem,
  Draft,
  Rule,
  TemplateOption,
} from '@/lib/types';

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export interface AppState {
  screen: string;
  guest: boolean;
  blank: boolean;
  role: string;
  persona: string;
  acc: Account;
  loginTab: string;
  firstJoin: boolean;
  join2: JoinInfo;
  code: string;
  ev: EventForm;
  events: EventData[];
  paidAsk: boolean;
  evEdit: null;
  cur: number;
  join: JoinForm;
  settingsBy: Record<string, unknown>;
  itemTags: string[];
  condTags: string[];
  rules: Rule[];
  members: Member[];
  itemsBy: Record<number, ExpenseItem[]>;
  paidBy2: Record<number, Record<string, boolean>>;
  draft: Draft;
  tagEdit: null;
  tagMenu: null;
  tagUsedAsk: null;
  ruleEdit: null;
  ruleAlert: null;
  rulePick: null;
  ruleTagQuery: string;
  ruleCondQuery: string;
  expand: Record<string, boolean>;
  selPair: null;
  sel: number;
  editMember: null;
  delAsk: null;
  newMember: null;
  memberToast: null;
  tagToast: null;
  copied: boolean;
  copiedReport: boolean;
  settled: boolean;
  settleTab: string;
  transferNote: string;
  paid: Record<string, boolean>;
}

export const INITIAL_STATE: AppState = {
  screen: 'login',
  guest: false,
  blank: false,
  role: 'host',
  persona: 'host',
  acc: { name: '小凱', mail: 'kai@example.com', pass: 'demo1234' },
  loginTab: 'acc',
  firstJoin: false,
  join2: { mail: '', phone: '' },
  code: '4KQ2-8P',
  ev: { name: '', date: '', place: '', template: '自訂', d1: '', t1: '', d2: '', t2: '' },
  events: [
    { name: '公司烤肉聚會', date: '8/22（五）19:00', place: '大安區 好客燒肉', role: 'host', archived: false },
    { name: '週末露營裝備分攤', date: '9/5（六）09:00', place: '南投 武界露營區', role: 'member', archived: false },
    { name: '七月生日會', date: '7/12（六）18:00', place: '信義區 Rooftop Bar', role: 'member', archived: true },
    { name: '中秋公司烤肉', date: '9/26（六）17:00', place: '內湖 河濱烤肉區', role: 'host', archived: false, template: '烤肉/露營模板' },
    { name: '期末慶功 KTV', date: '9/12（六）21:00', place: '西門町 星聚點', role: 'member', archived: false, template: '唱歌模板' },
    { name: '沖繩四天三夜', date: '10/4（六）08:00', place: '日本 沖繩・那霸', role: 'co', archived: false, template: '出國旅遊模板' },
    { name: '攝影社淡水外拍', date: '9/20（六）13:00', place: '淡水 漁人碼頭', role: 'member', archived: false, template: '社團活動模板' },
    { name: '系友會春酒', date: '8/8（五）18:30', place: '中山區 老四川', role: 'host', archived: false, settled: true, template: '聚餐模板' },
    { name: '羽球團月底結算', date: '8/30（六）10:00', place: '松山運動中心', role: 'member', archived: false, settled: true, template: '社團活動模板' },
    { name: '同事送別會', date: '8/15（五）19:30', place: '大同區 居酒屋', role: 'co', archived: false, settled: true, template: '聚餐模板' },
  ],
  paidAsk: false,
  evEdit: null,
  cur: 0,
  join: { name: '', conds: ['吃素'], note: '' },
  settingsBy: {},
  itemTags: ['肉', '酒', '素食', '交通', '其他'],
  condTags: ['吃素', '不喝酒', '不吃牛', '食物過敏'],
  rules: [
    { tag: '肉', groups: [{ conds: ['吃素'], mode: 'exclude', wt: '' }] },
    { tag: '酒', groups: [{ conds: ['不喝酒'], mode: 'exclude', wt: '' }, { conds: ['食物過敏'], mode: 'weight', wt: '0.5' }] },
  ],
  members: [
    { id: '010011', name: '小凱', role: '主辦者', tags: [], login: '帳號（10123）', guest: false },
    { id: '010012', name: '阿豪', role: '協辦者', tags: ['不喝酒'], login: '帳號（10456）', guest: false },
    { id: '010013', name: '小美', role: '參與者', tags: ['吃素'], login: '訪客登入 01000', guest: true, mail: 'mei@example.com', phone: '0912345678' },
    { id: '010014', name: '佳蓉', role: '參與者', tags: [], login: '訪客登入 01001', guest: true, mail: 'jung@example.com', phone: '0922333444' },
  ],
  itemsBy: {
    0: [
      { id: 'i1', by: '小凱', receipt: true, details: [
        { name: '包廂場地費', amount: 1200, tags: [], note: '低消已折抵', ids: null },
        { name: '燒肉主餐', amount: 3600, tags: ['肉'], note: '含服務費 10%', ids: null },
        { name: '清酒兩瓶', amount: 800, tags: ['酒'], note: '', ids: null },
      ] },
      { id: 'i2', by: '阿豪', receipt: false, details: [
        { name: '超商飲料', amount: 360, tags: [], note: '', ids: null },
      ] },
    ],
    1: [
      { id: 'c1', by: '小凱', receipt: true, details: [
        { name: '帳篷與睡袋租借', amount: 2400, tags: [], note: '兩帳四袋', ids: null },
        { name: '烤肉食材（肉品）', amount: 1800, tags: ['肉'], note: '', ids: null },
        { name: '啤酒一箱', amount: 600, tags: ['酒'], note: '', ids: null },
      ] },
      { id: 'c2', by: '阿豪', receipt: false, details: [
        { name: '來回油錢', amount: 900, tags: ['交通'], note: '兩台車均分', ids: null },
      ] },
    ],
    2: [
      { id: 'b1', by: '小美', receipt: true, details: [
        { name: '生日蛋糕', amount: 1280, tags: [], note: '八吋草莓', ids: null },
        { name: '氣球佈置', amount: 460, tags: [], note: '', ids: null },
      ] },
      { id: 'b2', by: '小凱', receipt: false, details: [
        { name: '調酒材料', amount: 900, tags: ['酒'], note: '', ids: null },
        { name: '炸物拼盤', amount: 600, tags: ['肉'], note: '', ids: null },
      ] },
    ],
    3: [
      { id: 'g1', by: '小凱', receipt: true, details: [
        { name: '烤肉食材組合', amount: 2800, tags: ['肉'], note: '含海鮮拼盤', ids: null },
        { name: '木炭與烤具', amount: 700, tags: [], note: '', ids: null },
      ] },
      { id: 'g2', by: '阿豪', receipt: false, details: [
        { name: '飲料與啤酒', amount: 1100, tags: ['酒'], note: '啤酒另計', ids: null },
      ] },
    ],
    4: [
      { id: 'k1', by: '阿豪', receipt: true, details: [
        { name: '包廂費 3 小時', amount: 2400, tags: [], note: '假日時段', ids: null },
        { name: '酒水無限暢飲', amount: 1600, tags: ['酒'], note: '', ids: null },
      ] },
      { id: 'k2', by: '佳蓉', receipt: false, details: [
        { name: '宵夜炸物', amount: 540, tags: ['肉'], note: '', ids: null },
      ] },
    ],
    5: [
      { id: 't1', by: '小凱', receipt: true, details: [
        { name: '來回機票 4 人', amount: 32800, tags: ['交通'], note: '含行李', ids: null },
        { name: '民宿三晚', amount: 18600, tags: [], note: '兩間雙人房', ids: null },
      ] },
      { id: 't3', by: '阿豪', receipt: false, details: [
        { name: '機場接送', amount: 2400, tags: ['交通'], note: '來回兩趟', ids: null },
      ] },
      { id: 't2', by: '小美', receipt: false, details: [
        { name: '租車與油錢', amount: 6400, tags: ['交通'], note: '四天', ids: null },
        { name: '個人紀念品', amount: 1200, tags: ['其他'], note: '個人消費另計', ids: null },
      ] },
    ],
    6: [
      { id: 'p1', by: '佳蓉', receipt: true, details: [
        { name: '器材租借', amount: 1800, tags: [], note: '鏡頭與腳架', ids: null },
        { name: '模特兒車馬費', amount: 2000, tags: [], note: '', ids: null },
      ] },
      { id: 'p2', by: '小美', receipt: false, details: [
        { name: '團體交通', amount: 720, tags: ['交通'], note: '捷運＋公車', ids: null },
      ] },
    ],
    7: [
      { id: 's1', by: '小凱', receipt: true, details: [
        { name: '桌菜 4 桌', amount: 24000, tags: ['肉'], note: '含服務費', ids: null },
        { name: '紅酒六瓶', amount: 4800, tags: ['酒'], note: '', ids: null },
      ] },
      { id: 's2', by: '阿豪', receipt: true, details: [
        { name: '場地佈置', amount: 2600, tags: [], note: '', ids: null },
      ] },
    ],
    8: [
      { id: 'b1', by: '小凱', receipt: true, details: [
        { name: '場地租借 3 小時', amount: 2400, tags: [], note: '含球網', ids: null },
        { name: '羽球 2 筒', amount: 1200, tags: [], note: '', ids: null },
      ] },
      { id: 'b2', by: '阿豪', receipt: false, details: [
        { name: '運動飲料', amount: 480, tags: [], note: '', ids: null },
      ] },
    ],
    9: [
      { id: 'f1', by: '阿豪', receipt: true, details: [
        { name: '居酒屋主餐', amount: 8600, tags: ['肉'], note: '含服務費', ids: null },
        { name: '清酒兩瓶', amount: 1800, tags: ['酒'], note: '', ids: null },
      ] },
      { id: 'f2', by: '小美', receipt: false, details: [
        { name: '送別禮物', amount: 1500, tags: [], note: '大家均分', ids: null },
      ] },
    ],
  },
  paidBy2: { 0: {}, 1: {}, 2: { '010013>010011': true }, 3: {}, 4: {}, 5: {}, 6: {}, 7: { '010014>010011': true }, 8: {}, 9: {} },
  draft: { receipt: false, details: [] },
  tagEdit: null,
  tagMenu: null,
  tagUsedAsk: null,
  ruleEdit: null,
  ruleAlert: null,
  rulePick: null,
  ruleTagQuery: '',
  ruleCondQuery: '',
  expand: {},
  selPair: null,
  sel: 0,
  editMember: null,
  delAsk: null,
  newMember: null,
  memberToast: null,
  tagToast: null,
  copied: false,
  copiedReport: false,
  settled: false,
  settleTab: 'split',
  transferNote: '請大家於 09/12 前繳款至（013）012122131314',
  paid: {},
};

export const TEMPLATE_OPTS: TemplateOption[] = [
  { label: '自訂', hint: '自行設定分攤方式與規則' },
  { label: '烤肉/露營模板', hint: '依飲食習慣分攤' },
  { label: '聚餐模板', hint: '均分＋肉／酒標籤自動排除', soon: true },
  { label: '唱歌模板', hint: '包廂費均分、酒水另計', soon: true },
  { label: '出國旅遊模板', hint: '住宿與交通均分、個人消費另計', soon: true },
  { label: '社團活動模板', hint: '場地與器材均分、缺席者排除', soon: true },
];
