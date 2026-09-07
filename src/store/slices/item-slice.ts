import type { StateCreator } from 'zustand';
import type { ExpenseItem, Draft } from '@/lib/types';

export interface ItemSlice {
  itemsBy: Record<number, ExpenseItem[]>;
  paidBy2: Record<number, Record<string, boolean>>;
  draft: Draft;
  sel: number;
  paid: Record<string, boolean>;
  draftEdit: number | null;
  draftTouched: boolean;
  draftDiscardAsk: boolean;
  draftNeedAny: boolean;
  alertDraft: number | null;
  editDetail: number | null;
  detailTouched: boolean;
  newDetail: number | null;
  alertDetail: number | null;
  discardAsk: boolean;
  shareEdit: string | null;
  shareAlert: string | null;
  tagPick: string | null;
  tagQuery: Record<string, string>;
  backFrom: string | null;

  setItemsBy: (itemsBy: Record<number, ExpenseItem[]>) => void;
  updateItemsForEvent: (eventIdx: number, items: ExpenseItem[]) => void;
  setPaidBy2: (paidBy2: Record<number, Record<string, boolean>>) => void;
  setDraft: (draft: Draft) => void;
  patchDraft: (patch: Partial<Draft>) => void;
  setSel: (sel: number) => void;
  setPaid: (paid: Record<string, boolean>) => void;
  setDraftEdit: (i: number | null) => void;
  setDraftTouched: (v: boolean) => void;
  setDraftDiscardAsk: (v: boolean) => void;
  setDraftNeedAny: (v: boolean) => void;
  setAlertDraft: (i: number | null) => void;
  setEditDetail: (i: number | null) => void;
  setDetailTouched: (v: boolean) => void;
  setNewDetail: (i: number | null) => void;
  setAlertDetail: (i: number | null) => void;
  setDiscardAsk: (v: boolean) => void;
  setShareEdit: (key: string | null) => void;
  setShareAlert: (key: string | null) => void;
  setTagPick: (key: string | null) => void;
  setTagQuery: (patch: Record<string, string>) => void;
  setBackFrom: (screen: string | null) => void;
}

const defaultItemsBy: Record<number, ExpenseItem[]> = {
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
};

export const createItemSlice: StateCreator<ItemSlice, [], [], ItemSlice> = (set) => ({
  itemsBy: defaultItemsBy,
  paidBy2: { 0: {}, 1: {}, 2: { '010013>010011': true }, 3: {}, 4: {}, 5: {}, 6: {}, 7: { '010014>010011': true }, 8: {}, 9: {} },
  draft: { receipt: false, details: [] },
  sel: 0,
  paid: {},
  draftEdit: null,
  draftTouched: false,
  draftDiscardAsk: false,
  draftNeedAny: false,
  alertDraft: null,
  editDetail: null,
  detailTouched: false,
  newDetail: null,
  alertDetail: null,
  discardAsk: false,
  shareEdit: null,
  shareAlert: null,
  tagPick: null,
  tagQuery: {},
  backFrom: null,

  setItemsBy: (itemsBy) => set({ itemsBy }),
  updateItemsForEvent: (eventIdx, items) =>
    set((s) => ({ itemsBy: { ...s.itemsBy, [eventIdx]: items } })),
  setPaidBy2: (paidBy2) => set({ paidBy2 }),
  setDraft: (draft) => set({ draft }),
  patchDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  setSel: (sel) => set({ sel }),
  setPaid: (paid) => set({ paid }),
  setDraftEdit: (i) => set({ draftEdit: i }),
  setDraftTouched: (v) => set({ draftTouched: v }),
  setDraftDiscardAsk: (v) => set({ draftDiscardAsk: v }),
  setDraftNeedAny: (v) => set({ draftNeedAny: v }),
  setAlertDraft: (i) => set({ alertDraft: i }),
  setEditDetail: (i) => set({ editDetail: i }),
  setDetailTouched: (v) => set({ detailTouched: v }),
  setNewDetail: (i) => set({ newDetail: i }),
  setAlertDetail: (i) => set({ alertDetail: i }),
  setDiscardAsk: (v) => set({ discardAsk: v }),
  setShareEdit: (key) => set({ shareEdit: key }),
  setShareAlert: (key) => set({ shareAlert: key }),
  setTagPick: (key) => set({ tagPick: key }),
  setTagQuery: (patch) => set((s) => ({ tagQuery: { ...s.tagQuery, ...patch } })),
  setBackFrom: (screen) => set({ backFrom: screen }),
});
