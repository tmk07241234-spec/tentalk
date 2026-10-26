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

/** Who may send me a call request. Random calls are not affected. */
export type RequestPolicy = 'everyone' | 'following' | 'mutual' | 'selected' | 'none';

export interface RequestRules {
  requestsFrom: RequestPolicy;
  /** For 'selected': the people allowed to send requests. */
  requestAllowList: readonly string[];
}

/** Whether a request from `partnerId` reaches me under my rules. */
export function acceptsRequestFrom(
  rules: RequestRules,
  me: { following: readonly string[]; followers: readonly string[]; blocked: readonly string[] },
  partnerId: string,
): boolean {
  if (me.blocked.includes(partnerId)) return false;
  switch (rules.requestsFrom) {
    case 'everyone': return true;
    case 'following': return me.following.includes(partnerId);
    case 'mutual': return me.following.includes(partnerId) && me.followers.includes(partnerId);
    case 'selected': return rules.requestAllowList.includes(partnerId);
    case 'none': return false;
  }
}
