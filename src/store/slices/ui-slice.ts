import type { StateCreator } from 'zustand';

export interface UISlice {
  menuOpen: boolean;
  menuIn: boolean;
  expand: Record<string, boolean>;
  copied: boolean;
  copiedReport: boolean;
  paidAsk: boolean;
  evInfoCollapsed: boolean;
  evNameTouched: boolean;
  joinTouched: boolean;
  dragG: number | null;
  tourReplay: string | null;

  setMenuOpen: (v: boolean) => void;
  setMenuIn: (v: boolean) => void;
  toggleExpand: (key: string) => void;
  setExpand: (expand: Record<string, boolean>) => void;
  setCopied: (v: boolean) => void;
  setCopiedReport: (v: boolean) => void;
  setPaidAsk: (v: boolean) => void;
  setEvInfoCollapsed: (v: boolean) => void;
  setEvNameTouched: (v: boolean) => void;
  setJoinTouched: (v: boolean) => void;
  setDragG: (i: number | null) => void;
  setTourReplay: (key: string | null) => void;
  openMenu: () => void;
  closeMenu: () => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  menuOpen: false,
  menuIn: false,
  expand: {},
  copied: false,
  copiedReport: false,
  paidAsk: false,
  evInfoCollapsed: false,
  evNameTouched: false,
  joinTouched: false,
  dragG: null,
  tourReplay: null,

  setMenuOpen: (v) => set({ menuOpen: v }),
  setMenuIn: (v) => set({ menuIn: v }),
  toggleExpand: (key) =>
    set((s) => ({ expand: { ...s.expand, [key]: !s.expand[key] } })),
  setExpand: (expand) => set({ expand }),
  setCopied: (v) => set({ copied: v }),
  setCopiedReport: (v) => set({ copiedReport: v }),
  setPaidAsk: (v) => set({ paidAsk: v }),
  setEvInfoCollapsed: (v) => set({ evInfoCollapsed: v }),
  setEvNameTouched: (v) => set({ evNameTouched: v }),
  setJoinTouched: (v) => set({ joinTouched: v }),
  setDragG: (i) => set({ dragG: i }),
  setTourReplay: (key) => set({ tourReplay: key }),
  openMenu: () => set({ menuOpen: true, menuIn: true }),
  closeMenu: () => {
    set({ menuIn: false });
    setTimeout(() => set({ menuOpen: false }), 320);
  },
});
