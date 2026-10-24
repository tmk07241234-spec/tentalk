import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Body, Button, ErrorText, Field, Screen, StepLabel, Title } from '@/components/ui';
import { isLoginCode } from '@/domain/validation';
import { auth } from '@/services/auth';
import { SETUP_STEPS, useOnboarding } from '@/state/onboarding';

export default function CodeStep() {
  const { t } = useTranslation();
  const draft = useOnboarding();
  const email = draft.email ?? '';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);

  const verify = async () => {
    if (!isLoginCode(code)) return setError(t('code.invalid'));
    setBusy(true);
    try {
      const r = await auth.verifyEmailCode(email, code);
      draft.set({ method: r.method, suggestedName: r.displayName ?? '' });
      router.push('/birthday');
    } catch {
      setError(t('code.wrong'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen footer={<>
      <Button variant="primary" label={t('code.verify')} onPress={verify} loading={busy} />
      <Button variant="ghost" label={resent ? t('code.resent') : t('code.resend')} onPress={async () => { await auth.sendEmailCode(email); setResent(true); }} />
      <Button label={t('code.change')} onPress={() => router.back()} />
    </>}>
      <StepLabel>{t('common.step', { n: 1, total: SETUP_STEPS })}</StepLabel>
      <Title>{t('code.title')}</Title>
      <Body muted>{t('code.desc', { email })}</Body>
      <Field label={t('code.label')} value={code} onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" placeholder="123456" maxLength={6} />
      <ErrorText>{error}</ErrorText>
    </Screen>
  );
}
