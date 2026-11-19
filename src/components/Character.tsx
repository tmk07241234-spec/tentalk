import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

/**
 * Illustrated avatars people can choose instead of a photo (1.2): friendly animal faces
 * in the same soft style as Pip, drawn on the person's own colour. They keep profiles
 * warm without putting faces first.
 */
export const CHARACTERS = ['cat', 'dog', 'rabbit', 'bear', 'panda', 'fox', 'owl', 'penguin'] as const;
export type CharacterId = (typeof CHARACTERS)[number];

export const isCharacter = (v: unknown): v is CharacterId => typeof v === 'string' && (CHARACTERS as readonly string[]).includes(v);

const INK = '#161A2B';
const FACE = '#FFFFFF';
const BLUSH = '#F7A1B5';

function Eyes({ y = 52, gap = 14, r = 4.2 }: { y?: number; gap?: number; r?: number }) {
  return (
    <G>
      <Circle cx={50 - gap} cy={y} r={r} fill={INK} />
      <Circle cx={50 + gap} cy={y} r={r} fill={INK} />
      <Circle cx={50 - gap + 1.4} cy={y - 1.4} r={1.3} fill={FACE} />
      <Circle cx={50 + gap + 1.4} cy={y - 1.4} r={1.3} fill={FACE} />
    </G>
  );
}

function Cheeks({ y = 62, gap = 22 }: { y?: number; gap?: number }) {
  return (
    <G opacity={0.85}>
      <Ellipse cx={50 - gap} cy={y} rx={5} ry={3} fill={BLUSH} />
      <Ellipse cx={50 + gap} cy={y} rx={5} ry={3} fill={BLUSH} />
    </G>
  );
}

const Smile = ({ y = 64 }: { y?: number }) => <Path d={`M44 ${y} Q50 ${y + 6} 56 ${y}`} stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />;

