import { RETENTION, isExpired } from '../retention';

describe('retention', () => {
  const now = Date.UTC(2027, 0, 1);
  const old = (c: keyof typeof RETENTION) => now - RETENTION[c] - 1;

  it('keeps recent records', () => {
    expect(isExpired('requests', { createdAt: now - 1000 }, now)).toBe(false);
    expect(isExpired('calls', { createdAt: now - RETENTION.calls + 1000 }, now)).toBe(false);
  });

  it('deletes old requests and calls', () => {
    expect(isExpired('requests', { createdAt: old('requests'), status: 'pending' }, now)).toBe(true);
    expect(isExpired('calls', { createdAt: old('calls') }, now)).toBe(true);
  });

  it('never deletes open reports or inquiries, however old', () => {
    expect(isExpired('reports', { createdAt: old('reports'), status: 'open' }, now)).toBe(false);
    expect(isExpired('inquiries', { createdAt: old('inquiries'), status: 'open' }, now)).toBe(false);
    expect(isExpired('reports', { createdAt: old('reports') }, now)).toBe(false);
  });

  it('deletes old finished reports and inquiries', () => {
    expect(isExpired('reports', { createdAt: old('reports'), status: 'confirmed' }, now)).toBe(true);
    expect(isExpired('inquiries', { createdAt: old('inquiries'), status: 'done' }, now)).toBe(true);
  });

  it('ignores records without a time', () => {
    expect(isExpired('calls', {}, now)).toBe(false);
  });
});
