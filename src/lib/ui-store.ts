"use client";

import { create } from "zustand";

type User = { id: string; mobile: string; fullName: string | null; email: string | null; role: string };

type UIStore = {
  // auth modal
  authOpen: boolean;
  authMode: "login" | "register";
  openAuth: (mode?: "login" | "register") => void;
  closeAuth: () => void;

  // user panel
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  setPanelTab: (t: string) => void;
  panelTab: string;

  // chatbot
  chatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  chatPrefill?: string;
  setChatPrefill: (m?: string) => void;

  // consultation modal
  consultOpen: boolean;
  openConsult: (topic?: string) => void;
  closeConsult: () => void;
  consultTopic?: string;

  // custom package modal
  pkgOpen: boolean;
  openPkg: (hints?: Record<string, any>) => void;
  closePkg: () => void;
  pkgHints?: Record<string, any>;

  // mobile menu
  menuOpen: boolean;
  setMenu: (v: boolean) => void;

  // user
  user: User | null;
  setUser: (u: User | null) => void;
};

export const useUI = create<UIStore>((set) => ({
  authOpen: false,
  authMode: "login",
  openAuth: (mode = "login") => set({ authOpen: true, authMode: mode }),
  closeAuth: () => set({ authOpen: false }),

  panelOpen: false,
  panelTab: "profile",
  openPanel: () => set({ panelOpen: true }),
  closePanel: () => set({ panelOpen: false }),
  setPanelTab: (t) => set({ panelTab: t }),

  chatOpen: false,
  openChat: () => set({ chatOpen: true }),
  closeChat: () => set({ chatOpen: false }),
  chatPrefill: undefined,
  setChatPrefill: (m) => set({ chatPrefill: m }),

  consultOpen: false,
  consultTopic: undefined,
  openConsult: (topic) => set({ consultOpen: true, consultTopic: topic }),
  closeConsult: () => set({ consultOpen: false }),

  pkgOpen: false,
  pkgHints: undefined,
  openPkg: (hints) => set({ pkgOpen: true, pkgHints: hints }),
  closePkg: () => set({ pkgOpen: false }),

  menuOpen: false,
  setMenu: (v) => set({ menuOpen: v }),

  user: null,
  setUser: (u) => set({ user: u }),
}));
