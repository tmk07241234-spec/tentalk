import { SAMPLE_PARTNERS, type Partner } from '@/data/samplePartners';
import { isEligible, pickRandomPartner, type Learner, type MatchPrefs } from '@/domain/matching';

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
