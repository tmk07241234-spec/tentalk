import { AppState } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';

import { useApp } from '@/state/store';
import { db } from './firebase/db';

const HEARTBEAT_MS = 60_000;
/** Someone seen within this window counts as online. */
export const ONLINE_WINDOW_MS = 150_000;

let inCall = false;

export function presenceStatus(lastSeen: number | undefined, busy: boolean | undefined, now = Date.now()): 'online' | 'offline' | 'in_call' {
  if (!lastSeen || now - lastSeen > ONLINE_WINDOW_MS) return 'offline';
  return busy ? 'in_call' : 'online';
}

async function beat() {
  const uid = useApp.getState().account?.uid;
  if (!uid || AppState.currentState === 'background') return;
  // Fails until the profile exists (during sign-up); the next beat tries again.
  await updateDoc(doc(db, 'users', uid), { lastSeen: Date.now(), inCall }).catch(() => {});
}

/** Marks the call state at once, so nobody sends a request to someone mid-call. */
export function setInCall(on: boolean) {
  inCall = on;
  void beat();
}

/** Keeps the signed-in user's "online" mark fresh while the app is open. Returns the stop function. */
export function startPresence(): () => void {
  void beat();
  const timer = setInterval(beat, HEARTBEAT_MS);
  const sub = AppState.addEventListener('change', (s) => { if (s === 'active') void beat(); });
  return () => { clearInterval(timer); sub.remove(); };
}
