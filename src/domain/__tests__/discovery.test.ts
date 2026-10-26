import { discover, onlineByLevel, type Person } from '../discovery';
import { isProfileComplete, validateProfile, type ProfileDraft } from '../profile';
import { clockAt, isValidRange, isWithin, parseHM, requestExpiresAt, shiftRange } from '../schedule';

const me = { native: 'ja', learn: 'en', level: 3, hobbies: ['travel', 'anime'] } as const;
const person = (over: Partial<Person> & { id: string }): Person => ({
  native: 'en', learn: 'ja', level: 3, status: 'online', hobbies: [], ...over,
});
const people: Person[] = [
  person({ id: 'ex-offline', status: 'offline', hobbies: ['travel'] }),
  person({ id: 'ex-online' }),
  person({ id: 'ex-incall', status: 'in_call' }),
  person({ id: 'buddy-anime', native: 'pt', learn: 'en', level: 4, hobbies: ['anime', 'travel'] }),
  person({ id: 'buddy-far', native: 'ko', learn: 'en', level: 1 }),
  person({ id: 'same-native', native: 'ja', learn: 'en', hobbies: ['anime'] }),
];
const opts = { segment: 'exchange' as const, level: null, hobby: null, sort: 'online' as const, blocked: new Set<string>() };

describe('discover', () => {
  it('splits exchange and buddy, hides people in a call', () => {
    expect(discover(me, people, opts).map((p) => p.id)).toEqual(['ex-online', 'ex-offline']);
    expect(discover(me, people, { ...opts, segment: 'buddy' }).map((p) => p.id)).toEqual(['buddy-anime', 'buddy-far']);
  });

  it('lists shared hobbies across both modes but never same-native people', () => {
    expect(discover(me, people, { ...opts, segment: 'hobby' }).map((p) => p.id)).toEqual(['buddy-anime', 'ex-offline']);
    expect(discover(me, people, { ...opts, segment: 'hobby', hobby: 'anime' }).map((p) => p.id)).toEqual(['buddy-anime']);
  });

  it('filters by level, hides blocked, and sorts', () => {
    expect(discover(me, people, { ...opts, segment: 'buddy', level: 1 }).map((p) => p.id)).toEqual(['buddy-far']);
    expect(discover(me, people, { ...opts, blocked: new Set(['ex-online']) }).map((p) => p.id)).toEqual(['ex-offline']);
    expect(discover(me, people, { ...opts, sort: 'common' }).map((p) => p.id)).toEqual(['ex-offline', 'ex-online']);
    expect(discover(me, people, { ...opts, segment: 'buddy', sort: 'level' }).map((p) => p.id)).toEqual(['buddy-anime', 'buddy-far']);
  });

  it('counts online people per level', () => {
    expect(onlineByLevel(people)).toEqual({ 1: 1, 2: 0, 3: 2, 4: 1, 5: 0 });
  });
});

describe('schedule', () => {
  it('parses and validates times', () => {
    expect(parseHM('24:00')).toBe(1440);
    expect(parseHM('25:00')).toBeNull();
    expect(isValidRange({ start: '21:00', end: '21:00' })).toBe(false);
    expect(isValidRange({ start: '21:00', end: '24:00' })).toBe(true);
  });

  it('converts hours between time zones and handles midnight', () => {
    // 07:00–08:30 in New York (UTC-4) is 20:00–21:30 in Japan (UTC+9).
    expect(shiftRange({ start: '07:00', end: '08:30' }, -240, 540)).toEqual({ start: '20:00', end: '21:30' });
    expect(isWithin({ start: '22:00', end: '01:00' }, 23 * 60 + 30)).toBe(true);
    expect(isWithin({ start: '22:00', end: '01:00' }, 2 * 60)).toBe(false);
    expect(clockAt(540, new Date(Date.UTC(2026, 9, 26, 12, 5)))).toBe('21:05');
  });

  it('expires requests after 60 seconds online or 24 hours offline', () => {
    const now = new Date(0);
    expect(requestExpiresAt(now, true).getTime()).toBe(60_000);
    expect(requestExpiresAt(now, false).getTime()).toBe(24 * 3600_000);
  });
});

describe('profile', () => {
  const draft: ProfileDraft = { name: 'Takeshi', bio: 'Hi', native: 'ja', learning: [{ lang: 'en' }], hobbies: ['travel'], hours: { start: '21:00', end: '23:00' } };
  it('validates edits', () => {
    expect(validateProfile(draft)).toBeNull();
    expect(validateProfile({ ...draft, name: ' ' })).toBe('name');
    expect(validateProfile({ ...draft, learning: [{ lang: 'ja' }] })).toBe('learnSame');
    expect(validateProfile({ ...draft, learning: [{ lang: 'en' }, { lang: 'en' }] })).toBe('learnDuplicate');
    expect(validateProfile({ ...draft, learning: [{ lang: 'en' }, { lang: 'ko' }, { lang: 'es' }] })).toBe('learnTooMany');
    expect(validateProfile({ ...draft, hobbies: [] })).toBeNull();
    expect(validateProfile({ ...draft, hours: { start: '9:00', end: '9:00' } })).toBe('hours');
  });

  it('knows when a profile is complete', () => {
    expect(isProfileComplete({ bio: '', hobbies: ['travel'], hours: { start: '21:00', end: '23:00' } })).toBe(false);
    expect(isProfileComplete({ bio: 'Hi', hobbies: ['travel'], hours: { start: '21:00', end: '23:00' } })).toBe(true);
  });
});
