import { afterCall, earlyLeaver, emptyStats, practiceRecord, priorityDelay, talkedSeconds, withSkip, LOW_PRIORITY_DELAY_MS } from '../practice';

const T = Date.UTC(2026, 10, 20, 12);
const min = 60_000;

describe('practice record and trust', () => {
  it('measures the time both were in the room', () => {
    expect(talkedSeconds({ joinedAt: T, leftAt: T + 11 * min }, { joinedAt: T + min, leftAt: T + 12 * min }, T + 20 * min)).toBe(600);
    expect(talkedSeconds({ joinedAt: T }, undefined, T + min)).toBe(0);
  });

  it('a completed call adds to the record and trust, at most 5 a day', () => {
    let s = emptyStats();
    for (let i = 0; i < 7; i++) s = afterCall(s, { seconds: 620, leftEarly: false, now: T + i * min });
    expect(s.completed).toBe(7);
    expect(s.trust).toBe(85);
    expect(s.days).toEqual(['2026-11-20']);
  });

  it('leaving early costs trust and pauses quick matches longer each time', () => {
    let s = afterCall(emptyStats(), { seconds: 120, leftEarly: true, now: T });
    expect(s.trust).toBe(70);
    expect(s.pausedUntil).toBe(T + 30 * min);
    s = afterCall(s, { seconds: 60, leftEarly: true, now: T + 40 * min });
    expect(s.pausedUntil).toBe(T + 40 * min + 120 * min);
    s = afterCall(s, { seconds: 60, leftEarly: true, now: T + 200 * min });
    expect(s.pausedUntil).toBe(T + 200 * min + 24 * 60 * min);
  });

  it('only a deliberate first leave that is not a report counts as early', () => {
    const p = { a: { joinedAt: T, leftAt: T + 2 * min, clientLeft: true }, b: { joinedAt: T, leftAt: T + 2 * min + 1000 } };
    expect(earlyLeaver(['a', 'b'], p, 120, [])).toBe('a');
    expect(earlyLeaver(['a', 'b'], p, 120, ['a'])).toBeNull();
    expect(earlyLeaver(['a', 'b'], { ...p, a: { ...p.a, clientLeft: false } }, 120, [])).toBeNull();
    expect(earlyLeaver(['a', 'b'], p, 600, [])).toBeNull();
  });

  it('shows a rate only after five calls, and practice days in the last 30', () => {
    let s = emptyStats();
    for (let i = 0; i < 4; i++) s = afterCall(s, { seconds: 600, leftEarly: false, now: T - i * 24 * 60 * min });
    expect(practiceRecord(s, T).rate).toBeNull();
    s = afterCall(s, { seconds: 100, leftEarly: false, now: T });
    expect(practiceRecord(s, T)).toEqual({ rate: 80, days30: 4, completed: 4 });
  });

  it('low trust and many skips wait longer to be matched', () => {
    expect(priorityDelay(emptyStats(), T)).toBe(0);
    let s = { ...emptyStats(), trust: 60 };
    for (let i = 0; i < 10; i++) s = withSkip(s, T - i * min);
    expect(priorityDelay(s, T)).toBe(2 * LOW_PRIORITY_DELAY_MS);
  });
});
