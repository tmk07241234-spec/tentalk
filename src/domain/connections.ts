/**
 * Who you can follow, and how follows group into connections.
 * Following is earned by talking: only someone you finished 10 minutes with can be
 * followed, so Find and Home lead to a call request, never straight to a follow.
 */

export interface CallRecord {
  partnerId: string;
  kind: 'random' | 'direct';
  completed: boolean;
  /** Random calls: both stayed 10 minutes and nobody reported. */
  unlocked: boolean;
}

export function canFollow(history: readonly CallRecord[], partnerId: string): boolean {
  return history.some((h) => h.partnerId === partnerId && (h.kind === 'random' ? h.unlocked : h.completed));
}

export type ConnectionGroup = 'mutual' | 'following' | 'followers';

/** People per group, newest first. "following" and "followers" include mutuals. */
export function connectionGroups(following: readonly string[], followers: readonly string[], blocked: readonly string[]): Record<ConnectionGroup, string[]> {
  const hidden = new Set(blocked);
  const mine = [...following].reverse().filter((id) => !hidden.has(id));
  const theirs = [...followers].reverse().filter((id) => !hidden.has(id));
  const back = new Set(theirs);
  return { mutual: mine.filter((id) => back.has(id)), following: mine, followers: theirs };
}
