import { isUploaded } from '@/domain/profile';
import type { AppState, Profile } from './store';

/**
 * What is kept in Firestore, and how it maps to the app state.
 *
 * users/{uid}               public profile, readable by signed-in users
 * users/{uid}/private/state everything else, readable only by the owner
 * users/{uid}/private/followers  who follows me; written by the server (see server/follows)
 *
 * Photos and voice intros are files in Storage; the profile keeps their download URLs,
 * and a file not uploaded yet is left out. Notifications and requests will come from
 * the server, so they are not stored here.
 */
export type PublicProfile = Profile & {
  languageOnly: boolean;
  /** Learning languages as a flat list, so others can search for practice buddies. */
  learnLangs: string[];
  /** Calls that reached 10 minutes, shown as "N completed calls". */
  calls: number;
  /** Presence, written by the app while open (see services/presence). Not part of the saved profile. */
  lastSeen?: number;
  inCall?: boolean;
};

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
  const { photoUri, voice, ...profile } = s.profile;
  return {
    profile: {
      ...profile,
      photoUri: photoUri && isUploaded(photoUri) ? photoUri : null,
      voice: voice && isUploaded(voice.uri) ? voice : null,
      languageOnly: s.settings.languageOnly,
      learnLangs: profile.learning.map((l) => l.lang),
      calls: s.callLog.filter((c) => c.completed).length,
    },
    state: {
      mode: s.mode, trust: s.trust, todayGain: s.todayGain, callCount: s.callCount, callLog: s.callLog,
      following: s.following, blocked: s.blocked, settings: s.settings, history: s.history,
      randomPausedUntil: s.randomPausedUntil, onboarded: s.onboarded,
    },
  };
}

/** The state patch that restores a saved account on this device. */
export function fromCloud(c: CloudAccount): Pick<AppState, 'profile'> & Partial<PrivateState> {
  const { languageOnly: _languageOnly, learnLangs: _learnLangs, calls: _calls, lastSeen: _lastSeen, inCall: _inCall, ...profile } = c.profile;
  return { ...c.state, profile: { ...profile, photoUri: profile.photoUri ?? null, voice: profile.voice ?? null } };
}
