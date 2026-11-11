import { CONSENT_SECONDS, bothAgreed, consentStatus } from '../consent';

describe('quick match consent', () => {
  const m = ['a', 'b'];
  const t0 = 1_000_000;

  it('waits until both choose', () => {
    expect(consentStatus(m, undefined, t0, t0 + 1000)).toBe('pending');
    expect(consentStatus(m, { a: true }, t0, t0 + 1000)).toBe('pending');
  });

  it('starts only when both choose to talk', () => {
    expect(consentStatus(m, { a: true, b: true }, t0, t0 + 1000)).toBe('go');
  });

  it('a skip by either person ends it', () => {
    expect(consentStatus(m, { a: true, b: false }, t0, t0 + 1000)).toBe('skipped');
    expect(consentStatus(m, { a: false }, t0, t0 + 1000)).toBe('skipped');
  });

  it('no answer in time counts as a skip', () => {
    expect(consentStatus(m, { a: true }, t0, t0 + CONSENT_SECONDS * 1000 + 1)).toBe('skipped');
  });

  it('only agreed quick matches count as conversations', () => {
    expect(bothAgreed({ kind: 'direct', members: m })).toBe(true);
    expect(bothAgreed({ kind: 'random', members: m })).toBe(false);
    expect(bothAgreed({ kind: 'random', members: m, consent: { a: true, b: true } })).toBe(true);
  });
});