function Face({ id, color }: { id: CharacterId; color: string }) {
  switch (id) {
    case 'cat':
      return (
        <G>
          <Path d="M22 40 L26 14 L44 30 Z" fill={FACE} /><Path d="M78 40 L74 14 L56 30 Z" fill={FACE} />
          <Path d="M27 34 L29 21 L38 29 Z" fill={BLUSH} /><Path d="M73 34 L71 21 L62 29 Z" fill={BLUSH} />
          <Ellipse cx={50} cy={56} rx={32} ry={28} fill={FACE} />
          <Eyes /><Cheeks />
          <Path d="M47 60 L53 60 L50 63 Z" fill={INK} />
          <Path d="M50 63 Q46 68 42 65 M50 63 Q54 68 58 65" stroke={INK} strokeWidth={2.2} strokeLinecap="round" fill="none" />
          <Path d="M16 56 L28 58 M16 64 L28 62 M84 56 L72 58 M84 64 L72 62" stroke={INK} strokeWidth={1.6} strokeLinecap="round" opacity={0.5} />
        </G>
      );
    case 'dog':
      return (
        <G>
          <Ellipse cx={50} cy={55} rx={30} ry={29} fill={FACE} />
          <Ellipse cx={22} cy={50} rx={10} ry={20} fill={INK} opacity={0.75} transform="rotate(15 22 50)" />
          <Ellipse cx={78} cy={50} rx={10} ry={20} fill={INK} opacity={0.75} transform="rotate(-15 78 50)" />
          <Eyes y={50} /><Cheeks y={64} gap={20} />
          <Ellipse cx={50} cy={62} rx={6} ry={4.5} fill={INK} />
          <Path d="M50 66 Q50 72 44 71 M50 66 Q50 72 56 71" stroke={INK} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        </G>
      );
    case 'rabbit':
      return (
        <G>
          <Ellipse cx={38} cy={22} rx={8} ry={20} fill={FACE} /><Ellipse cx={62} cy={22} rx={8} ry={20} fill={FACE} />
          <Ellipse cx={38} cy={24} rx={4} ry={14} fill={BLUSH} /><Ellipse cx={62} cy={24} rx={4} ry={14} fill={BLUSH} />
          <Ellipse cx={50} cy={60} rx={30} ry={26} fill={FACE} />
          <Eyes y={57} /><Cheeks y={67} />
          <Ellipse cx={50} cy={65} rx={3.5} ry={2.5} fill={BLUSH} />
          <Path d="M50 67 Q46 72 43 69 M50 67 Q54 72 57 69" stroke={INK} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        </G>
      );
    case 'bear':
      return (
        <G>
          <Circle cx={25} cy={30} r={11} fill={FACE} /><Circle cx={75} cy={30} r={11} fill={FACE} />
          <Circle cx={25} cy={30} r={5.5} fill={color} opacity={0.55} /><Circle cx={75} cy={30} r={5.5} fill={color} opacity={0.55} />
          <Ellipse cx={50} cy={56} rx={32} ry={29} fill={FACE} />
          <Eyes y={50} /><Cheeks y={62} />
          <Ellipse cx={50} cy={64} rx={11} ry={8} fill={color} opacity={0.25} />
          <Ellipse cx={50} cy={60.5} rx={4.5} ry={3.2} fill={INK} />
          <Smile y={65} />
        </G>
      );
    case 'panda':
      return (
        <G>
          <Circle cx={25} cy={30} r={11} fill={INK} /><Circle cx={75} cy={30} r={11} fill={INK} />
          <Ellipse cx={50} cy={56} rx={32} ry={29} fill={FACE} />
          <Ellipse cx={36} cy={52} rx={8} ry={10} fill={INK} transform="rotate(-25 36 52)" />
          <Ellipse cx={64} cy={52} rx={8} ry={10} fill={INK} transform="rotate(25 64 52)" />
          <Circle cx={37} cy={51} r={3} fill={FACE} /><Circle cx={63} cy={51} r={3} fill={FACE} />
          <Cheeks y={66} gap={24} />
          <Ellipse cx={50} cy={62} rx={4.5} ry={3.2} fill={INK} />
          <Smile y={66} />
        </G>
      );
    case 'fox':
      return (
        <G>
          <Path d="M20 44 L24 12 L46 32 Z" fill={FACE} /><Path d="M80 44 L76 12 L54 32 Z" fill={FACE} />
          <Path d="M26 36 L27 20 L38 31 Z" fill={INK} opacity={0.75} /><Path d="M74 36 L73 20 L62 31 Z" fill={INK} opacity={0.75} />
          <Path d="M16 48 Q50 30 84 48 Q80 78 50 88 Q20 78 16 48 Z" fill={FACE} />
          <Eyes y={54} gap={15} /><Cheeks y={64} gap={23} />
          <Ellipse cx={50} cy={70} rx={4.5} ry={3.2} fill={INK} />
          <Path d="M50 73 Q47 77 44 75 M50 73 Q53 77 56 75" stroke={INK} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        </G>
      );
    case 'owl':
      return (
        <G>
          <Path d="M22 36 L28 18 L40 30 Z" fill={FACE} /><Path d="M78 36 L72 18 L60 30 Z" fill={FACE} />
          <Ellipse cx={50} cy={58} rx={32} ry={30} fill={FACE} />
          <Circle cx={37} cy={52} r={11} fill={color} opacity={0.22} /><Circle cx={63} cy={52} r={11} fill={color} opacity={0.22} />
          <Eyes y={52} gap={13} r={5.2} />
          <Path d="M45 62 L55 62 L50 70 Z" fill="#F2B544" />
          <Cheeks y={66} gap={24} />
        </G>
      );
    case 'penguin':
      return (
        <G>
          <Ellipse cx={50} cy={56} rx={34} ry={32} fill={INK} opacity={0.85} />
          <Path d="M50 34 Q30 30 26 52 Q24 76 50 84 Q76 76 74 52 Q70 30 50 34 Z" fill={FACE} />
          <Eyes y={54} gap={12} /><Cheeks y={64} gap={19} />
          <Path d="M44 62 L56 62 L50 69 Z" fill="#F2B544" />
        </G>
      );
  }
}

export function Character({ id, color, size }: { id: CharacterId; color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Circle cx={50} cy={50} r={50} fill={color} />
      <G transform="translate(0 4)"><Face id={id} color={color} /></G>
    </Svg>
  );
}
