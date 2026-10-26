import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

/**
 * Pip, the app's mascot: a speech bubble with a face. Its color follows the
 * call mode (blue = learning language, red = native, green = practice buddy).
 * Purely decorative: every message Pip shows is also plain text next to it.
 */
export type PipPose = 'happy' | 'wave' | 'cheer' | 'think' | 'sleepy' | 'listen';
export type PipTone = 'learn' | 'native' | 'buddy';

const TONES: Record<PipTone, { body: string; shade: string }> = {
  learn: { body: '#3D63F0', shade: '#2B4BC4' },
  native: { body: '#E4533B', shade: '#B93D29' },
  buddy: { body: '#1C9A7C', shade: '#137A61' },
};
const INK = '#161A2B';

function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}

export function Pip({ pose = 'happy', tone = 'learn', size = 96, motion = 'idle' }: {
  pose?: PipPose; tone?: PipTone; size?: number; motion?: 'idle' | 'bounce' | 'none';
}) {
  const reduce = useReduceMotion();
  const [v] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduce || motion === 'none') return;
    const duration = motion === 'bounce' ? 420 : 1600;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [v, reduce, motion]);

  const lift = motion === 'bounce' ? -size * 0.08 : -size * 0.025;
  const transform = [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, lift] }) }];
  const { body, shade } = TONES[tone];

  return (
    <Animated.View style={{ width: size, height: size, transform }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 120 120">
        {/* shadow */}
        <Ellipse cx="60" cy="112" rx="30" ry="4" fill={INK} opacity={0.12} />
        <Arms pose={pose} color={shade} />
        {/* bubble body and tail */}
        <Path d="M38 86 L28 108 L56 90 Z" fill={body} />
        <Rect x="14" y="16" width="92" height="76" rx="36" fill={body} />
        <Ellipse cx="60" cy="74" rx="30" ry="12" fill="#FFFFFF" opacity={0.12} />
        {/* small sound waves on the head */}
        <Path d="M92 14 q6 6 0 12" stroke={shade} strokeWidth="4" strokeLinecap="round" fill="none" />
        <Path d="M100 8 q10 12 0 24" stroke={shade} strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.6} />
        <Face pose={pose} />
      </Svg>
    </Animated.View>
  );
}

function Face({ pose }: { pose: PipPose }) {
  const cheeks = (
    <G opacity={0.55}>
      <Ellipse cx="34" cy="64" rx="7" ry="4.5" fill="#FF9FB5" />
      <Ellipse cx="86" cy="64" rx="7" ry="4.5" fill="#FF9FB5" />
    </G>
  );
  if (pose === 'sleepy') {
    return (
      <G>
        <Path d="M38 52 q8 6 16 0" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
        <Path d="M66 52 q8 6 16 0" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
        <Ellipse cx="60" cy="68" rx="4" ry="3" fill={INK} />
        {cheeks}
      </G>
    );
  }
  if (pose === 'happy' || pose === 'cheer') {
    return (
      <G>
        <Path d="M38 54 q8 -9 16 0" stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <Path d="M66 54 q8 -9 16 0" stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        {pose === 'cheer'
          ? <Path d="M48 62 h24 q0 14 -12 14 q-12 0 -12 -14 Z" fill={INK} />
          : <Path d="M50 63 q10 9 20 0" stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none" />}
        {cheeks}
      </G>
    );
  }
  // Open eyes for wave / think / listen.
  const look = pose === 'think' ? -2 : 0;
  return (
    <G>
      <Ellipse cx="46" cy="50" rx="7.5" ry="8.5" fill="#FFFFFF" />
      <Ellipse cx="74" cy="50" rx="7.5" ry="8.5" fill="#FFFFFF" />
      <Circle cx={47 + look} cy={51 + look} r="4.5" fill={INK} />
      <Circle cx={75 + look} cy={51 + look} r="4.5" fill={INK} />
      <Circle cx={48.5 + look} cy={49 + look} r="1.4" fill="#FFFFFF" />
      <Circle cx={76.5 + look} cy={49 + look} r="1.4" fill="#FFFFFF" />
      {pose === 'think'
        ? <Ellipse cx="62" cy="68" rx="4" ry="3.5" fill={INK} />
        : pose === 'listen'
          ? <Path d="M53 66 q7 5 14 0" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
          : <Path d="M50 64 q10 9 20 0" stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none" />}
      {cheeks}
    </G>
  );
}

function Arms({ pose, color }: { pose: PipPose; color: string }) {
  const arm = (d: string) => <Path d={d} stroke={color} strokeWidth="9" strokeLinecap="round" fill="none" />;
  switch (pose) {
    case 'cheer':
      return <G>{arm('M22 50 L8 26')}{arm('M98 50 L112 26')}</G>;
    case 'wave':
      return <G>{arm('M22 64 L10 76')}{arm('M98 50 L112 30')}</G>;
    case 'think':
      return <G>{arm('M22 64 L10 76')}{arm('M96 66 L80 74')}</G>;
    case 'listen':
      return <G>{arm('M22 58 L12 48')}{arm('M98 64 L110 76')}</G>;
    default:
      return <G>{arm('M22 64 L10 76')}{arm('M98 64 L110 76')}</G>;
  }
}
