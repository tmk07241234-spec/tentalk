import {
  calledToday, currentStreak, earnedBadges, homeMood, longestStreak, newBadges, weekDays, weekSummary, type CallLogEntry,
} from '../progress';

const done = (date: string, minutes = 12): CallLogEntry => ({ date, minutes, completed: true });
const early = (date: string, minutes = 4): CallLogEntry => ({ date, minutes, completed: false });
// Wednesday 2026-10-28
const today = new Date(2026, 9, 28);

describe('streaks', () => {
  it('counts consecutive completed days ending today or yesterday', () => {
    expect(currentStreak([done('2026-10-26'), done('2026-10-27'), done('2026-10-28')], today)).toBe(3);
    expect(currentStreak([done('2026-10-26'), done('2026-10-27')], today)).toBe(2);
    expect(currentStreak([done('2026-10-25'), done('2026-10-26')], today)).toBe(0);
  });

  it('ignores calls that ended before 10 minutes', () => {
    expect(currentStreak([early('2026-10-28')], today)).toBe(0);
    expect(calledToday([early('2026-10-28')], today)).toBe(false);
  });

  it('works across month boundaries', () => {
    expect(longestStreak([done('2026-09-30'), done('2026-10-01'), done('2026-10-02'), done('2026-10-10')])).toBe(3);
  });
});

describe('week', () => {
  it('starts on Monday and marks completed days', () => {
    const days = weekDays([done('2026-10-26'), early('2026-10-27'), done('2026-10-28')], today);
    expect(days.map((d) => d.key)[0]).toBe('2026-10-26');
    expect(days.map((d) => d.done)).toEqual([true, false, true, false, false, false, false]);
    expect(days[2].isToday).toBe(true);
  });

  it('sums the week and checks the goal of 3', () => {
    const s = weekSummary([done('2026-10-25'), done('2026-10-26'), early('2026-10-27'), done('2026-10-28'), done('2026-10-28')], today);
    expect(s).toEqual({ completedCalls: 3, minutes: 40, goalMet: true });
  });
});

describe('badges', () => {
  it('awards and reports new badges once', () => {
    expect([...earnedBadges([])]).toEqual([]);
    expect(newBadges([], [done('2026-10-28')])).toEqual(['first_call']);
    const three = [done('2026-10-26'), done('2026-10-27')];
    expect(newBadges(three, [...three, done('2026-10-28')])).toEqual(['streak_3']);
    expect(earnedBadges([done('2026-10-01', 600)]).has('hours_10')).toBe(true);
  });
});

describe('mascot mood', () => {
  it('follows progress', () => {
    expect(homeMood([], today)).toBe('welcome');
    expect(homeMood([done('2026-10-28')], today)).toBe('done_today');
    expect(homeMood([done('2026-10-26'), done('2026-10-27'), done('2026-10-28')], today)).toBe('goal_met');
    expect(homeMood([done('2026-10-27')], today)).toBe('keep_streak');
    expect(homeMood([done('2026-10-20')], today)).toBe('invite');
  });
});
