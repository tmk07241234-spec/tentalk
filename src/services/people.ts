import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand';

import type { Partner } from '@/data/samplePartners';
import type { PublicProfile } from '@/state/cloudShape';
import { db } from './firebase/db';
import { findSamplePartner } from './matchmaking';

/**
 * Other people, by id: the sample partners, or real users whose public profile is
 * loaded from Firestore on first use and kept for the session.
 * null = looked up and not found (deleted account).
 */
const usePeople = create<{ byId: Record<string, Partner | null> }>(() => ({ byId: {} }));
const loading = new Set<string>();

export function partnerFromProfile(id: string, p: PublicProfile): Partner {
  const learning = p.learning.find((l) => l.lang === p.activeLearn) ?? p.learning[0];
  return {
    id, name: p.name, country: '', color: p.color, photoUri: p.photoUri ?? null, calls: 0, bio: p.bio ?? '',
    hours: p.hours ?? null, utcOffset: p.utcOffset ?? 0, native: p.native, learn: learning?.lang ?? p.native,
    level: learning?.level ?? 1, status: 'offline', languageOnly: p.languageOnly ?? false, hobbies: p.hobbies ?? [],
  };
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
