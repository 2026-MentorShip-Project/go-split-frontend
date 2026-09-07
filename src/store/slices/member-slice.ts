import type { StateCreator } from 'zustand';
import type { Member, JoinForm } from '@/lib/types';

export interface MemberSlice {
  members: Member[];
  editMember: number | null;
  newMember: number | null;
  memberToast: string | null;
  memberAddAsk: number | null;
  join: JoinForm;
  mTagPick: number | null;
  mTagQuery: string;

  setMembers: (members: Member[]) => void;
  updateMember: (i: number, patch: Partial<Member>) => void;
  setEditMember: (i: number | null) => void;
  setNewMember: (i: number | null) => void;
  setMemberToast: (msg: string | null) => void;
  setMemberAddAsk: (i: number | null) => void;
  setJoin: (patch: Partial<JoinForm>) => void;
  setMTagPick: (i: number | null) => void;
  setMTagQuery: (q: string) => void;
  addMember: (member: Member) => void;
  removeMember: (i: number) => void;
}

export const createMemberSlice: StateCreator<MemberSlice, [], [], MemberSlice> = (set) => ({
  members: [
    { id: '010011', name: '小凱', role: '主辦者', tags: [], login: '帳號（10123）', guest: false },
    { id: '010012', name: '阿豪', role: '協辦者', tags: ['不喝酒'], login: '帳號（10456）', guest: false },
    { id: '010013', name: '小美', role: '參與者', tags: ['吃素'], login: '訪客登入 01000', guest: true, mail: 'mei@example.com', phone: '0912345678' },
    { id: '010014', name: '佳蓉', role: '參與者', tags: [], login: '訪客登入 01001', guest: true, mail: 'jung@example.com', phone: '0922333444' },
  ],
  editMember: null,
  newMember: null,
  memberToast: null,
  memberAddAsk: null,
  join: { name: '', conds: ['吃素'], note: '' },
  mTagPick: null,
  mTagQuery: '',

  setMembers: (members) => set({ members }),
  updateMember: (i, patch) =>
    set((s) => ({
      members: s.members.map((m, j) => (j === i ? { ...m, ...patch } : m)),
    })),
  setEditMember: (i) => set({ editMember: i }),
  setNewMember: (i) => set({ newMember: i }),
  setMemberToast: (msg) => set({ memberToast: msg }),
  setMemberAddAsk: (i) => set({ memberAddAsk: i }),
  setJoin: (patch) => set((s) => ({ join: { ...s.join, ...patch } })),
  setMTagPick: (i) => set({ mTagPick: i }),
  setMTagQuery: (q) => set({ mTagQuery: q }),
  addMember: (member) => set((s) => ({ members: [...s.members, member] })),
  removeMember: (i) =>
    set((s) => ({ members: s.members.filter((_, j) => j !== i) })),
});
