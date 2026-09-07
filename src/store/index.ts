import { create } from 'zustand';
import { createAuthSlice, type AuthSlice } from './slices/auth-slice';
import { createEventSlice, type EventSlice } from './slices/event-slice';
import { createMemberSlice, type MemberSlice } from './slices/member-slice';
import { createItemSlice, type ItemSlice } from './slices/item-slice';
import { createRuleSlice, type RuleSlice } from './slices/rule-slice';
import { createUISlice, type UISlice } from './slices/ui-slice';

export type AppStore = AuthSlice & EventSlice & MemberSlice & ItemSlice & RuleSlice & UISlice;

export const useStore = create<AppStore>()((...a) => ({
  ...createAuthSlice(...a),
  ...createEventSlice(...a),
  ...createMemberSlice(...a),
  ...createItemSlice(...a),
  ...createRuleSlice(...a),
  ...createUISlice(...a),
}));
