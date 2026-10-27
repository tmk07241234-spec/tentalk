import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { clampTrust } from '@/domain/callRules';
import { canFollow, type RequestPolicy } from '@/domain/connections';
import type { Lang, UiLang } from '@/domain/languages';
import type { Level } from '@/domain/levels';
import type { Mode } from '@/domain/matching';
import { dayKey, type CallLogEntry } from '@/domain/progress';
import type { HoursRange } from '@/domain/schedule';
import type { SignInMethod } from '@/services/auth';
import type { fromCloud } from './cloudShape';

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
  bio: string;
  hobbies: string[];
  /** Available hours in this user's local time; null until set. */
  hours: HoursRange | null;
  /** Minutes east of UTC, so others see the hours in their own time. */
  utcOffset: number;
  /** Tentalk Plus icon frame; null = none. */
  frame?: FrameId | null;
  /** Self-introduction recording; null until recorded. */
  voice?: VoiceIntro | null;
}

export type FrameId = 'gold' | 'sakura' | 'wave';

export interface VoiceIntro {
  /**
   * Local file (native) or blob URL (web). Uploaded to storage once the backend exists;
   * until then a web recording does not survive a page reload.
   */
  uri: string;
  seconds: number;
}

export interface HistoryEntry {
  id: string;
  partnerId: string;
  kind: 'random' | 'direct';
  endedAt: number;
  seconds: number;
  completed: boolean;
  /** Random calls: both stayed 10 minutes, so the profile is open. */
  unlocked: boolean;
}

export type NotificationType = 'welcome' | 'theme' | 'followed' | 'accepted' | 'incoming' | 'reportResult';

export interface AppNotification {
  id: string;
  type: NotificationType;
  partnerId?: string;
  at: number;
  read: boolean;
  /** For accepted / incoming requests: after this the action button is gone. */
  expiresAt?: number;
  handled?: boolean;
}

export interface OutgoingRequest {
  partnerId: string;
  sentAt: number;
  expiresAt: number;
}

export interface Settings {
  /** Show the "language only" badge on my profile. */
  languageOnly: boolean;
  /** In random calls, only match people with the badge. */
  languageOnlyPartners: boolean;
  matchLevel: boolean;
  /** Who may send me a call request (see acceptsRequestFrom). */
  requestsFrom: RequestPolicy;
  requestAllowList: string[];
  /** Notifications I want besides incoming requests. Push uses the same switches once it exists. */
  notify: { accepted: boolean; followed: boolean; theme: boolean };
}

export interface AppState {
  /** null = follow the device language. */
  uiLang: UiLang | null;
  /** uid is the Firebase user id; accounts made before Firebase have none. */
  account: { method: SignInMethod; uid?: string; email: string | null } | null;
  profile: Profile | null;
  onboarded: boolean;
  mode: Mode;
  trust: number;
  todayGain: number;
  callCount: number;
  /** One entry per call; drives streaks, the weekly goal and badges. */
  callLog: CallLogEntry[];
  following: string[];
  /**
   * People who follow me. Comes from the server once it exists; until then the call
   * stand-in fills it (`src/services/connections.ts`).
   */
  followers: string[];
  blocked: string[];
  settings: Settings;
  history: HistoryEntry[];
  notifications: AppNotification[];
  requests: OutgoingRequest[];
  /** Tentalk Plus is active (from the store receipt once purchases are real). */
  plus: boolean;
  /** After hanging up early, random calls are paused until this time (ms). */
  randomPausedUntil: number;

  setUiLang: (lang: UiLang | null) => void;
  completeSetup: (input: { account: NonNullable<AppState['account']>; profile: Profile }) => void;
  finishGuide: () => void;
  /** Signing in to an account that already finished setup, e.g. on a new device. */
  restoreAccount: (input: { account: NonNullable<AppState['account']>; saved: ReturnType<typeof fromCloud> }) => void;
  setMode: (mode: Mode) => void;
  setActiveLearn: (lang: Lang) => void;
  applyCallResult: (input: { trustDelta: number; todayGain: number; minutes: number; completed: boolean; cooldownMinutes: number }) => void;
  /** Development only: fills the call log with a few days of calls. */
  seedDemoProgress: () => void;
  /** Only works for someone I finished a 10-minute call with (see canFollow). */
  follow: (id: string) => void;
  unfollow: (id: string) => void;
  addFollower: (id: string) => void;
  block: (id: string) => void;
  unblock: (id: string) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  addHistory: (entry: Omit<HistoryEntry, 'id'>) => void;
  notify: (n: Omit<AppNotification, 'id' | 'at' | 'read'> & { at?: number }) => void;
  markNotificationsRead: () => void;
  markHandled: (id: string) => void;
  addRequest: (r: OutgoingRequest) => void;
  setPlus: (on: boolean) => void;
  removeRequest: (partnerId: string) => void;
  signOut: () => void;
}

export const DEFAULT_SETTINGS: Settings = {
  languageOnly: true, languageOnlyPartners: true, matchLevel: false,
  requestsFrom: 'everyone', requestAllowList: [],
  notify: { accepted: true, followed: true, theme: true },
};

/** Saved settings from an older version lack newer fields; fill them with defaults. */
export function withSettingDefaults(saved: Partial<Settings> | undefined): Settings {
  return { ...DEFAULT_SETTINGS, ...saved, notify: { ...DEFAULT_SETTINGS.notify, ...saved?.notify } };
}

