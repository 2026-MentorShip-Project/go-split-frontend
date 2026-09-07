import type { StateCreator } from 'zustand';
import type { EventData, EventForm, EventEdit, EvSettings } from '@/lib/types';

export interface EventSlice {
  events: EventData[];
  cur: number;
  ev: EventForm;
  evEdit: EventEdit | null;
  settingsBy: Record<number, EvSettings>;
  settled: boolean;
  settleTab: 'split' | 'event';
  settleAsk: boolean;
  transferNote: string;

  setEvents: (events: EventData[]) => void;
  setCur: (cur: number) => void;
  setEv: (patch: Partial<EventForm>) => void;
  setEvEdit: (evEdit: EventEdit | null) => void;
  patchEvEdit: (patch: Partial<EventEdit>) => void;
  setSettingsBy: (settingsBy: Record<number, EvSettings>) => void;
  setSettled: (settled: boolean) => void;
  setSettleTab: (tab: 'split' | 'event') => void;
  setSettleAsk: (v: boolean) => void;
  setTransferNote: (note: string) => void;
}

export const createEventSlice: StateCreator<EventSlice, [], [], EventSlice> = (set) => ({
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
  cur: 0,
  ev: { name: '', date: '', place: '', template: '自訂', d1: '', t1: '', d2: '', t2: '' },
  evEdit: null,
  settingsBy: {},
  settled: false,
  settleTab: 'split',
  settleAsk: false,
  transferNote: '請大家於 09/12 前繳款至（013）012122131314',

  setEvents: (events) => set({ events }),
  setCur: (cur) => set({ cur }),
  setEv: (patch) => set((s) => ({ ev: { ...s.ev, ...patch } })),
  setEvEdit: (evEdit) => set({ evEdit }),
  patchEvEdit: (patch) => set((s) => ({ evEdit: s.evEdit ? { ...s.evEdit, ...patch } : null })),
  setSettingsBy: (settingsBy) => set({ settingsBy }),
  setSettled: (settled) => set({ settled }),
  setSettleTab: (tab) => set({ settleTab: tab }),
  setSettleAsk: (v) => set({ settleAsk: v }),
  setTransferNote: (note) => set({ transferNote: note }),
});
