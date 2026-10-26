import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Pip } from '@/components/Pip';
import { Body, Button, Card, Screen, Title } from '@/components/ui';
import { purchases, type Plan, type PlanId } from '@/services/purchases';
import { useApp } from '@/state/store';
import { radius, space, useColors } from '@/theme/colors';

/** What Plus includes. `ready: false` items are announced but not built yet, and say so. */
const FEATURES: { key: string; icon: React.ComponentProps<typeof Ionicons>['name']; ready: boolean }[] = [
  { key: 'noAds', icon: 'ban', ready: true },
  { key: 'frames', icon: 'ellipse-outline', ready: true },
  { key: 'feedback', icon: 'sparkles', ready: false },
  { key: 'notes', icon: 'bookmark', ready: false },
];

export default function PlusScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const plus = useApp((s) => s.plus);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plan, setPlan] = useState<PlanId>('yearly');
  const [busy, setBusy] = useState<null | 'buy' | 'restore'>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    purchases.plans().then(setPlans);
  }, []);

  const buy = async () => {
    setBusy('buy');
    const r = await purchases.purchase(plan);
    setBusy(null);
    if (r === 'purchased') setMessage(t('plus.thanks'));
  };
  const restore = async () => {
    setBusy('restore');
    const ok = await purchases.restore();
    setBusy(null);
    setMessage(ok ? t('plus.restored') : t('plus.nothingToRestore'));
  };

  return (
    <Screen footer={
      plus ? <Button label={t('common.close')} onPress={() => router.back()} /> : (
        <>
          <Button variant="primary" label={t('plus.subscribe')} loading={busy === 'buy'} onPress={buy} />
          <Button variant="ghost" label={t('plus.restore')} loading={busy === 'restore'} onPress={restore} />
        </>
      )
    }>
      <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={() => router.back()} style={{ alignSelf: 'flex-end', padding: 4 }}>
        <Ionicons name="close" size={24} color={c.muted} />
      </Pressable>
      <View style={{ alignItems: 'center', gap: space.sm }}>
        <Pip pose="cheer" size={110} motion="idle" />
        <Title>Tentalk Plus</Title>
        <Body muted style={{ textAlign: 'center' }}>{plus ? t('plus.active') : t('plus.lead')}</Body>
      </View>

      <Card>
        {FEATURES.map((f) => (
          <View key={f.key} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 4 }}>
            <Ionicons name={f.icon} size={20} color={c.learn} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.ink, fontWeight: '700' }}>{t(`plus.features.${f.key}`)}</Text>
              {!f.ready ? <Text style={{ color: c.muted, fontSize: 12 }}>{t('plus.comingSoon')}</Text> : null}
            </View>
          </View>
        ))}
      </Card>
      <Body small muted>{t('plus.fair')}</Body>

      {!plus ? (
        <View accessibilityRole="radiogroup" style={{ gap: space.sm }}>
          {plans.map((p) => {
            const on = p.id === plan;
            return (
              <Pressable key={p.id} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => setPlan(p.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, borderWidth: 1.5, borderRadius: radius.md, padding: space.md,
                  borderColor: on ? c.learn : c.line, backgroundColor: on ? c.learnSoft : c.surface }}>
                <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={20} color={on ? c.learn : c.muted} />
                <Text style={{ flex: 1, color: c.ink, fontWeight: '700' }}>{t(`plus.${p.id}`)}</Text>
                <Text style={{ color: c.ink, fontWeight: '700' }}>{t(`plus.per.${p.period}`, { price: p.displayPrice })}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {message ? <Text accessibilityLiveRegion="polite" style={{ color: c.ok, fontWeight: '700', textAlign: 'center' }}>{message}</Text> : null}

      <Body small muted>{t('plus.legal')}</Body>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: space.lg }}>
        <Pressable accessibilityRole="link" onPress={() => router.push('/info/terms')}><Text style={{ color: c.muted, textDecorationLine: 'underline', fontSize: 12 }}>{t('me.terms')}</Text></Pressable>
        <Pressable accessibilityRole="link" onPress={() => router.push('/info/privacy')}><Text style={{ color: c.muted, textDecorationLine: 'underline', fontSize: 12 }}>{t('me.privacy')}</Text></Pressable>
      </View>
      {__DEV__ && plus ? <Button small variant="ghost" label={t('plus.devCancel')} onPress={() => useApp.getState().setPlus(false)} /> : null}
    </Screen>
  );
}
