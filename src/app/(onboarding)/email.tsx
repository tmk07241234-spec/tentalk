import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Body, Button, ErrorText, Field, Screen, StepLabel, Title } from '@/components/ui';
import { isEmail, isPassword } from '@/domain/validation';
import { auth, authErrorKind } from '@/services/auth';
import { SETUP_STEPS, useOnboarding } from '@/state/onboarding';
import { continueAfterSignIn } from '@/state/session';

/** Email and password. A new address creates the account; a known one signs in. */
export default function EmailStep() {
  const { t } = useTranslation();
  const draft = useOnboarding();
  const [email, setEmail] = useState(draft.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<'continue' | 'reset' | null>(null);

  const errorText = (e: unknown) => {
    const kind = authErrorKind(e);
    if (kind === 'wrong-password') return t('email.wrongPassword');
    if (kind === 'weak-password') return t('email.shortPassword');
    if (kind === 'invalid-email') return t('email.invalid');
    if (kind === 'too-many-requests') return t('email.tooMany');
    if (kind === 'network') return t('email.network');
    return t('welcome.signInFailed');
  };

  const submit = async () => {
    setNotice('');
    if (!isEmail(email)) return setError(t('email.invalid'));
    if (!isPassword(password)) return setError(t('email.shortPassword'));
    setError('');
    setBusy('continue');
    try {
      const r = await auth.continueWithEmail(email.trim(), password);
      await continueAfterSignIn(r);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(null);
    }
  };

  const reset = async () => {
    setNotice('');
    if (!isEmail(email)) return setError(t('email.resetNeedEmail'));
    setError('');
    setBusy('reset');
    try {
      await auth.sendPasswordReset(email.trim());
      setNotice(t('email.resetSent', { email: email.trim() }));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen footer={<>
      <Button variant="primary" label={t('email.continue')} onPress={submit} loading={busy === 'continue'} />
      <Button variant="ghost" label={t('email.forgot')} onPress={reset} loading={busy === 'reset'} />
      <Button label={t('common.back')} onPress={() => router.back()} />
    </>}>
      <StepLabel>{t('common.step', { n: 1, total: SETUP_STEPS })}</StepLabel>
      <Title>{t('email.title')}</Title>
      <Body muted>{t('email.desc')}</Body>
      <Field label={t('email.label')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="username" placeholder="you@example.com" />
      <Field label={t('email.password')} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete="password" textContentType="password" placeholder={t('email.passwordHint')} onSubmitEditing={submit} />
      <ErrorText>{error}</ErrorText>
      {notice ? <Body small>{notice}</Body> : null}
    </Screen>
  );
}
