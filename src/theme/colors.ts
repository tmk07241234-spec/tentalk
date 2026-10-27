import { useColorScheme } from 'react-native';

/** Blue = the language being learned, red = native language, green = practice buddy. */
const light = {
  bg: '#F3F4F8',
  surface: '#FFFFFF',
  surface2: '#EAECF3',
  ink: '#161A2B',
  muted: '#5D6378',
  line: '#D9DCE7',
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
};

export type Colors = typeof light;

const dark: Colors = {
  bg: '#0E1018',
  surface: '#171A26',
  surface2: '#222636',
  ink: '#E9EBF3',
  muted: '#9AA0B6',
  line: '#2E3346',
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
};

/** Call screens use fixed dark backgrounds in both themes. */
export const CALL_BG = { learn: '#1A35A0', buddy: '#0E6E59' } as const;

export const AVATAR_COLORS = ['#334466', '#3E63DD', '#1F8A5B', '#B7591F', '#C2357A', '#7B4BC9'];

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius = { sm: 10, md: 14, lg: 18, xl: 24 } as const;
