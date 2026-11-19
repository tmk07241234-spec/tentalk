import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

/**
 * Illustrated portraits people can choose instead of a photo (1.2). Editorial style:
 * hair, skin, hair colour and clothes on a calm tint of the person's colour, with no
 * facial features, so they read as a person without putting looks first.
 *
 * Stored in the profile's `avatar` field as "hair-hairColour-skin-outfit",
 * for example "bob-0-2-3".
 */
export const HAIRS = ['short', 'side', 'buzz', 'beard', 'curly', 'bob', 'long', 'wavy', 'bun', 'pony', 'scarf'] as const;
export type Hair = (typeof HAIRS)[number];
export const HAIR_COLORS = ['#1C1A1D', '#3B2A22', '#6B4A33', '#A3825F', '#8F8D90'];
export const SKINS = ['#F2D5C0', '#E9C3A6', '#D4A57F', '#B9825F', '#8E5B3E', '#6A4230'];
export const OUTFITS = ['#3F5A6E', '#2E3036', '#4E6B5C', '#7A5A4A', '#5B4B6E', '#8A4F4F', '#C7A36B', '#D8D1C4'];

export interface Look { hair: Hair; hairColor: number; skin: number; outfit: number }
/** The stored form of a look. */
export type CharacterId = string;

export function parseLook(v: unknown): Look | null {
  if (typeof v !== 'string') return null;
  const [hair, ...rest] = v.split('-');
  const [hairColor, skin, outfit] = rest.map(Number);
  if (rest.length !== 3 || !(HAIRS as readonly string[]).includes(hair)) return null;
  const ok = (n: number, max: number) => Number.isInteger(n) && n >= 0 && n < max;
  if (!ok(hairColor, HAIR_COLORS.length) || !ok(skin, SKINS.length) || !ok(outfit, OUTFITS.length)) return null;
  return { hair: hair as Hair, hairColor, skin, outfit };
}

export const isCharacter = (v: unknown): v is CharacterId => parseLook(v) !== null;
export const lookId = (l: Look): CharacterId => `${l.hair}-${l.hairColor}-${l.skin}-${l.outfit}`;

/** A varied starting look, so new people do not all look the same. */
export function randomLook(rand: () => number = Math.random): CharacterId {
  const pick = (n: number) => Math.floor(rand() * n);
  return lookId({ hair: HAIRS[pick(HAIRS.length)], hairColor: pick(3), skin: pick(SKINS.length), outfit: pick(OUTFITS.length) });
}

/** Mixes a colour toward a warm paper tone, for a quiet background. */
export function tint(hex: string, amount = 0.22, base = '#E9E4DA'): string {
  const n = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const ch = (i: number) => Math.round(n(base, i) + (n(hex, i) - n(base, i)) * amount).toString(16).padStart(2, '0');
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? `#${ch(0)}${ch(1)}${ch(2)}` : base;
}

const HEAD = <Ellipse cx={50} cy={45} rx={14} ry={17} />;

/** Hair drawn behind the head, then over it. */
function hairParts(hair: Hair): { back?: string; front: string } {
  switch (hair) {
    case 'short': return { front: 'M35 44 C33 26 44 21 52 22 C63 22 68 30 65 44 C64 35 58 31 50 32 C42 32 37 36 35 44Z' };
    case 'side': return { front: 'M35 46 C32 27 45 21 54 23 C64 25 68 33 65 46 C63 37 61 33 57 31 C51 36 43 36 36 40Z' };
    case 'buzz': return { front: 'M36.3 41 C37 29 44 27 50 27 C56 27 63 29 63.7 41 C60 34 56 33 50 33 C44 33 40 34 36.3 41Z' };
    case 'beard': return { front: 'M36 40 C36 29 43 25 50 25 C58 25 64 29 64 40 C60 34 56 33 50 33 C44 33 40 34 36 40Z M36 47 C37 62 44 64 50 64 C56 64 63 62 64 47 C61 56 57 58 50 58 C43 58 39 56 36 47Z' };
    case 'curly': return { front: 'M32 34 a6 6 0 1 1 12 -6 a7 7 0 0 1 14 -2 a7 7 0 0 1 9 9 a5.5 5.5 0 0 1 -2 9 C62 36 56 33 50 33 C44 33 39 37 36 45 a4.5 4.5 0 0 1 -4 -11Z' };
    case 'bob': return { front: 'M33 54 C29 27 43 21 51 22 C63 22 71 29 67 54 L63 54 C65 40 60 32 50 32 C41 32 36 40 37 54Z' };
    case 'long': return { back: 'M31 74 C27 42 34 23 50 23 C66 23 73 42 69 74Z', front: 'M36 42 C38 29 46 26 52 27 C59 27 63 32 64 41 C57 34 44 33 36 42Z' };
    case 'wavy': return { back: 'M30 73 C25 63 33 57 30 46 C28 30 38 22 50 22 C62 22 72 30 70 46 C67 57 75 63 70 73Z', front: 'M36 43 C36 29 45 25 51 26 C60 27 64 33 64 42 C60 36 55 31 49 33 C44 35 40 38 36 43Z' };
    case 'bun': return { back: 'M43 20 a7 7 0 1 1 14 0 a7 7 0 1 1 -14 0Z', front: 'M36 42 C35 28 44 24 50 24 C58 24 65 28 64 42 C60 34 56 32 50 32 C44 32 39 35 36 42Z' };
    case 'pony': return { back: 'M61 33 C75 37 76 58 66 68 C68 55 66 44 59 40Z', front: 'M36 42 C35 28 44 24 50 24 C58 24 65 28 64 42 C60 34 56 32 50 32 C44 32 39 35 36 42Z' };
    case 'scarf': return { back: 'M29 72 C25 40 33 23 50 23 C67 23 75 40 71 72 L62 72 C66 56 64 35 50 35 C36 35 34 56 38 72Z', front: 'M35 42 C36 29 44 25 50 25 C56 25 64 29 65 42 C60 35 56 34 50 34 C44 34 40 35 35 42Z' };
  }
}

export function Character({ id, color, size }: { id: CharacterId; color: string; size: number }) {
  const look = parseLook(id) ?? { hair: 'short' as Hair, hairColor: 0, skin: 1, outfit: 0 };
  const skin = SKINS[look.skin];
  const outfit = OUTFITS[look.outfit];
  // A headscarf takes a deeper shade of the clothes instead of a hair colour.
  const hairFill = look.hair === 'scarf' ? tint(outfit, 0.75, '#1C1A1D') : HAIR_COLORS[look.hairColor];
  const parts = hairParts(look.hair);
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Circle cx={50} cy={50} r={50} fill={tint(color)} />
      {parts.back ? <Path d={parts.back} fill={hairFill} /> : null}
      <Path d="M16 102 C18 80 32 70 50 70 C68 70 82 80 84 102Z" fill={outfit} />
      <G fill={skin}>
        <Path d="M44 56 L44 69 L56 69 L56 56Z" />
        <Ellipse cx={36} cy={47} rx={2.6} ry={3.6} />
        <Ellipse cx={64} cy={47} rx={2.6} ry={3.6} />
        {HEAD}
      </G>
      <Path d="M44 62 C47 65 53 65 56 62 L56 69 L44 69Z" fill="#000000" opacity={0.12} />
      <Path d="M40 71 C44 75 56 75 60 71" stroke="#000000" strokeOpacity={0.14} strokeWidth={1.2} fill="none" />
      <Path d={parts.front} fill={hairFill} />
    </Svg>
  );
}
