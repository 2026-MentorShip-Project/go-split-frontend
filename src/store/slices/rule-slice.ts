import type { StateCreator } from 'zustand';
import type { Rule, TagEdit, TagMenu } from '@/lib/types';

export interface RuleSlice {
  rules: Rule[];
  itemTags: string[];
  condTags: string[];
  ruleEdit: number | null;
  ruleNew: boolean;
  ruleAlert: number | null;
  rulePick: string | null;
  ruleTagQuery: string;
  ruleCondQuery: string;
  tagEdit: TagEdit | null;
  tagMenu: TagMenu | null;
  tagUsedAsk: { text: string } | null;
  tagToast: string | null;
  secShut: Record<string, boolean>;
  secEdit: Record<string, boolean>;

  setRules: (rules: Rule[]) => void;
  updateRule: (i: number, patch: Partial<Rule>) => void;
  setItemTags: (tags: string[]) => void;
  setCondTags: (tags: string[]) => void;
  setRuleEdit: (i: number | null) => void;
  setRuleNew: (v: boolean) => void;
  setRuleAlert: (i: number | null) => void;
  setRulePick: (v: string | null) => void;
  setRuleTagQuery: (q: string) => void;
  setRuleCondQuery: (q: string) => void;
  setTagEdit: (v: TagEdit | null) => void;
  setTagMenu: (v: TagMenu | null) => void;
  setTagUsedAsk: (v: { text: string } | null) => void;
  setTagToast: (v: string | null) => void;
  setSecShut: (patch: Record<string, boolean>) => void;
  setSecEdit: (patch: Record<string, boolean>) => void;
}

export const createRuleSlice: StateCreator<RuleSlice, [], [], RuleSlice> = (set) => ({
  rules: [],
  itemTags: [],
  condTags: [],
  ruleEdit: null,
  ruleNew: false,
  ruleAlert: null,
  rulePick: null,
  ruleTagQuery: '',
  ruleCondQuery: '',
  tagEdit: null,
  tagMenu: null,
  tagUsedAsk: null,
  tagToast: null,
  secShut: {},
  secEdit: {},

  setRules: (rules) => set({ rules }),
  updateRule: (i, patch) =>
    set((s) => ({
      rules: s.rules.map((r, j) => (j === i ? { ...r, ...patch } : r)),
    })),
  setItemTags: (tags) => set({ itemTags: tags }),
  setCondTags: (tags) => set({ condTags: tags }),
  setRuleEdit: (i) => set({ ruleEdit: i }),
  setRuleNew: (v) => set({ ruleNew: v }),
  setRuleAlert: (i) => set({ ruleAlert: i }),
  setRulePick: (v) => set({ rulePick: v }),
  setRuleTagQuery: (q) => set({ ruleTagQuery: q }),
  setRuleCondQuery: (q) => set({ ruleCondQuery: q }),
  setTagEdit: (v) => set({ tagEdit: v }),
  setTagMenu: (v) => set({ tagMenu: v }),
  setTagUsedAsk: (v) => set({ tagUsedAsk: v }),
  setTagToast: (v) => set({ tagToast: v }),
  setSecShut: (patch) => set((s) => ({ secShut: { ...s.secShut, ...patch } })),
  setSecEdit: (patch) => set((s) => ({ secEdit: { ...s.secEdit, ...patch } })),
});