/** Notification types each user can switch off; the rest always arrive. */
const SWITCHABLE: Partial<Record<NotificationType, keyof Settings['notify']>> = { accepted: 'accepted', followed: 'followed', theme: 'theme' };

const initial = {
  uiLang: null,
  account: null,
  profile: null,
  onboarded: false,
  mode: 'buddy' as Mode,
  trust: 80,
  todayGain: 0,
  callCount: 0,
  callLog: [] as CallLogEntry[],
  following: [] as string[],
  followers: [] as string[],
  blocked: [] as string[],
  settings: DEFAULT_SETTINGS,
  history: [] as HistoryEntry[],
  notifications: [] as AppNotification[],
  requests: [] as OutgoingRequest[],
  plus: false,
  randomPausedUntil: 0,
};

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      ...initial,
      setUiLang: (uiLang) => set({ uiLang }),
      completeSetup: ({ account, profile }) =>
        set({
          account, profile, onboarded: false,
          notifications: [
            { id: newId(), type: 'welcome', at: Date.now(), read: false },
            { id: newId(), type: 'theme', at: Date.now() - 1000, read: false },
          ],
        }),
      finishGuide: () => set({ onboarded: true }),
      restoreAccount: ({ account, saved }) =>
        set((s) => ({ ...initial, uiLang: s.uiLang, onboarded: true, ...saved, settings: withSettingDefaults(saved.settings), account })),
      setMode: (mode) => set({ mode }),
      setActiveLearn: (lang) => set((s) => (s.profile ? { profile: { ...s.profile, activeLearn: lang } } : s)),
      applyCallResult: ({ trustDelta, todayGain, minutes, completed, cooldownMinutes }) =>
        set((s) => ({
          randomPausedUntil: cooldownMinutes > 0 ? Date.now() + cooldownMinutes * 60_000 : s.randomPausedUntil,
          trust: clampTrust(s.trust + trustDelta),
          todayGain,
          callCount: s.callCount + 1,
          callLog: [...s.callLog, { date: dayKey(new Date()), minutes, completed }],
        })),
      seedDemoProgress: () =>
        set(() => {
          const days = [1, 2, 3, 4, 8, 9].map((ago) => {
            const d = new Date();
            d.setDate(d.getDate() - ago);
            return { date: dayKey(d), minutes: 14, completed: true };
          });
          return { callLog: days, callCount: days.length };
        }),
      follow: (id) => set((s) => (s.following.includes(id) || !canFollow(s.history, id) ? s : { following: [...s.following, id] })),
      unfollow: (id) => set((s) => ({ following: s.following.filter((f) => f !== id) })),
      addFollower: (id) => set((s) => (s.followers.includes(id) || s.blocked.includes(id) ? s : { followers: [...s.followers, id] })),
      block: (id) =>
        set((s) => ({
          blocked: s.blocked.includes(id) ? s.blocked : [...s.blocked, id],
          following: s.following.filter((f) => f !== id),
          followers: s.followers.filter((f) => f !== id),
          requests: s.requests.filter((r) => r.partnerId !== id),
        })),
      unblock: (id) => set((s) => ({ blocked: s.blocked.filter((b) => b !== id) })),
      updateProfile: (patch) => set((s) => (s.profile ? { profile: { ...s.profile, ...patch } } : s)),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      addHistory: (entry) => set((s) => ({ history: [{ ...entry, id: newId() }, ...s.history].slice(0, 200) })),
      notify: ({ at, ...n }) =>
        set((s) => (SWITCHABLE[n.type] && !s.settings.notify[SWITCHABLE[n.type]!] ? s : { notifications: [{ ...n, id: newId(), at: at ?? Date.now(), read: false }, ...s.notifications].slice(0, 100) })),
      markNotificationsRead: () =>
        set((s) => (s.notifications.some((n) => !n.read) ? { notifications: s.notifications.map((n) => ({ ...n, read: true })) } : s)),
      markHandled: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, handled: true, read: true } : n)) })),
      addRequest: (r) => set((s) => ({ requests: [...s.requests.filter((x) => x.partnerId !== r.partnerId), r] })),
      setPlus: (plus) => set((s) => ({ plus, profile: s.profile && !plus ? { ...s.profile, frame: null } : s.profile })),
      removeRequest: (partnerId) => set((s) => ({ requests: s.requests.filter((r) => r.partnerId !== partnerId) })),
      // Keeps the display language: it belongs to the device, not the account.
      signOut: () => set((s) => ({ ...initial, uiLang: s.uiLang })),
    }),
    {
      name: 'tentalk-app',
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      // Only data is saved; functions are recreated on load.
      partialize: (s) => Object.fromEntries(Object.entries(s).filter(([, v]) => typeof v !== 'function')) as Partial<AppState>,
      migrate: (persisted, version) => {
        const s = (persisted ?? {}) as Partial<AppState> & { profile?: Profile & { complete?: boolean } };
        if (version < 2 && s.profile) {
          const { complete: _complete, ...rest } = s.profile;
          s.profile = Object.assign({ bio: '', hobbies: [], hours: null, utcOffset: -new Date().getTimezoneOffset() }, rest);
        }
        return { ...initial, ...s, settings: withSettingDefaults(s.settings) } as AppState;
      },
    },
  ),
);

/** The learning language and level used right now, or null before setup. */
export function useActiveLearning(): LearningLang | null {
  return useApp((s) => s.profile?.learning.find((l) => l.lang === s.profile?.activeLearn) ?? null);
}
