import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { LevelPicker } from '@/components/level';
import { Body, Button, Screen, StepLabel, Title } from '@/components/ui';
import { SETUP_STEPS, useOnboarding } from '@/state/onboarding';

export default function LevelStep() {
  const { t } = useTranslation();
  const { learn, level, set } = useOnboarding();

  return (
    <Screen footer={<><Button variant="primary" label={t('common.next')} onPress={() => router.push('/profile-setup')} /><Button label={t('common.back')} onPress={() => router.back()} /></>}>
      <StepLabel>{t('common.step', { n: 4, total: SETUP_STEPS })}</StepLabel>
      <Title>{t('level.title', { lang: t(`lang.${learn ?? 'en'}`) })}</Title>
      <Body muted>{t('level.desc')}</Body>
      <LevelPicker value={level} onChange={(l) => set({ level: l })} />
    </Screen>
  );
}
