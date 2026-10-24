import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Body, Button, ErrorText, Field, Screen, StepLabel, Title } from '@/components/ui';
import { isEmail } from '@/domain/validation';
import { auth } from '@/services/auth';
import { SETUP_STEPS, useOnboarding } from '@/state/onboarding';

export default function EmailStep() {
  const { t } = useTranslation();
  const draft = useOnboarding();
  const [email, setEmail] = useState(draft.email ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!isEmail(email)) return setError(t('email.invalid'));
    setBusy(true);
    await auth.sendEmailCode(email.trim());
    setBusy(false);
    draft.set({ email: email.trim() });
    router.push('/code');
  };

  return (
    <Screen footer={<><Button variant="primary" label={t('email.send')} onPress={send} loading={busy} /><Button label={t('common.back')} onPress={() => router.back()} /></>}>
      <StepLabel>{t('common.step', { n: 1, total: SETUP_STEPS })}</StepLabel>
      <Title>{t('email.title')}</Title>
      <Body muted>{t('email.desc')}</Body>
      <Field label={t('email.label')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="you@example.com" onSubmitEditing={send} />
      <ErrorText>{error}</ErrorText>
    </Screen>
  );
}
