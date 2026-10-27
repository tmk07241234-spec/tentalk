import { pickQueuePartner, queueKey, seekKey, startLanguage, type QueueEntry } from '../queue';

const NOW = 1_000_000;
const entry = (x: Partial<QueueEntry>): QueueEntry => ({
  uid: 'a', mode: 'exchange', native: 'ja', learn: 'en', level: 3, languageOnly: true, wantLanguageOnly: false,
  matchLevel: false, blocked: [], updatedAt: NOW - 1000, callId: null, ...x,
});

describe('queue keys', () => {
  it('pair exchange learners with their mirror', () => {
    const me = entry({ native: 'ja', learn: 'en' });
    const them = entry({ native: 'en', learn: 'ja' });
    expect(seekKey(me)).toBe(queueKey(them));
    expect(seekKey(them)).toBe(queueKey(me));
  });

  it('pair buddies by the shared learning language', () => {
    expect(seekKey(entry({ mode: 'buddy', native: 'ja', learn: 'en' }))).toBe(queueKey(entry({ mode: 'buddy', native: 'ko', learn: 'en' })));
  });
});

describe('pickQueuePartner', () => {
  const me = entry({ uid: 'me', native: 'ja', learn: 'en' });

  it('takes the longest-waiting compatible entry', () => {
    const a = entry({ uid: 'a', native: 'en', learn: 'ja', updatedAt: NOW - 2000 });
    const b = entry({ uid: 'b', native: 'en', learn: 'ja', updatedAt: NOW - 5000 });
    expect(pickQueuePartner(me, [a, b], NOW)?.uid).toBe('b');
  });

  it('skips stale, already matched, blocked and incompatible entries', () => {
    const stale = entry({ uid: 's', native: 'en', learn: 'ja', updatedAt: NOW - 60_000 });
    const taken = entry({ uid: 't', native: 'en', learn: 'ja', callId: 'c1' });
    const blocksMe = entry({ uid: 'x', native: 'en', learn: 'ja', blocked: ['me'] });
    const wrongPair = entry({ uid: 'w', native: 'ko', learn: 'ja' });
    expect(pickQueuePartner(me, [stale, taken, blocksMe, wrongPair], NOW)).toBeNull();
  });

  it('respects the language-only preference on both sides', () => {
    const noBadge = entry({ uid: 'n', native: 'en', learn: 'ja', languageOnly: false });
    expect(pickQueuePartner({ ...me, wantLanguageOnly: true }, [noBadge], NOW)).toBeNull();
    expect(pickQueuePartner(me, [noBadge], NOW)?.uid).toBe('n');
  });

  it('never matches buddies with the same native language', () => {
    const buddyMe = entry({ uid: 'me', mode: 'buddy', native: 'ja', learn: 'en' });
    expect(pickQueuePartner(buddyMe, [entry({ uid: 'j', mode: 'buddy', native: 'ja', learn: 'en' })], NOW)).toBeNull();
    expect(pickQueuePartner(buddyMe, [entry({ uid: 'k', mode: 'buddy', native: 'ko', learn: 'en' })], NOW)?.uid).toBe('k');
  });
});

describe('startLanguage', () => {
  it('starts an exchange in the language of whoever waited', () => {
    expect(startLanguage(entry({ native: 'en', learn: 'ja' }))).toBe('ja');
  });
});
