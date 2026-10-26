import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Pip, type PipPose, type PipTone } from '@/components/Pip';
import { Button } from '@/components/ui';
import { useApp } from '@/state/store';
import { space, useColors } from '@/theme/colors';

const SLIDES: { key: string; pose: PipPose; tone: PipTone; tag: string }[] = [
  { key: 's1', pose: 'wave', tone: 'learn', tag: '10:00' },
  { key: 's2', pose: 'happy', tone: 'buddy', tag: '2' },
  { key: 's3', pose: 'cheer', tone: 'learn', tag: '▶' },
  { key: 's4', pose: 'happy', tone: 'buddy', tag: '+1' },
  { key: 's5', pose: 'listen', tone: 'native', tag: '✓' },
];

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
        <View style={{ width: 220, height: 220, borderRadius: 110, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Pip key={slide.key} pose={slide.pose} tone={slide.tone} size={160} />
          <View style={{ position: 'absolute', right: 8, top: 18, backgroundColor: c.ink, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 }}>
            <Text style={{ color: c.bg, fontWeight: '700', fontSize: 13 }}>{slide.tag}</Text>
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
