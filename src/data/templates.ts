import type { Member, ExpenseItem, ItemDetail, EvSettings } from '@/lib/types';

function outdoorMemberTags(name: string): string[] {
  const map: Record<string, string[]> = {
    '小凱': ['大人', '不喝酒/開車'],
    '阿豪': ['大人', '需搭主辦的車'],
    '小美': ['大人', '吃素', '自行前往'],
    '佳蓉': ['小孩', '需搭主辦的車'],
  };
  return (map[name] || ['大人']).slice();
}

export function bbqRoster(): Member[] {
  const mk = (n: number, name: string, role: Member['role'], tags: string[], extra?: Partial<Member>): Member =>
    Object.assign(
      {
        id: '0100' + (10 + n),
        name,
        role,
        tags,
        login: role === '參與者' ? '訪客登入 010' + (10 + n) : '帳號（10' + (100 + n) + '）',
        guest: role === '參與者',
      },
      extra || {},
    );
  return [
    mk(1, '小凱', '主辦者', ['大人', '不喝酒/開車']),
    mk(2, '阿豪', '協辦者', ['大人', '需搭主辦的車']),
    mk(3, '家豪', '協辦者', ['大人', '自行前往']),
    mk(4, '佩君', '協辦者', ['大人', '晚到', '需搭主辦的車']),
    mk(5, '小美', '參與者', ['大人', '吃素', '需搭主辦的車'], { mail: 'mei@example.com', phone: '0912345678' }),
    mk(6, '佳蓉', '參與者', ['大人', '海鮮過敏', '自行前往'], { mail: 'jung@example.com', phone: '0922333444' }),
    mk(7, '阿哲', '參與者', ['大人', '需搭主辦的車']),
    mk(8, '宜庭', '參與者', ['大人', '吃素', '自行前往']),
    mk(9, '冠廷', '參與者', ['大人', '不喝酒/開車', '自行前往']),
    mk(10, '雅婷', '參與者', ['大人', '需搭主辦的車']),
    mk(11, '小樂', '參與者', ['小孩', '需搭主辦的車']),
    mk(12, '小圓', '參與者', ['小孩', '需搭主辦的車']),
    mk(13, '承翰', '參與者', ['大人', '晚到', '自行前往']),
    mk(14, '品妤', '參與者', ['大人', '海鮮過敏', '需搭主辦的車']),
    mk(15, '又寧', '參與者', ['大人', '需搭主辦的車']),
  ];
}

export function bbqItems(): ExpenseItem[] {
  const d = (name: string, amount: number, tags?: string[], note?: string): ItemDetail =>
    ({ name, amount, tags: tags || [], note: note || '', ids: null });
  return [
    { id: 'q1', by: '小凱', receipt: true, details: [
      d('烤肉肉品組', 3600, ['肉品'], '牛豬雞各兩份'),
      d('蔬菜與菇類', 900, ['蔬菜']),
      d('海鮮拼盤', 2400, ['海鮮'], '蝦、蛤蜊、透抽'),
    ] },
    { id: 'q2', by: '阿豪', receipt: false, details: [
      d('白飯與麵包', 800, ['主食']),
      d('烤肉醬與調味料', 350, ['調味料']),
    ] },
    { id: 'q3', by: '小美', receipt: true, details: [
      d('啤酒與氣泡酒', 1500, ['酒精飲品']),
      d('無酒精飲料', 600, ['無酒精飲品'], '茶與汽水'),
    ] },
    { id: 'q4', by: '家豪', receipt: false, details: [
      d('場地與烤爐租借', 2400, ['場地費'], '含木炭'),
      d('免洗餐具與清潔用品', 480, ['免洗餐具']),
    ] },
    { id: 'q5', by: '小凱', receipt: false, details: [
      d('共乘油錢與停車', 1200, ['交通費'], '兩台車'),
    ] },
  ];
}

export function outdoorSeedItems(i: number): ExpenseItem[] {
  const d = (name: string, amount: number, tags?: string[], note?: string): ItemDetail =>
    ({ name, amount, tags: tags || [], note: note || '', ids: null });
  if (i === 1) return [
    { id: 'c1', by: '小凱', receipt: true, details: [
      d('帳篷與睡袋租借', 2400, ['設備租借費'], '兩帳四袋'),
      d('營位費用', 1800, ['場地費'], '兩晚'),
    ] },
    { id: 'c2', by: '阿豪', receipt: false, details: [
      d('烤肉肉品', 1600, ['肉品']),
      d('生鮮蔬菜', 520, ['蔬菜']),
    ] },
    { id: 'c3', by: '小美', receipt: true, details: [
      d('啤酒一箱', 600, ['酒精飲品']),
      d('礦泉水與果汁', 320, ['無酒精飲品']),
    ] },
    { id: 'c4', by: '佳蓉', receipt: false, details: [
      d('來回油錢', 900, ['交通費'], '兩台車'),
    ] },
  ];
  if (i === 3) return [
    { id: 'g1', by: '小凱', receipt: true, details: [
      d('烤肉食材組合', 2800, ['肉品'], '含海鮮拼盤'),
      d('鮮蝦與蛤蜊', 1200, ['海鮮']),
      d('木炭與烤具', 700, ['烤肉工具']),
    ] },
    { id: 'g2', by: '阿豪', receipt: false, details: [
      d('飲料與啤酒', 1100, ['酒精飲品'], '啤酒另計'),
      d('無糖茶飲', 380, ['無酒精飲品']),
    ] },
    { id: 'g3', by: '小美', receipt: false, details: [
      d('免洗餐具', 260, ['免洗餐具']),
      d('烤肉醬與鹽', 240, ['調味料']),
    ] },
  ];
  return [];
}

export { outdoorMemberTags };

export function outdoorEvSettingsData(baseMembers: Member[]): EvSettings {
  return {
    rules: [
      { tag: '肉品', groups: [
        { conds: ['吃素'], mode: 'exclude', wt: '' },
        { conds: ['小孩'], mode: 'weight', wt: '0.5' },
        { conds: ['晚到'], mode: 'weight', wt: '0.5' },
      ] },
      { tag: '蔬菜', groups: [
        { conds: ['吃素'], mode: 'weight', wt: '1.5' },
        { conds: ['小孩'], mode: 'weight', wt: '0.5' },
      ] },
      { tag: '海鮮', groups: [
        { conds: ['海鮮過敏'], mode: 'exclude', wt: '' },
        { conds: ['小孩'], mode: 'weight', wt: '0.5' },
      ] },
      { tag: '主食', groups: [
        { conds: ['小孩'], mode: 'weight', wt: '0.5' },
      ] },
      { tag: '酒精飲品', groups: [
        { conds: ['不喝酒/開車'], mode: 'exclude', wt: '' },
        { conds: ['小孩'], mode: 'exclude', wt: '' },
      ] },
      { tag: '交通費', groups: [
        { conds: ['自行前往'], mode: 'exclude', wt: '' },
        { conds: ['需搭主辦的車'], mode: 'weight', wt: '1' },
      ], rest: { mode: 'exclude', wt: '' } },
    ],
    condTags: ['吃素', '大人', '小孩', '晚到', '海鮮過敏', '不喝酒/開車', '自行前往', '需搭主辦的車'],
    itemTags: ['肉品', '蔬菜', '海鮮', '主食', '水果', '甜點', '酒精飲品', '無酒精飲品',
      '調味料', '烤肉工具', '露營工具', '免洗餐具', '清潔用品', '場地費', '設備租借費', '交通費'],
    members: (baseMembers || []).map(m => ({ ...m, tags: outdoorMemberTags(m.name) })),
  };
}
