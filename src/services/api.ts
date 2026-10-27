import { Platform } from 'react-native';

import { firebaseAuth } from './firebase';

/** The web app calls its own server; the phone apps call the published one. */
const BASE = Platform.OS === 'web' ? '' : 'https://tentalk.expo.app';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Calls one of the app's API routes as the signed-in user. */
export async function api<T>(path: string, body?: unknown, method = 'POST'): Promise<T> {
  const user = firebaseAuth.currentUser;
  if (!user) throw new ApiError(401, 'Not signed in');
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { authorization: `Bearer ${await user.getIdToken()}`, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await r.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!r.ok || !data) throw new ApiError(r.status, data?.error ?? `HTTP ${r.status}`);
  return data;
}
