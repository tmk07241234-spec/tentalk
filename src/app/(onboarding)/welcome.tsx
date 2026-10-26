import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Pip } from '@/components/Pip';
import { Body, ChoiceChips, ErrorText, Screen, Title } from '@/components/ui';
import { UI_LANGS, type UiLang } from '@/domain/languages';
import { auth, type SignInResult } from '@/services/auth';
import { useOnboarding } from '@/state/onboarding';
import { useApp } from '@/state/store';
import { radius, space, useColors } from '@/theme/colors';

export default function Welcome() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const setUiLang = useApp((s) => s.setUiLang);
  const draft = useOnboarding();
  const [busy, setBusy] = useState<'apple' | 'google' | null>(null);
  const [error, setError] = useState('');

  const continueWith = async (method: 'apple' | 'google') => {
    setBusy(method);
    setError('');
    try {
      const r: SignInResult = method === 'apple' ? await auth.signInWithApple() : await auth.signInWithGoogle();
      draft.reset();
      draft.set({ method: r.method, email: r.email, suggestedName: r.displayName ?? '' });
      router.push('/birthday');
    } catch {
      setError(t('welcome.signInFailed'));
    } finally {
      setBusy(null);
    }
  };

  const ssoStyle = { minHeight: 50, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: space.sm };
  // Apple's guidelines: black button on light backgrounds, white on dark.
  const appleBg = c.ink;
  const appleFg = c.bg;

  return (
    <Screen>
      <ChoiceChips<UiLang>
        label={t('welcome.uiLanguage')}
        options={UI_LANGS.map((l) => ({ key: l, label: t(`uiLangName.${l}`) }))}
        value={i18n.language as UiLang}
        onChange={setUiLang}
      />
      <View style={{ alignItems: 'center', paddingVertical: space.xl, gap: space.md }}>
        <Pip pose="wave" size={130} />
        <Title>{t('welcome.title')}</Title>
        <Body muted style={{ textAlign: 'center' }}>{t('welcome.tagline')}</Body>
      </View>
      <Pressable accessibilityRole="button" disabled={!!busy} onPress={() => continueWith('apple')} style={[ssoStyle, { backgroundColor: appleBg, borderColor: appleBg }]}>
        <Ionicons name="logo-apple" size={20} color={appleFg} />
        <Text style={{ color: appleFg, fontWeight: '700', fontSize: 15 }}>{t('welcome.apple')}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" disabled={!!busy} onPress={() => continueWith('google')} style={[ssoStyle, { backgroundColor: c.surface, borderColor: c.line }]}>
        <Ionicons name="logo-google" size={18} color={c.ink} />
        <Text style={{ color: c.ink, fontWeight: '700', fontSize: 15 }}>{t('welcome.google')}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" disabled={!!busy} onPress={() => { draft.reset(); router.push('/email'); }} style={[ssoStyle, { backgroundColor: c.surface, borderColor: c.line }]}>
        <Ionicons name="mail-outline" size={18} color={c.ink} />
        <Text style={{ color: c.ink, fontWeight: '700', fontSize: 15 }}>{t('welcome.email')}</Text>
      </Pressable>
      <ErrorText>{error}</ErrorText>
      <Body small muted style={{ textAlign: 'center' }}>{t('welcome.agree')}</Body>
    </Screen>
  );
}
