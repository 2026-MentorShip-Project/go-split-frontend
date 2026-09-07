import type { StateCreator } from 'zustand';
import type { Account, JoinInfo, RoleType } from '@/lib/types';

export interface AuthSlice {
  guest: boolean;
  role: RoleType;
  persona: RoleType;
  acc: Account;
  loginTab: 'acc' | 'code';
  loginTouched: boolean;
  firstJoin: boolean;
  blank: boolean;
  join2: JoinInfo;
  code: string;

  setGuest: (guest: boolean) => void;
  setRole: (role: RoleType) => void;
  setPersona: (persona: RoleType) => void;
  setAcc: (patch: Partial<Account>) => void;
  setLoginTab: (tab: 'acc' | 'code') => void;
  setLoginTouched: (v: boolean) => void;
  setFirstJoin: (v: boolean) => void;
  setBlank: (v: boolean) => void;
  setJoin2: (patch: Partial<JoinInfo>) => void;
  setCode: (code: string) => void;
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  guest: false,
  blank: false,
  role: 'host',
  persona: 'host',
  acc: { name: '小凱', mail: 'kai@example.com', pass: 'demo1234' },
  loginTab: 'acc',
  loginTouched: false,
  firstJoin: false,
  join2: { mail: 'kai@example.com', phone: '0912-345-678' },
  code: '4KQ2-8P',

  setGuest: (guest) => set({ guest }),
  setRole: (role) => set({ role }),
  setPersona: (persona) => set({ persona }),
  setAcc: (patch) => set((s) => ({ acc: { ...s.acc, ...patch } })),
  setLoginTab: (tab) => set({ loginTab: tab }),
  setLoginTouched: (v) => set({ loginTouched: v }),
  setFirstJoin: (v) => set({ firstJoin: v }),
  setBlank: (v) => set({ blank: v }),
  setJoin2: (patch) => set((s) => ({ join2: { ...s.join2, ...patch } })),
  setCode: (code) => set({ code }),
});
