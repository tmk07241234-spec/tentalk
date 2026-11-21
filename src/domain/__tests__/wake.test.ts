import { WAKE_RECEIVE_GAP_MS, canSendWake, isQuietHour, localHour, pickWakeTargets, type WakeCandidate } from '../wake';

const NOW = Date.UTC(2026, 10, 21, 12, 0); // 12:00 UTC = 21:00 in Japan
const ONLINE = 150_000;
const c = (over: Partial<WakeCandidate>): WakeCandidate => ({
  id: 'x', native: 'ja', learnLangs: ['en'], utcOffset: 540, lastSeen: NOW - 3_600_000, inCall: false,
  hasPush: true, wantsWake: true, lastWakeAt: 0, blocked: [], ...over,
});
// An English speaker learning Japanese looks for a language exchange.
const me = { uid: 'me', native: 'en' as const, learn: 'ja' as const, mode: 'exchange' as const, blocked: [] as string[] };

describe('wake pushes', () => {
  it('uses the person’s own time for quiet hours', () => {
    expect(localHour(540, NOW)).toBe(21);
    expect(isQuietHour(23)).toBe(true);
    expect(isQuietHour(7)).toBe(true);
    expect(isQuietHour(8)).toBe(false);
  });

  it('picks people who could be matched and are not in the app', () => {
    const ids = pickWakeTargets(me, [
      c({ id: 'ok' }),
      c({ id: 'online', lastSeen: NOW - 60_000 }),
      c({ id: 'calling', inCall: true }),
      c({ id: 'noPush', hasPush: false }),
      c({ id: 'off', wantsWake: false }),
      c({ id: 'recent', lastWakeAt: NOW - WAKE_RECEIVE_GAP_MS + 1000 }),
      c({ id: 'asleep', utcOffset: -300 }), // 07:00 in New York
      c({ id: 'blockedMe', blocked: ['me'] }),
      c({ id: 'wrongLang', learnLangs: ['ko'] }),
      c({ id: 'me' }),
    ], NOW, ONLINE).map((x) => x.id);
    expect(ids).toEqual(['ok']);
  });

  it('wakes practice buddies for buddy searches', () => {
    const buddy = { ...me, mode: 'buddy' as const };
    const ids = pickWakeTargets(buddy, [c({ id: 'jaNative' }), c({ id: 'koLearner', native: 'ko', learnLangs: ['ja'] })], NOW, ONLINE).map((x) => x.id);
    expect(ids).toEqual(['koLearner']);
  });

  it('wakes at most five, most recently active first', () => {
    const many = Array.from({ length: 8 }, (_, i) => c({ id: `p${i}`, lastSeen: NOW - (i + 1) * 3_600_000 }));
    expect(pickWakeTargets(me, many, NOW, ONLINE).map((x) => x.id)).toEqual(['p0', 'p1', 'p2', 'p3', 'p4']);
  });

  it('limits how often one searcher sends them', () => {
    expect(canSendWake(NOW - 5 * 60_000, NOW)).toBe(false);
    expect(canSendWake(NOW - 11 * 60_000, NOW)).toBe(true);
  });
});
