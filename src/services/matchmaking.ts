import { SAMPLE_PARTNERS, type Partner } from '@/data/samplePartners';
import { isEligible, pickRandomPartner, type Learner, type MatchPrefs, type Mode } from '@/domain/matching';
import type { ConsentStatus } from '@/domain/consent';
import type { QueueEntry } from '@/domain/queue';
import { api } from './api';

export type MatchRequest = Pick<QueueEntry, 'mode' | 'native' | 'learn' | 'level' | 'languageOnly' | 'wantLanguageOnly' | 'matchLevel'> & { avoid: string[] };

/**
 * Matchmaking boundary. The real version joins a server-side queue per
 * language pair and resolves when the server pairs two people.
 */
export interface MatchmakingService {
  findPartner(me: Learner, prefs: MatchPrefs, signal: AbortSignal): Promise<Partner | null>;
  onlineSuggestions(me: Learner, prefs: MatchPrefs): Partner[];
}

export const mockMatchmaking: MatchmakingService = {
  findPartner(me, prefs, signal) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve(pickRandomPartner(me, SAMPLE_PARTNERS, prefs) as Partner | null), 1500);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('aborted'));
      });
    });
  },
  onlineSuggestions(me, prefs) {
    return SAMPLE_PARTNERS.filter((p) => isEligible(me, p, { ...prefs, languageOnlyPartners: false }));
  },
};

export const matchmaking: MatchmakingService = mockMatchmaking;

export function findSamplePartner(id: string): Partner | undefined {
  return SAMPLE_PARTNERS.find((p) => p.id === id);
}

/** How long a random search runs before showing "no one found". */
export const SEARCH_TIMEOUT_MS = 90_000;
const STEP_MS = 2500;

export interface CallInfo {
  url: string;
  token: string;
  partnerId: string;
  mode: Mode;
}

/**
 * Real random matching through the server: repeats a search step until a call is
 * found (resolves with its id), the time runs out (null) or `signal` aborts.
 */
export async function searchRandomCall(req: MatchRequest, signal: AbortSignal): Promise<string | null> {
  const until = Date.now() + SEARCH_TIMEOUT_MS;
  try {
    while (!signal.aborted && Date.now() < until) {
      const r = await api<{ callId?: string; waiting?: true }>('/api/match', req);
      if (r.callId) return r.callId;
      await new Promise((ok) => setTimeout(ok, STEP_MS));
    }
  } finally {
    // Leave the queue unless a call was found; a late match is simply dropped.
    if (signal.aborted || Date.now() >= until) await api('/api/match', undefined, 'DELETE').catch(() => {});
  }
  return null;
}

/**
 * A quick match before the call: send my choice (true talk, false skip) or nothing to
 * just read the state. 'go' means both chose to talk (see domain/consent).
 */
export function callConsent(callId: string, accept?: boolean): Promise<{ partnerId: string; mode: Mode; status: ConsentStatus }> {
  return api('/api/call-consent', { callId, accept });
}

export function callInfo(callId: string): Promise<CallInfo> {
  return api<CallInfo>('/api/call-token', { callId });
}
