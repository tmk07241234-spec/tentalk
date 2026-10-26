import type { AppState, Profile } from './store';

/**
 * What is kept in Firestore, and how it maps to the app state.
 *
 * users/{uid}               public profile, readable by signed-in users
 * users/{uid}/private/state everything else, readable only by the owner
 *
 * Photos and voice intros stay on the device until uploads to Storage exist, and
 * notifications and requests will come from the server, so neither is stored here.
 */
export type PublicProfile = Omit<Profile, 'photoUri' | 'voice'> & { languageOnly: boolean };

export type PrivateState = Pick<
  AppState,
  'mode' | 'trust' | 'todayGain' | 'callCount' | 'callLog' | 'following' | 'blocked' | 'settings' | 'history' | 'randomPausedUntil' | 'onboarded'
>;

export interface CloudAccount {
  profile: PublicProfile;
  state: PrivateState;
}

export function toCloud(s: AppState): CloudAccount | null {
  if (!s.profile) return null;
  const { photoUri: _photo, voice: _voice, ...profile } = s.profile;
  return {
    profile: { ...profile, languageOnly: s.settings.languageOnly },
    state: {
      mode: s.mode, trust: s.trust, todayGain: s.todayGain, callCount: s.callCount, callLog: s.callLog,
      following: s.following, blocked: s.blocked, settings: s.settings, history: s.history,
      randomPausedUntil: s.randomPausedUntil, onboarded: s.onboarded,
    },
  };
}

/** The state patch that restores a saved account on this device. */
export function fromCloud(c: CloudAccount): Pick<AppState, 'profile'> & Partial<PrivateState> {
  const { languageOnly: _languageOnly, ...profile } = c.profile;
  return { ...c.state, profile: { ...profile, photoUri: null, voice: null } };
}
