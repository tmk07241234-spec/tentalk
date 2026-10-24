import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { clampTrust } from '@/domain/callRules';
import type { Lang, UiLang } from '@/domain/languages';
import type { Level } from '@/domain/levels';
import type { Mode } from '@/domain/matching';
import type { SignInMethod } from '@/services/auth';

export interface LearningLang {
  lang: Lang;
  level: Level;
}

export interface Profile {
  name: string;
  color: string;
  photoUri: string | null;
  native: Lang;
  learning: LearningLang[];
  /** The learning language currently used on Home and for random calls. */
  activeLearn: Lang;
  /** False until hobbies, hours and a voice intro are added after setup. */
  complete: boolean;
}

export interface Settings {
  /** Show the "language only" badge on my profile. */
  languageOnly: boolean;
  /** In random calls, only match people with the badge. */
  languageOnlyPartners: boolean;
  switchCue: boolean;
  matchLevel: boolean;
}

interface AppState {
  /** null = follow the device language. */
  uiLang: UiLang | null;
  account: { method: SignInMethod; email: string | null } | null;
  profile: Profile | null;
  onboarded: boolean;
  mode: Mode;
  trust: number;
  todayGain: number;
  callCount: number;
  following: string[];
  blocked: string[];
  settings: Settings;

  setUiLang: (lang: UiLang | null) => void;
  completeSetup: (input: { account: NonNullable<AppState['account']>; profile: Profile }) => void;
  finishGuide: () => void;
  setMode: (mode: Mode) => void;
  setActiveLearn: (lang: Lang) => void;
  applyCallResult: (input: { trustDelta: number; todayGain: number }) => void;
  follow: (id: string) => void;
  block: (id: string) => void;
  signOut: () => void;
}

const initial = {
  uiLang: null,
  account: null,
  profile: null,
  onboarded: false,
  mode: 'buddy' as Mode,
  trust: 80,
  todayGain: 0,
  callCount: 0,
  following: [] as string[],
  blocked: [] as string[],
  settings: { languageOnly: true, languageOnlyPartners: true, switchCue: true, matchLevel: false },
};

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      ...initial,
      setUiLang: (uiLang) => set({ uiLang }),
      completeSetup: ({ account, profile }) => set({ account, profile, onboarded: false }),
      finishGuide: () => set({ onboarded: true }),
      setMode: (mode) => set({ mode }),
      setActiveLearn: (lang) => set((s) => (s.profile ? { profile: { ...s.profile, activeLearn: lang } } : s)),
      applyCallResult: ({ trustDelta, todayGain }) =>
        set((s) => ({ trust: clampTrust(s.trust + trustDelta), todayGain, callCount: s.callCount + 1 })),
      follow: (id) => set((s) => (s.following.includes(id) ? s : { following: [...s.following, id] })),
      block: (id) =>
        set((s) => ({ blocked: s.blocked.includes(id) ? s.blocked : [...s.blocked, id], following: s.following.filter((f) => f !== id) })),
      // Keeps the display language: it belongs to the device, not the account.
      signOut: () => set((s) => ({ ...initial, uiLang: s.uiLang })),
    }),
    {
      name: 'tentalk-app',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ setUiLang, completeSetup, finishGuide, setMode, setActiveLearn, applyCallResult, follow, block, signOut, ...data }) => data,
    },
  ),
);

/** The learning language and level used right now, or null before setup. */
export function useActiveLearning(): LearningLang | null {
  return useApp((s) => s.profile?.learning.find((l) => l.lang === s.profile?.activeLearn) ?? null);
}
