import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { useApp } from '@/state/store';
import { space, useColors } from '@/theme/colors';

const SLIDES = [
  { key: 's1', mark: '10:00', color: '#2D55E0' },
  { key: 's2', mark: '2', color: '#13836A' },
  { key: 's3', mark: '▶', color: '#7B4BC9' },
  { key: 's4', mark: '+1', color: '#1F8A5B' },
  { key: 's5', mark: '✓', color: '#D6402A' },
] as const;

/** Shown once after sign-up, and again from Me → How to use. */
export default function Guide() {
  const { t } = useTranslation();
  const c = useColors();
  const finishGuide = useApp((s) => s.finishGuide);
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;

  const done = () => {
    finishGuide();
    router.replace('/home');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, padding: space.xl, gap: space.md }}>
      <Pressable accessibilityRole="button" onPress={done} style={{ alignSelf: 'flex-end', padding: space.sm }}>
        <Text style={{ color: c.muted, textDecorationLine: 'underline' }}>{t('common.skip')}</Text>
      </Pressable>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 180, height: 180, borderRadius: 90, backgroundColor: slide.color + '24', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: slide.color + '40', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: slide.color, fontSize: slide.mark.length > 2 ? 36 : 44, fontWeight: '700' }}>{slide.mark}</Text>
          </View>
        </View>
      </View>
      <Text accessibilityRole="header" style={{ color: c.ink, fontSize: 24, fontWeight: '700' }}>{t(`guide.${slide.key}.title`)}</Text>
      <Text style={{ color: c.muted, fontSize: 15, lineHeight: 23, minHeight: 92 }}>{t(`guide.${slide.key}.body`)}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: space.md }}>
        {SLIDES.map((s, k) => (
          <View key={s.key} style={{ width: k === i ? 20 : 7, height: 7, borderRadius: 4, backgroundColor: k === i ? c.learn : c.line }} />
        ))}
      </View>
      <Button variant="primary" label={last ? t('common.start') : t('common.next')} onPress={() => (last ? done() : setI(i + 1))} />
    </SafeAreaView>
  );
}
