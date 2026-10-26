import { acceptsRequestFrom, canFollow, connectionGroups, type CallRecord, type RequestPolicy } from '../connections';

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

describe('acceptsRequestFrom', () => {
  const me = { following: ['a', 'b'], followers: ['b', 'c'], blocked: ['x'] };
  const from = (requestsFrom: RequestPolicy, id: string, requestAllowList: string[] = []) => acceptsRequestFrom({ requestsFrom, requestAllowList }, me, id);

  it('follows the chosen policy', () => {
    expect(from('everyone', 'z')).toBe(true);
    expect(from('following', 'a')).toBe(true);
    expect(from('following', 'c')).toBe(false);
    expect(from('mutual', 'b')).toBe(true);
    expect(from('mutual', 'a')).toBe(false);
    expect(from('selected', 'c', ['c'])).toBe(true);
    expect(from('selected', 'a', ['c'])).toBe(false);
    expect(from('none', 'b')).toBe(false);
  });

  it('never lets blocked people through', () => {
    expect(from('everyone', 'x')).toBe(false);
    expect(from('selected', 'x', ['x'])).toBe(false);
  });
});
