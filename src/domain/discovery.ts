import type { Lang } from './languages';
import type { Level } from './levels';
import { relation, type Mode } from './matching';

export type Segment = Mode | 'hobby';
export type SortKey = 'online' | 'common' | 'level';

export interface Person {
  id: string;
  native: Lang;
  learn: Lang;
  level: Level;
  status: 'online' | 'offline' | 'in_call';
  hobbies: string[];
}

export interface Viewer {
  native: Lang;
  learn: Lang;
  level: Level;
  hobbies: readonly string[];
}

export interface DiscoverOptions {
  segment: Segment;
  level: Level | null;
  hobby: string | null;
  sort: SortKey;
  blocked: ReadonlySet<string>;
}

export function commonHobbies(a: readonly string[], b: readonly string[]): string[] {
  return a.filter((h) => b.includes(h));
}

/**
 * The Find tab list. People in a call and blocked people never appear, and
 * nobody is ranked by popularity: only by being online, shared hobbies, or level.
 */
export function discover<P extends Person>(me: Viewer, people: readonly P[], o: DiscoverOptions): P[] {
  const list = people.filter((p) => {
    if (p.status === 'in_call' || o.blocked.has(p.id)) return false;
    const rel = relation(me, p);
    if (!rel) return false;
    if (o.segment === 'hobby') {
      const shared = commonHobbies(me.hobbies, p.hobbies);
      if (shared.length === 0) return false;
      if (o.hobby && !shared.includes(o.hobby)) return false;
    } else if (rel !== o.segment) {
      return false;
    }
    return o.level === null || p.level === o.level;
  });

  const online = (p: P) => (p.status === 'online' ? 0 : 1);
  const shared = (p: P) => commonHobbies(me.hobbies, p.hobbies).length;
  // In exchange mode the partner's level is in my native language, so "close" means close to the middle.
  const distance = (p: P) => Math.abs(p.level - (relation(me, p) === 'buddy' ? me.level : 3));
  const by: Record<SortKey, (a: P, b: P) => number> = {
    online: (a, b) => online(a) - online(b) || shared(b) - shared(a),
    common: (a, b) => shared(b) - shared(a) || online(a) - online(b),
    level: (a, b) => distance(a) - distance(b) || online(a) - online(b),
  };
  return [...list].sort(by[o.sort]);
}

/** How many people in a list are online at each level. */
export function onlineByLevel(people: readonly Person[]): Record<Level, number> {
  const out: Record<Level, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const p of people) if (p.status === 'online') out[p.level] += 1;
  return out;
}
