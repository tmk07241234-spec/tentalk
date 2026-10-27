/** The first 10 minutes of every call are required. After that there is no limit. */
export const REQUIRED_SECONDS = 600;
/** Silence thresholds for the AI helper: new topic, then example questions. */
export const SILENCE_TOPIC_SECONDS = 30;
export const SILENCE_EXAMPLE_SECONDS = 60;
/** Ask "are you still talking?" every hour so forgotten calls end. */
export const STILL_THERE_CHECK_SECONDS = 3600;

export const EARLY_HANGUP_PENALTY = -10;
export const RANDOM_COOLDOWN_MINUTES = 30;
export const VIOLATION_PENALTY = -30;
export const DAILY_TRUST_GAIN_CAP = 5;
/** Trust score below this limits random calls to other low-score users. */
export const TRUST_RESTRICTED_BELOW = 70;

export type CallKind = 'random' | 'direct';
/** How the call ended, from this user's point of view. */
export type EndReason = 'hangup' | 'report' | 'partner_left' | 'connection_lost';

export interface CallOutcome {
  trustDelta: number;
  todayGain: number;
  /** Random calls only: both sides stayed 10 minutes, so profiles open up. */
  profileUnlocked: boolean;
  randomCooldownMinutes: number;
  completedRequired: boolean;
}

export function callOutcome(input: {
  elapsedSeconds: number;
  reason: EndReason;
  kind: CallKind;
  todayGain: number;
}): CallOutcome {
  const completed = input.elapsedSeconds >= REQUIRED_SECONDS;
  let trustDelta = 0;
  let todayGain = input.todayGain;
  let cooldown = 0;

  if (input.reason === 'hangup' && !completed) {
    trustDelta = EARLY_HANGUP_PENALTY;
    cooldown = RANDOM_COOLDOWN_MINUTES;
  } else if (completed && input.reason !== 'report' && todayGain < DAILY_TRUST_GAIN_CAP) {
    trustDelta = 1;
    todayGain += 1;
  }

  return {
    trustDelta,
    todayGain,
    profileUnlocked: input.kind === 'random' && completed && input.reason !== 'report',
    randomCooldownMinutes: cooldown,
    completedRequired: completed,
  };
}

/**
 * A report that was judged false, or the third unconfirmed report within 30 days,
 * costs the reporter the same as hanging up early.
 */
export function reportPenalty(judgedFalse: boolean, unconfirmedReportsIn30Days: number): number {
  return judgedFalse || unconfirmedReportsIn30Days >= 3 ? EARLY_HANGUP_PENALTY : 0;
}

export function clampTrust(score: number): number {
  return Math.max(0, Math.min(100, score));
}

export type SilenceNudge = null | 'topic' | 'example';

export function silenceNudge(silentSeconds: number): SilenceNudge {
  if (silentSeconds >= SILENCE_EXAMPLE_SECONDS) return 'example';
  if (silentSeconds >= SILENCE_TOPIC_SECONDS) return 'topic';
  return null;
}

/**
 * Ads: none for the first 3 calls, then a static card in the result screen
 * after every 2nd call. Never full-screen, never before a call starts.
 */
export function shouldShowAd(input: { plus: boolean; callCount: number }): boolean {
  return !input.plus && input.callCount > 3 && input.callCount % 2 === 0;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${String(m).padStart(2, '0')}:${sec}`;
}
