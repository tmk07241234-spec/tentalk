import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { radius, space, useColors } from '@/theme/colors';

/** Scrollable page with the side gutter and safe-area padding. */
export function Screen({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const c = useColors();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer ? <View style={[styles.footer, { backgroundColor: c.bg }]}>{footer}</View> : null}
    </SafeAreaView>
  );
}

export function Title({ children }: { children: ReactNode }) {
  const c = useColors();
  return <Text accessibilityRole="header" style={[styles.title, { color: c.ink }]}>{children}</Text>;
}

export function Body({ children, muted, small, style }: { children: ReactNode; muted?: boolean; small?: boolean; style?: object }) {
  const c = useColors();
  return <Text style={[{ color: muted ? c.muted : c.ink, fontSize: small ? 12 : 14, lineHeight: small ? 18 : 21 }, style]}>{children}</Text>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  const c = useColors();
  return <Text style={[styles.eyebrow, { color: c.muted }]}>{children}</Text>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  const c = useColors();
  return children ? <Text accessibilityLiveRegion="polite" style={{ color: c.bad, fontSize: 13, fontWeight: '700' }}>{children}</Text> : null;
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const c = useColors();
  return <View style={[{ backgroundColor: c.surface, borderRadius: radius.lg, padding: space.lg, gap: space.sm }, style]}>{children}</View>;
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({ label, onPress, variant = 'secondary', disabled, loading, icon, small }: {
  label: string; onPress: () => void; variant?: ButtonVariant; disabled?: boolean; loading?: boolean; icon?: ReactNode; small?: boolean;
}) {
  const c = useColors();
  const bg = { primary: c.learn, secondary: c.surface2, ghost: 'transparent', danger: c.bad }[variant];
  const fg = variant === 'primary' || variant === 'danger' ? '#FFFFFF' : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: bg, borderColor: variant === 'ghost' ? c.line : bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon}
      <Text style={{ color: fg, fontWeight: '700', fontSize: small ? 13 : 15 }}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, ...input }: { label: string } & TextInputProps) {
  const c = useColors();
  return (
    <View style={{ gap: space.xs }}>
      <Text style={{ color: c.muted, fontSize: 12, fontWeight: '700' }}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={c.muted}
        {...input}
        style={[styles.input, { borderColor: c.line, backgroundColor: c.surface, color: c.ink }, input.style]}
      />
    </View>
  );
}

export interface SegmentOption<K extends string> { key: K; label: string; sub?: string }

export function Segmented<K extends string>({ options, value, onChange }: { options: SegmentOption<K>[]; value: K; onChange: (k: K) => void }) {
  const c = useColors();
  return (
    <View accessibilityRole="tablist" style={[styles.segmented, { backgroundColor: c.surface2 }]}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable key={o.key} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onChange(o.key)}
            style={[styles.segment, on && { backgroundColor: c.surface }]}>
            <Text style={{ color: on ? c.ink : c.muted, fontWeight: '700', fontSize: 13, textAlign: 'center' }}>{o.label}</Text>
            {o.sub ? <Text style={{ color: c.muted, fontSize: 11, textAlign: 'center' }}>{o.sub}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** Single-choice chips, e.g. for picking a language. */
export function ChoiceChips<K extends string>({ options, value, onChange, label }: {
  options: { key: K; label: string }[]; value: K | null; onChange: (k: K) => void; label: string;
}) {
  const c = useColors();
  return (
    <View style={{ gap: space.xs }}>
      <Text style={{ color: c.muted, fontSize: 12, fontWeight: '700' }}>{label}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.chips}>
        {options.map((o) => {
          const on = o.key === value;
          return (
            <Pressable key={o.key} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => onChange(o.key)}
              style={[styles.chip, { borderColor: on ? c.learn : c.line, backgroundColor: on ? c.learnSoft : c.surface }]}>
              <Text style={{ color: on ? c.learn : c.ink, fontWeight: on ? '700' : '400' }}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function StepLabel({ children }: { children: ReactNode }) {
  const c = useColors();
  return <Text style={{ color: c.muted, fontSize: 12, fontWeight: '700' }}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: { padding: space.lg, paddingBottom: space.xl * 2, gap: space.md },
  footer: { paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.lg, gap: space.sm },
  title: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  button: { minHeight: 48, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: space.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  buttonSmall: { minHeight: 36, paddingHorizontal: space.md, borderRadius: radius.sm },
  input: { borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: space.md, paddingVertical: 10, fontSize: 16 },
  segmented: { flexDirection: 'row', borderRadius: 12, padding: 3, gap: 3 },
  segment: { flex: 1, borderRadius: 9, paddingVertical: 7, paddingHorizontal: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8 },
});
