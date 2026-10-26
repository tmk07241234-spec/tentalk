import { canFollow, connectionGroups, type CallRecord } from '../connections';

const call = (x: Partial<CallRecord>): CallRecord => ({ partnerId: 'emma', kind: 'random', completed: false, unlocked: false, ...x });

describe('canFollow', () => {
  it('needs a finished 10-minute call', () => {
    expect(canFollow([], 'emma')).toBe(false);
    expect(canFollow([call({ completed: false })], 'emma')).toBe(false);
    expect(canFollow([call({ kind: 'direct', completed: true })], 'emma')).toBe(true);
  });

  it('random calls count only once the profile was unlocked', () => {
    expect(canFollow([call({ completed: true, unlocked: false })], 'emma')).toBe(false);
    expect(canFollow([call({ completed: true, unlocked: true })], 'emma')).toBe(true);
  });

  it('looks only at calls with that person', () => {
    expect(canFollow([call({ partnerId: 'liam', kind: 'direct', completed: true })], 'emma')).toBe(false);
  });
});

describe('connectionGroups', () => {
  it('splits mutuals out, newest first, without blocked people', () => {
    const g = connectionGroups(['a', 'b', 'c'], ['b', 'd', 'c'], ['d']);
    expect(g.mutual).toEqual(['c', 'b']);
    expect(g.following).toEqual(['c', 'b', 'a']);
    expect(g.followers).toEqual(['c', 'b']);
  });
});
