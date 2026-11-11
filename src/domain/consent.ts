/**
 * Quick matches never start on their own (App Store guideline 1.2: no random anonymous
 * chat). When two people are matched, each first sees who the other is (name, photo,
 * languages, level, bio) and chooses to talk or skip. The call starts only if both
 * choose to talk within CONSENT_SECONDS; a skip or silence sends both back to searching.
 */
export const CONSENT_SECONDS = 25;

export type ConsentStatus = 'pending' | 'go' | 'skipped';

/** Each member's choice so far: true talk, false skip, missing not yet decided. */
export type Consent = Record<string, boolean>;

export function consentStatus(members: readonly string[], consent: Consent | undefined, createdAt: number, now: number): ConsentStatus {
  const c = consent ?? {};
  if (members.some((m) => c[m] === false)) return 'skipped';
  if (members.every((m) => c[m] === true)) return 'go';
  return now - createdAt > CONSENT_SECONDS * 1000 ? 'skipped' : 'pending';
}

/** Whether a call record counts as a real conversation (direct calls, or quick matches both agreed to). */
export function bothAgreed(call: { kind: string; members: readonly string[]; consent?: Consent }): boolean {
  return call.kind !== 'random' || call.members.every((m) => call.consent?.[m] === true);
}

/** People skipped in this search session are not offered again; kept short so the request stays small. */
export const MAX_AVOID = 30;
