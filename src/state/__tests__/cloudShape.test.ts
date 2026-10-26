import { fromCloud, toCloud } from '../cloudShape';
import type { AppState, Profile } from '../store';

const profile: Profile = {
  name: 'Aki', color: '#3355ff', photoUri: 'file:///photo.jpg', native: 'ja',
  learning: [{ lang: 'en', level: 3 }], activeLearn: 'en', bio: 'hi', hobbies: ['music'],
  hours: null, utcOffset: 540, frame: null, voice: { uri: 'blob:x', seconds: 8 },
};

const state = {
  profile, mode: 'buddy', trust: 85, todayGain: 2, callCount: 4,
  callLog: [{ date: '2026-10-01', minutes: 12, completed: true }],
  following: ['p1'], blocked: ['p9'],
  settings: { languageOnly: false, languageOnlyPartners: true, switchCue: true, matchLevel: false },
  history: [], randomPausedUntil: 0, onboarded: true,
  notifications: [{ id: 'n', type: 'welcome', at: 1, read: false }], requests: [], plus: true,
} as unknown as AppState;

describe('cloud shape', () => {
  it('needs a profile', () => {
    expect(toCloud({ ...state, profile: null })).toBeNull();
  });

  it('keeps device-only files, notifications and purchases out of the cloud', () => {
    const c = toCloud(state)!;
    expect(c.profile).not.toHaveProperty('photoUri');
    expect(c.profile).not.toHaveProperty('voice');
    expect(c.profile.languageOnly).toBe(false);
    expect(c.state).not.toHaveProperty('notifications');
    expect(c.state).not.toHaveProperty('plus');
  });

  it('restores what was saved', () => {
    const r = fromCloud(toCloud(state)!);
    expect(r.profile).toEqual({ ...profile, photoUri: null, voice: null });
    expect(r.trust).toBe(85);
    expect(r.following).toEqual(['p1']);
    expect(r.settings?.languageOnly).toBe(false);
    expect(r).not.toHaveProperty('languageOnly');
  });
});
