import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Pip } from '@/components/Pip';
import { Body, ChoiceChips, ErrorText, Screen, Title } from '@/components/ui';
import { UI_LANGS, type UiLang } from '@/domain/languages';
import { auth, authErrorKind } from '@/services/auth';
import { useOnboarding } from '@/state/onboarding';
import { continueAfterSignIn } from '@/state/session';
import { useApp } from '@/state/store';
import { radius, space, useColors } from '@/theme/colors';

export default function Welcome() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const setUiLang = useApp((s) => s.setUiLang);
  const draft = useOnboarding();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // App Store guideline 1.2: people must agree to the terms (no tolerance for objectionable content) before signing up.
  const [agreed, setAgreed] = useState(false);
  const needAgreement = () => { if (agreed) return false; setError(t('welcome.agreeFirst')); return true; };

  const continueWithGoogle = async () => {
    if (needAgreement()) return;
    setBusy(true);
    setError('');
    try {
      const r = await auth.signInWithGoogle();
      draft.reset();
      await continueAfterSignIn(r);
    } catch (e) {
      if (authErrorKind(e) !== 'cancelled') setError(t('welcome.signInFailed'));
    } finally {
      setBusy(false);
    }
  };

  const ssoStyle = { minHeight: 50, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: space.sm };

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
      <View style={{ gap: space.sm, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface }}>
        <Body small muted>{t('welcome.agree')}</Body>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {(['terms', 'guidelines', 'privacy'] as const).map((doc) => (
            <Pressable key={doc} accessibilityRole="link" onPress={() => router.push(`/info/${doc}`)} hitSlop={8}>
              <Text style={{ color: c.learn, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' }}>{t(`me.${doc}`)}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} onPress={() => { setAgreed((v) => !v); setError(''); }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 4 }}>
          <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={24} color={agreed ? c.learn : c.muted} />
          <Text style={{ color: c.ink, fontWeight: '600', flex: 1 }}>{t('welcome.agreeCheck')}</Text>
        </Pressable>
      </View>
      {auth.methods.includes('google') ? (
        <Pressable accessibilityRole="button" disabled={busy} onPress={continueWithGoogle} style={[ssoStyle, { backgroundColor: c.surface, borderColor: c.line, opacity: busy ? 0.6 : 1 }]}>
          <Ionicons name="logo-google" size={18} color={c.ink} />
          <Text style={{ color: c.ink, fontWeight: '700', fontSize: 15 }}>{t('welcome.google')}</Text>
        </Pressable>
      ) : null}
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => { if (needAgreement()) return; draft.reset(); router.push('/email'); }} style={[ssoStyle, { backgroundColor: c.surface, borderColor: c.line, opacity: agreed ? 1 : 0.5 }]}>
        <Ionicons name="mail-outline" size={18} color={c.ink} />
        <Text style={{ color: c.ink, fontWeight: '700', fontSize: 15 }}>{t('welcome.email')}</Text>
      </Pressable>
      <ErrorText>{error}</ErrorText>
      <Body small muted style={{ textAlign: 'center' }}>{t('welcome.signInNote')}</Body>
    </Screen>
  );
}
