import { emptyLimits, requestBlocked, withAnswer, withSent } from '../requestLimits';

const MIN = 60_000;
const DAY = 24 * 60 * MIN;

describe('request limits', () => {
  it('waits 10 minutes before asking the same person again', () => {
    const l = withSent(emptyLimits(), 'b', 'now', 0, MIN);
    expect(requestBlocked(l, 'b', 5 * MIN)).toBe('too-soon');
    expect(requestBlocked(l, 'b', 11 * MIN)).toBeNull();
    expect(requestBlocked(l, 'c', 5 * MIN)).toBeNull();
  });

  it('allows one waiting request per offline person', () => {
    const l = withSent(emptyLimits(), 'b', 'later', 0, DAY);
    expect(requestBlocked(l, 'b', DAY - 1)).toBe('already-pending');
    expect(requestBlocked(l, 'b', DAY + 1)).toBeNull();
  });

  it('frees the person after they accept, and blocks for a day after they decline', () => {
    const sent = withSent(emptyLimits(), 'b', 'later', 0, DAY);
    expect(requestBlocked(withAnswer(sent, 'b', true, MIN), 'b', 2 * MIN)).toBeNull();
    const declined = withAnswer(sent, 'b', false, MIN);
    expect(requestBlocked(declined, 'b', 2 * MIN)).toBe('declined-recently');
    expect(requestBlocked(declined, 'b', DAY + 2 * MIN)).toBeNull();
  });

  it('caps requests per hour and per day', () => {
    let l = emptyLimits();
    for (let i = 0; i < 10; i++) l = withSent(l, `p${i}`, 'now', i * MIN, i * MIN);
    expect(requestBlocked(l, 'x', 15 * MIN)).toBe('rate-limited');
    expect(requestBlocked(l, 'x', 70 * MIN)).toBeNull();
    for (let i = 10; i < 30; i++) l = withSent(l, `p${i}`, 'now', i * 4 * 60 * MIN / 10, 0);
    expect(requestBlocked(l, 'x', 13 * 60 * MIN)).toBe('rate-limited');
  });
});
