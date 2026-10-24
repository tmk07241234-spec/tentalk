import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LEVELS, type Level } from '@/domain/levels';
import { radius, space, useColors } from '@/theme/colors';

/** Five bars, filled up to the level. */
export function LevelBars({ level, color }: { level: Level; color?: string }) {
  const c = useColors();
  return (
    <View style={styles.bars} accessible accessibilityLabel={`${level}/5`}>
      {LEVELS.map((n) => (
        <View key={n} style={{ width: 4, height: 4 + n * 2, borderRadius: 1, backgroundColor: n <= level ? color ?? c.ok : c.line }} />
      ))}
    </View>
  );
}

export function LevelTag({ level }: { level: Level }) {
  const { t } = useTranslation();
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <LevelBars level={level} />
      <Text style={{ color: c.ink, fontWeight: '700', fontSize: 12 }}>{t(`levels.${level}.name`)}</Text>
    </View>
  );
}

/** The five levels with descriptions; used at sign-up and in profile editing. */
export function LevelPicker({ value, onChange }: { value: Level; onChange: (l: Level) => void }) {
  const { t } = useTranslation();
  const c = useColors();
  return (
    <View accessibilityRole="radiogroup" style={{ gap: space.sm }}>
      {LEVELS.map((n) => {
        const on = n === value;
        return (
          <Pressable key={n} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => onChange(n)}
            style={[styles.option, { backgroundColor: on ? c.okSoft : c.surface, borderColor: on ? c.ok : c.line }]}>
            <LevelBars level={n} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: c.ink, fontWeight: '700', fontSize: 15 }}>{t(`levels.${n}.name`)}</Text>
              <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18 }}>{t(`levels.${n}.desc`)}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  option: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderWidth: 1.5, borderRadius: radius.md, padding: space.md },
});
