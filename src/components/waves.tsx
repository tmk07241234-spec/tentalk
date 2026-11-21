import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';

/** Bar heights between 0.25 and 1 that look like speech, the same for the same seed. */
export function barShape(count: number, seed = 1): number[] {
  return Array.from({ length: count }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin((i + 1) * seed * 0.7 + seed)));
}

function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}

/**
 * A row of bars that moves while someone is speaking and rests low when they are not.
 * It follows who is speaking (LiveKit's active speakers), not the exact loudness.
 * Decorative: the speaking state is also said in text next to it.
 */
export function VoiceBars({ active, color, count = 24, height = 24, barWidth = 3, seed = 3 }: {
  active: boolean; color: string; count?: number; height?: number; barWidth?: number; seed?: number;
}) {
  const reduce = useReduceMotion();
  const [shape] = useState(() => barShape(count, seed));
  const [level] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!active || reduce) { level.stopAnimation(); level.setValue(active ? 1 : 0); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(level, { toValue: 1, duration: 260, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(level, { toValue: 0.45, duration: 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [active, reduce, level]);
  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'center', gap: barWidth * 0.8 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {shape.map((s, i) => {
        // Neighbouring bars move against each other so the row ripples instead of pulsing as one.
        const rest = 0.18;
        const scale = level.interpolate({ inputRange: [0, 1], outputRange: i % 2 ? [s, rest + (1 - s) * 0.6] : [rest, s] });
        return <Animated.View key={i} style={{ width: barWidth, height, borderRadius: barWidth, backgroundColor: color, opacity: active ? 1 : 0.5, transform: [{ scaleY: active ? scale : rest + s * 0.15 }] }} />;
      })}
    </View>
  );
}

/** Soft rings around a speaker's picture that breathe while they talk. */
export function SpeakingRings({ active, size, color }: { active: boolean; size: number; color: string }) {
  const reduce = useReduceMotion();
  const [pulse] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!active || reduce) { pulse.stopAnimation(); pulse.setValue(0); return; }
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [active, reduce, pulse]);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {[1, 0.82, 0.66].map((r, i) => (
        <View key={r} style={{ position: 'absolute', width: size * r, height: size * r, borderRadius: size, borderWidth: i === 2 ? 2.5 : 2, borderColor: color, opacity: active ? [0.35, 0.55, 0.95][i] : 0.15 }} />
      ))}
      {active && !reduce ? (
        <Animated.View style={{ position: 'absolute', width: size * 0.66, height: size * 0.66, borderRadius: size, borderWidth: 2, borderColor: color,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }] }} />
      ) : null}
    </View>
  );
}
