import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Body, Button, ErrorText, Field, Screen, StepLabel, Title } from '@/components/ui';
import { isAdult, toDate } from '@/domain/validation';
import { SETUP_STEPS } from '@/state/onboarding';
import { space } from '@/theme/colors';

export default function BirthdayStep() {
  const { t } = useTranslation();
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [error, setError] = useState('');
  const digits = (n: number) => (v: string) => v.replace(/\D/g, '').slice(0, n);

  // The birth date is only checked here; it is never stored on the profile or shown to others.
  const next = () => {
    const d = toDate(Number(year), Number(month), Number(day));
    if (!d || d > new Date() || Number(year) < 1900) return setError(t('birthday.invalid'));
    if (!isAdult(d)) return setError(t('birthday.under18'));
    router.push('/languages');
  };

  return (
    <Screen footer={<Button variant="primary" label={t('common.next')} onPress={next} />}>
      <StepLabel>{t('common.step', { n: 2, total: SETUP_STEPS })}</StepLabel>
      <Title>{t('birthday.title')}</Title>
      <Body muted>{t('birthday.desc')}</Body>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <View style={{ flex: 2 }}><Field label={t('birthday.year')} value={year} onChangeText={(v) => setYear(digits(4)(v))} keyboardType="number-pad" placeholder="2000" maxLength={4} /></View>
        <View style={{ flex: 1 }}><Field label={t('birthday.month')} value={month} onChangeText={(v) => setMonth(digits(2)(v))} keyboardType="number-pad" placeholder="1" maxLength={2} /></View>
        <View style={{ flex: 1 }}><Field label={t('birthday.day')} value={day} onChangeText={(v) => setDay(digits(2)(v))} keyboardType="number-pad" placeholder="1" maxLength={2} /></View>
      </View>
      <ErrorText>{error}</ErrorText>
    </Screen>
  );
}
