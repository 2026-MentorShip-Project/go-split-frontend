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
  events: [],
  cur: 0,
  ev: { name: '', date: '', place: '', template: '自訂', d1: '', t1: '', d2: '', t2: '' },
  evEdit: null,
  settingsBy: {},
  settled: true,
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
