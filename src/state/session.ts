import { router } from 'expo-router';

import type { SignInResult } from '@/services/auth';
import { cloud } from '@/services/cloud';
import { fromCloud } from './cloudShape';
import { useOnboarding } from './onboarding';
import { useApp } from './store';

/**
 * After a successful sign-in: an account that already finished setup is restored and
 * goes straight home; anyone else continues the setup steps.
 */
export async function continueAfterSignIn(r: SignInResult): Promise<void> {
  const saved = r.isNew ? null : await cloud.load(r.uid);
  const draft = useOnboarding.getState();
  if (saved) {
    useApp.getState().restoreAccount({ account: { method: r.method, uid: r.uid, email: r.email }, saved: fromCloud(saved) });
    draft.reset();
    router.replace('/home');
    return;
  }
  draft.set({ method: r.method, uid: r.uid, email: r.email, suggestedName: r.displayName ?? '' });
  router.push('/birthday');
}
