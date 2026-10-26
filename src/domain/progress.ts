/**
 * Habit and reward rules: streaks, the weekly goal, and badges.
 * Only completed calls (10 required minutes) count, so rewards follow the core rule.
 */

export interface CallLogEntry {
  /** Local date, YYYY-MM-DD. */
  date: string;
  minutes: number;
  completed: boolean;
}

export const WEEKLY_GOAL = 3;

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function completedDays(log: readonly CallLogEntry[]): Set<string> {
  return new Set(log.filter((e) => e.completed).map((e) => e.date));
}

/**
 * Consecutive days with a completed call, ending today — or yesterday, so the
 * streak is not shown as lost before the day is over.
 */
export function currentStreak(log: readonly CallLogEntry[], today: Date): number {
  const days = completedDays(log);
  let cursor = days.has(dayKey(today)) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(dayKey(cursor))) {
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export function calledToday(log: readonly CallLogEntry[], today: Date): boolean {
  return completedDays(log).has(dayKey(today));
}

/** Monday-first week containing `today`: which days had a completed call. */
export function weekDays(log: readonly CallLogEntry[], today: Date): { key: string; done: boolean; isToday: boolean }[] {
  const days = completedDays(log);
  const monday = addDays(today, -((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const key = dayKey(addDays(monday, i));
    return { key, done: days.has(key), isToday: key === dayKey(today) };
  });
}

export function weekSummary(log: readonly CallLogEntry[], today: Date) {
  const keys = new Set(weekDays(log, today).map((d) => d.key));
  const thisWeek = log.filter((e) => keys.has(e.date));
  const completed = thisWeek.filter((e) => e.completed).length;
  return {
    completedCalls: completed,
    minutes: Math.round(thisWeek.reduce((sum, e) => sum + e.minutes, 0)),
    goalMet: completed >= WEEKLY_GOAL,
  };
}

export type BadgeId = 'first_call' | 'calls_10' | 'calls_50' | 'streak_3' | 'streak_7' | 'streak_30' | 'hour_1' | 'hours_10';

export const BADGES: readonly BadgeId[] = ['first_call', 'streak_3', 'calls_10', 'hour_1', 'streak_7', 'calls_50', 'hours_10', 'streak_30'];

/** Badges earned by this log. Streak badges use the longest streak ever, so they are never taken away. */
export function earnedBadges(log: readonly CallLogEntry[]): Set<BadgeId> {
  const completed = log.filter((e) => e.completed).length;
  const minutes = log.reduce((sum, e) => sum + e.minutes, 0);
  const best = longestStreak(log);
  const out = new Set<BadgeId>();
  if (completed >= 1) out.add('first_call');
  if (completed >= 10) out.add('calls_10');
  if (completed >= 50) out.add('calls_50');
  if (best >= 3) out.add('streak_3');
  if (best >= 7) out.add('streak_7');
  if (best >= 30) out.add('streak_30');
  if (minutes >= 60) out.add('hour_1');
  if (minutes >= 600) out.add('hours_10');
  return out;
}

export function longestStreak(log: readonly CallLogEntry[]): number {
  const sorted = [...completedDays(log)].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const key of sorted) {
    const [y, m, d] = key.split('-').map(Number);
    run = prev === dayKey(addDays(new Date(y, m - 1, d), -1)) ? run + 1 : 1;
    best = Math.max(best, run);
    prev = key;
  }
  return best;
}

/** Badges that appear when going from `before` to `after` — shown on the result screen. */
export function newBadges(before: readonly CallLogEntry[], after: readonly CallLogEntry[]): BadgeId[] {
  const had = earnedBadges(before);
  return BADGES.filter((b) => earnedBadges(after).has(b) && !had.has(b));
}

/** What the mascot says on Home, chosen from the user's progress. */
export type MascotMood = 'welcome' | 'done_today' | 'keep_streak' | 'goal_met' | 'invite';

export function homeMood(log: readonly CallLogEntry[], today: Date): MascotMood {
  if (!log.some((e) => e.completed)) return 'welcome';
  if (calledToday(log, today)) return weekSummary(log, today).goalMet ? 'goal_met' : 'done_today';
  if (currentStreak(log, today) > 0) return 'keep_streak';
  return 'invite';
}
