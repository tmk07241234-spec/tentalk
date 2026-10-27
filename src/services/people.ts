import { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';
import { create } from 'zustand';

import type { Partner } from '@/data/samplePartners';
import type { PublicProfile } from '@/state/cloudShape';
import { db } from './firebase/db';
import type { Lang } from '@/domain/languages';
import { findSamplePartner } from './matchmaking';
import { presenceStatus } from './presence';

/**
 * Other people, by id: the sample partners, or real users whose public profile is
 * loaded from Firestore on first use and kept for the session.
 * null = looked up and not found (deleted account).
 */
const usePeople = create<{ byId: Record<string, Partner | null> }>(() => ({ byId: {} }));
const loading = new Set<string>();

/**
 * A real user as a Partner. Someone learning two languages is shown with the one that
 * relates to the viewer (my native language for an exchange, my learning language for
 * practice buddies), otherwise with the one they are using now.
 */
export function partnerFromProfile(id: string, p: PublicProfile, viewer?: { native: Lang; learn: Lang }): Partner {
  const learning = (viewer && (p.learning.find((l) => l.lang === viewer.native && p.native === viewer.learn)
    ?? p.learning.find((l) => l.lang === viewer.learn)))
    ?? p.learning.find((l) => l.lang === p.activeLearn) ?? p.learning[0];
  return {
    id, name: p.name, country: '', color: p.color, photoUri: p.photoUri ?? null, calls: p.calls ?? 0, bio: p.bio ?? '',
    hours: p.hours ?? null, utcOffset: p.utcOffset ?? 0, native: p.native, learn: learning?.lang ?? p.native,
    level: learning?.level ?? 1, status: presenceStatus(p.lastSeen, p.inCall), languageOnly: p.languageOnly ?? false, hobbies: p.hobbies ?? [],
  };
}

const POOL_SIZE = 60;
const POOL_REFRESH_MS = 60_000;

/**
 * Real users who could be exchange partners (native in my learning language) or
 * practice buddies (learning the same language), for Find and Home. Refreshes every
 * minute so online marks stay current. Empty while loading or offline.
 */
export function usePeoplePool({ uid, native, learn }: { uid: string | undefined; native: Lang; learn: Lang }): Partner[] {
  const [pool, setPool] = useState<Partner[]>([]);
  useEffect(() => {
    if (!uid) return;
    const me = { native, learn };
    let stop = false;
    const load = async () => {
      try {
        const users = collection(db, 'users');
        const [natives, learners] = await Promise.all([
          getDocs(query(users, where('native', '==', learn), limit(POOL_SIZE))),
          getDocs(query(users, where('learnLangs', 'array-contains', learn), limit(POOL_SIZE))),
        ]);
        const seen = new Map<string, Partner>();
        for (const d of [...natives.docs, ...learners.docs]) {
          if (d.id !== uid && !seen.has(d.id)) seen.set(d.id, partnerFromProfile(d.id, d.data() as PublicProfile, me));
        }
        const people = [...seen.values()];
        if (stop) return;
        setPool(people);
        usePeople.setState((s) => ({ byId: { ...s.byId, ...Object.fromEntries(people.map((x) => [x.id, x])) } }));
      } catch {
        // offline: keep the last list
      }
    };
    void load();
    const timer = setInterval(load, POOL_REFRESH_MS);
    return () => { stop = true; clearInterval(timer); };
  }, [uid, native, learn]);
  return pool;
}

export async function loadPerson(id: string): Promise<Partner | null> {
  const sample = findSamplePartner(id);
  if (sample) return sample;
  const known = usePeople.getState().byId[id];
  if (known !== undefined) return known;
  if (loading.has(id)) return null;
  loading.add(id);
  try {
    const snap = await getDoc(doc(db, 'users', id));
    const person = snap.exists() ? partnerFromProfile(id, snap.data() as PublicProfile) : null;
    usePeople.setState((s) => ({ byId: { ...s.byId, [id]: person } }));
    return person;
  } catch {
    return null; // offline: try again next time
  } finally {
    loading.delete(id);
  }
}

/** People for these ids that are known now; the rest load in the background and appear when ready. */
export function usePeopleList(ids: readonly string[]): Partner[] {
  const byId = usePeople((s) => s.byId);
  const key = ids.join(',');
  useEffect(() => {
    for (const id of key ? key.split(',') : []) if (!findSamplePartner(id) && byId[id] === undefined) void loadPerson(id);
  }, [key, byId]);
  return ids.map((id) => findSamplePartner(id) ?? byId[id] ?? undefined).filter((p): p is Partner => !!p);
}

/** One person; `missing` is true once the lookup finished without finding them. */
export function usePerson(id: string | undefined): { person: Partner | undefined; missing: boolean } {
  const person = usePeopleList(id ? [id] : [])[0];
  const missing = usePeople((s) => !!id && !findSamplePartner(id) && s.byId[id] === null);
  return { person, missing: !id || missing };
}

/** For non-React code: the person if already known. */
export function knownPerson(id: string): Partner | undefined {
  return findSamplePartner(id) ?? usePeople.getState().byId[id] ?? undefined;
}
