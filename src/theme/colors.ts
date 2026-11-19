import { useColorScheme } from 'react-native';

/**
 * Blue = the language being learned, red = native language, green = practice buddy.
 * Warm paper tones (1.2) with a yellow call button and a coral accent for progress,
 * so screens feel lived-in rather than grey.
 */
const light = {
  bg: '#F6F2EA',
  surface: '#FFFFFF',
  surface2: '#EFE9DE',
  ink: '#24221F',
  muted: '#756E64',
  line: '#E2D9CA',
  learn: '#2D55E0',
  learnSoft: '#E3E9FD',
  native: '#D6402A',
  nativeSoft: '#FBE6E2',
  buddy: '#13836A',
  buddySoft: '#DCF1EA',
  ok: '#1F8A5B',
  okSoft: '#DDF2E8',
  warn: '#B7791F',
  bad: '#C2352B',
  onAccent: '#FFFFFF',
  /** Main call button on the green quick-match card. */
  sun: '#F4C76B',
  sunInk: '#2B2117',
  sunSoft: '#FDF1D8',
  sunText: '#9A6210',
  coral: '#D9694D',
  coralSoft: '#FBEAE4',
};

export type Colors = typeof light;

const dark: Colors = {
  bg: '#14120F',
  surface: '#1F1C18',
  surface2: '#2B2721',
  ink: '#F1ECE3',
  muted: '#A99F92',
  line: '#3A342C',
  learn: '#7C97FF',
  learnSoft: '#1E2850',
  native: '#FF7B63',
  nativeSoft: '#46201A',
  buddy: '#4CCBA8',
  buddySoft: '#123A30',
  ok: '#4CC28C',
  okSoft: '#173527',
  warn: '#E3A84A',
  bad: '#FF6F63',
  onAccent: '#0E1018',
  sun: '#F4C76B',
  sunInk: '#2B2117',
  sunSoft: '#3A2D14',
  sunText: '#F4C76B',
  coral: '#F08A6E',
  coralSoft: '#40231B',
};

/** Call screens use fixed dark backgrounds in both themes. */
export const CALL_BG = { learn: '#1A35A0', buddy: '#0E6E59' } as const;

export const AVATAR_COLORS = ['#334466', '#3E63DD', '#1F8A5B', '#B7591F', '#C2357A', '#7B4BC9'];

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius = { sm: 10, md: 14, lg: 18, xl: 24 } as const;
