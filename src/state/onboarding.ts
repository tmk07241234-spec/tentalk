import { create } from 'zustand';

import type { Lang } from '@/domain/languages';
import type { Level } from '@/domain/levels';
import type { SignInMethod } from '@/services/auth';

/** Answers collected during account setup. Kept in memory only. */
interface OnboardingDraft {
  method: SignInMethod | null;
  email: string | null;
  suggestedName: string;
  native: Lang | null;
  learn: Lang | null;
  level: Level;
  set: (patch: Partial<Omit<OnboardingDraft, 'set' | 'reset'>>) => void;
  reset: () => void;
}

const empty = { method: null, email: null, suggestedName: '', native: null, learn: null, level: 3 as Level };

export const useOnboarding = create<OnboardingDraft>()((set) => ({
  ...empty,
  set: (patch) => set(patch),
  reset: () => set(empty),
}));

/** Steps shown as "Step n of 5": account, birthday, languages, level, profile. */
export const SETUP_STEPS = 5;
