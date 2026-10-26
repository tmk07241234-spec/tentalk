import { uiLangFromDevice } from '../languages';
import { levelsClose } from '../levels';
import { isEligible, pickRandomPartner, relation, type Candidate, type MatchPrefs } from '../matching';
import { callOutcome, formatClock, reportPenalty, shouldShowAd, silenceNudge } from '../callRules';
import { isAdult, isEmail, isPassword, toDate, validateLanguages } from '../validation';

const me = { native: 'ja', learn: 'en' } as const;
const cand = (over: Partial<Candidate>): Candidate => ({
  id: 'x', native: 'pt', learn: 'en', level: 3, status: 'online', languageOnly: true, ...over,
});
const prefs = (over: Partial<MatchPrefs> = {}): MatchPrefs => ({
  mode: 'buddy', myLevel: 3, languageOnlyPartners: true, matchLevel: false, blocked: new Set(), ...over,
});

describe('languages', () => {
  it('uses the device language when supported, English otherwise', () => {
    expect(uiLangFromDevice('ko')).toBe('ko');
    expect(uiLangFromDevice('es-MX')).toBe('es');
    expect(uiLangFromDevice('fr')).toBe('en');
    expect(uiLangFromDevice(null)).toBe('en');
  });
});

describe('matching', () => {
  it('classifies exchange and buddy relations', () => {
    expect(relation(me, { native: 'en', learn: 'ja' })).toBe('exchange');
    expect(relation(me, { native: 'pt', learn: 'en' })).toBe('buddy');
    // Same native language: they would fall back to Japanese, so no match.
    expect(relation(me, { native: 'ja', learn: 'en' })).toBeNull();
    expect(relation(me, { native: 'ko', learn: 'es' })).toBeNull();
  });

  it('filters by status, block list, badge, and level', () => {
    expect(isEligible(me, cand({}), prefs())).toBe(true);
    expect(isEligible(me, cand({ status: 'in_call' }), prefs())).toBe(false);
    expect(isEligible(me, cand({ id: 'b' }), prefs({ blocked: new Set(['b']) }))).toBe(false);
    expect(isEligible(me, cand({ languageOnly: false }), prefs())).toBe(false);
    expect(isEligible(me, cand({ languageOnly: false }), prefs({ languageOnlyPartners: false }))).toBe(true);
    expect(isEligible(me, cand({ level: 5 }), prefs({ matchLevel: true }))).toBe(false);
    expect(isEligible(me, cand({ level: 4 }), prefs({ matchLevel: true }))).toBe(true);
  });

  it('picks only from eligible candidates', () => {
    const list = [cand({ id: 'a', status: 'offline' }), cand({ id: 'b' }), cand({ id: 'c', native: 'ja' })];
    expect(pickRandomPartner(me, list, prefs(), () => 0.99)?.id).toBe('b');
    expect(pickRandomPartner(me, [], prefs())).toBeNull();
    expect(levelsClose(2, 4)).toBe(false);
  });
});

describe('call rules', () => {
  it('penalises hanging up before 10 minutes', () => {
    const o = callOutcome({ elapsedSeconds: 300, reason: 'hangup', kind: 'random', todayGain: 0 });
    expect(o).toMatchObject({ trustDelta: -10, randomCooldownMinutes: 30, profileUnlocked: false });
  });

  it('rewards finishing, capped at +5 a day, and unlocks random profiles', () => {
    expect(callOutcome({ elapsedSeconds: 600, reason: 'hangup', kind: 'random', todayGain: 0 }))
      .toMatchObject({ trustDelta: 1, todayGain: 1, profileUnlocked: true });
    expect(callOutcome({ elapsedSeconds: 900, reason: 'hangup', kind: 'direct', todayGain: 5 }))
      .toMatchObject({ trustDelta: 0, todayGain: 5, profileUnlocked: false });
  });

  it('never penalises reports, partner leaving, or dropped connections', () => {
    for (const reason of ['report', 'partner_left', 'connection_lost'] as const) {
      expect(callOutcome({ elapsedSeconds: 120, reason, kind: 'random', todayGain: 0 }).trustDelta).toBe(0);
    }
    expect(callOutcome({ elapsedSeconds: 700, reason: 'report', kind: 'random', todayGain: 0 }).profileUnlocked).toBe(false);
  });

  it('penalises false or repeated unconfirmed reports', () => {
    expect(reportPenalty(false, 2)).toBe(0);
    expect(reportPenalty(false, 3)).toBe(-10);
    expect(reportPenalty(true, 0)).toBe(-10);
  });

  it('nudges on silence and schedules ads', () => {
    expect(silenceNudge(10)).toBeNull();
    expect(silenceNudge(30)).toBe('topic');
    expect(silenceNudge(75)).toBe('example');
    expect([1, 2, 3, 4, 5, 6].map((n) => shouldShowAd({ plus: false, callCount: n }))).toEqual([false, false, false, true, false, true]);
    expect(shouldShowAd({ plus: true, callCount: 4 })).toBe(false);
  });

  it('formats clocks', () => {
    expect(formatClock(65)).toBe('01:05');
    expect(formatClock(3725)).toBe('1:02:05');
  });
});

describe('validation', () => {
  it('checks email and password format', () => {
    expect(isEmail('a@b.co')).toBe(true);
    expect(isEmail('bad')).toBe(false);
    expect(isPassword('12345678')).toBe(true);
    expect(isPassword('1234567')).toBe(false);
  });

  it('rejects impossible dates and under-18s', () => {
    expect(toDate(2025, 2, 30)).toBeNull();
    const now = new Date(2026, 9, 24);
    expect(isAdult(toDate(2008, 10, 24)!, now)).toBe(true);
    expect(isAdult(toDate(2008, 10, 25)!, now)).toBe(false);
  });

  it('validates learning languages', () => {
    expect(validateLanguages('ja', ['en'])).toBeNull();
    expect(validateLanguages('ja', ['ja'])).toBe('sameAsNative');
    expect(validateLanguages('ja', ['en', 'en'])).toBe('duplicate');
    expect(validateLanguages('ja', [])).toBe('none');
  });
});
