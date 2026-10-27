import { decide, isSuspended, withEvent } from '../moderation';

describe('moderation decisions', () => {
  it('only penalise the reported person when a violation is confirmed', () => {
    expect(decide('dismiss', 'r1', 0).against).toBeNull();
    expect(decide('violation', 'r1', 0).against?.trustDelta).toBe(-30);
    expect(decide('violation', 'r1', 0).reporter.trustDelta).toBe(0);
  });

  it('suspend for a week and tell the reporter it was reviewed', () => {
    const d = decide('suspend', 'r1', 1000);
    expect(d.against?.until).toBe(1000 + 7 * 24 * 3600 * 1000);
    expect(d.reporter.kind).toBe('reportConfirmed');
  });

  it('penalise the reporter for a false report', () => {
    const d = decide('falseReport', 'r1', 0);
    expect(d.against).toBeNull();
    expect(d.reporter).toMatchObject({ kind: 'falseReport', trustDelta: -10 });
  });

  it('keep the longest suspension and know when it ends', () => {
    const m = withEvent(withEvent(null, decide('suspend', 'a', 0).against!), decide('violation', 'b', 5).against!);
    expect(m.events).toHaveLength(2);
    expect(isSuspended(m, 1000)).toBe(true);
    expect(isSuspended(m, m.suspendedUntil + 1)).toBe(false);
  });
});
