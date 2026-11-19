import { isCharacter, lookId, parseLook, randomLook, tint } from '../Character';

describe('illustrated portraits', () => {
  it('reads and writes the stored form', () => {
    expect(parseLook('bob-0-2-3')).toEqual({ hair: 'bob', hairColor: 0, skin: 2, outfit: 3 });
    expect(lookId({ hair: 'bob', hairColor: 0, skin: 2, outfit: 3 })).toBe('bob-0-2-3');
  });

  it('rejects old animal avatars and out-of-range values', () => {
    for (const v of ['cat', 'bob-0-2', 'bob-9-0-0', 'hat-0-0-0', 'bob-0-0-1.5', null, 3]) expect(isCharacter(v)).toBe(false);
  });

  it('makes valid random looks', () => {
    for (let i = 0; i < 50; i++) expect(isCharacter(randomLook())).toBe(true);
  });

  it('tints toward the paper tone', () => {
    expect(tint('#E9E4DA')).toBe('#e9e4da');
    expect(tint('not a colour')).toBe('#E9E4DA');
  });
});
