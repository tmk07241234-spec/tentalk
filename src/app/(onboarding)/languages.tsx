import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Body, Button, ChoiceChips, ErrorText, Screen, StepLabel, Title } from '@/components/ui';
import { SELECTABLE_LANGS, isUiLang, type Lang } from '@/domain/languages';
import { validateLanguages } from '@/domain/validation';
import { SETUP_STEPS, useOnboarding } from '@/state/onboarding';

export default function LanguagesStep() {
  const { t, i18n } = useTranslation();
  const draft = useOnboarding();
  // Native language starts as the display language; it can differ (e.g. English UI, Japanese native).
  const initialNative: Lang = draft.native ?? (isUiLang(i18n.language) ? i18n.language : 'en');
  const [native, setNative] = useState<Lang>(initialNative);
  const [learn, setLearn] = useState<Lang>(draft.learn ?? SELECTABLE_LANGS.find((l) => l !== initialNative)!);
  const [error, setError] = useState('');
  const options = SELECTABLE_LANGS.map((l) => ({ key: l, label: t(`lang.${l}`) }));

  const next = () => {
    if (validateLanguages(native, [learn])) return setError(t('languages.sameAsNative'));
    draft.set({ native, learn });
    router.push('/level');
  };

  return (
    <Screen footer={<><Button variant="primary" label={t('common.next')} onPress={next} /><Button label={t('common.back')} onPress={() => router.back()} /></>}>
      <StepLabel>{t('common.step', { n: 3, total: SETUP_STEPS })}</StepLabel>
      <Title>{t('languages.title')}</Title>
      <ChoiceChips<Lang> label={t('languages.native')} options={options} value={native} onChange={(l) => { setNative(l); setError(''); }} />
      <ChoiceChips<Lang> label={t('languages.learn')} options={options} value={learn} onChange={(l) => { setLearn(l); setError(''); }} />
      <Body small muted>{t('languages.note')}</Body>
      <ErrorText>{error}</ErrorText>
    </Screen>
  );
}
