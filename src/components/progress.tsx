import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import type { BadgeId } from '@/domain/progress';
import { WEEKLY_GOAL } from '@/domain/progress';
import { radius, space, useColors } from '@/theme/colors';

/** Monday-first row of seven days; a filled dot means a completed call that day. */
export function WeekDots({ days }: { days: { key: string; done: boolean; isToday: boolean }[] }) {
  const { t } = useTranslation();
  const c = useColors();
  const labels = t('progress.weekdays').split(',');
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }} accessible
      accessibilityLabel={t('progress.weekA11y', { done: days.filter((d) => d.done).length })}>
      {days.map((d, i) => (
        <View key={d.key} style={{ alignItems: 'center', gap: 4 }}>
          <View style={{
            width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
            backgroundColor: d.done ? c.ok : 'transparent', borderWidth: 2, borderColor: d.done ? c.ok : d.isToday ? c.learn : c.line,
          }}>
            {d.done ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
          </View>
          <Text style={{ fontSize: 11, color: d.isToday ? c.learn : c.muted, fontWeight: d.isToday ? '700' : '400' }}>{labels[i]}</Text>
        </View>
      ))}
    </View>
  );
}

export function GoalBar({ value }: { value: number }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {Array.from({ length: WEEKLY_GOAL }, (_, i) => (
        <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i < value ? c.ok : c.line }} />
      ))}
    </View>
  );
}

const BADGE_ICON: Record<BadgeId, React.ComponentProps<typeof Ionicons>['name']> = {
  first_call: 'call', calls_10: 'chatbubbles', calls_50: 'trophy', streak_3: 'flame', streak_7: 'flame', streak_30: 'ribbon',
  hour_1: 'time', hours_10: 'hourglass',
};
const BADGE_COLOR: Record<BadgeId, string> = {
  first_call: '#3D63F0', calls_10: '#1C9A7C', calls_50: '#C08A1E', streak_3: '#E4533B', streak_7: '#E4533B', streak_30: '#8E5BD0',
  hour_1: '#2E7FA0', hours_10: '#2E7FA0',
};

export function Badge({ id, earned, size = 56 }: { id: BadgeId; earned: boolean; size?: number }) {
  const { t } = useTranslation();
  const c = useColors();
  return (
    <View style={{ width: size + 20, alignItems: 'center', gap: 4 }} accessible accessibilityLabel={`${t(`badges.${id}`)}${earned ? '' : ` (${t('progress.locked')})`}`}>
      <View style={{
        width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center',
        backgroundColor: earned ? BADGE_COLOR[id] : c.surface2, borderWidth: 3, borderColor: earned ? '#FFFFFF55' : c.line,
      }}>
        <Ionicons name={earned ? BADGE_ICON[id] : 'lock-closed'} size={size * 0.42} color={earned ? '#FFFFFF' : c.muted} />
      </View>
      <Text numberOfLines={2} style={{ fontSize: 10, textAlign: 'center', color: earned ? c.ink : c.muted }}>{t(`badges.${id}`)}</Text>
    </View>
  );
}

/** A speech bubble for the mascot's line, pointing left toward Pip. */
export function SpeechBubble({ text }: { text: string }) {
  const c = useColors();
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <View style={{ position: 'absolute', left: -6, top: 18, width: 14, height: 14, backgroundColor: c.surface, transform: [{ rotate: '45deg' }] }} />
      <View style={{ backgroundColor: c.surface, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm + 2 }}>
        <Text style={{ color: c.ink, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>{text}</Text>
      </View>
    </View>
  );
}

/** Short burst of confetti behind the result card. Skipped when reduce motion is on. */
export function Confetti() {
  const [reduce, setReduce] = useState(true);
  const [pieces] = useState(() => Array.from({ length: 18 }, (_, i) => ({
    v: new Animated.Value(0),
    x: (i * 37) % 100,
    color: ['#3D63F0', '#E4533B', '#1C9A7C', '#FFD166', '#8E5BD0'][i % 5],
    delay: (i % 6) * 90,
    spin: i % 2 ? 1 : -1,
  })));

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((r) => {
      setReduce(r);
      if (r) return;
      Animated.parallel(pieces.map((p) =>
        Animated.timing(p.v, { toValue: 1, duration: 1800, delay: p.delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      )).start();
    }).catch(() => {});
  }, [pieces]);

  if (reduce) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 260, overflow: 'hidden' }}>
      {pieces.map((p, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: `${p.x}%`, top: -10, width: 8, height: 12, borderRadius: 2, backgroundColor: p.color,
          opacity: p.v.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
          transform: [
            { translateY: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, 240] }) },
            { rotate: p.v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin * 360}deg`] }) },
          ],
        }} />
      ))}
    </View>
  );
}
