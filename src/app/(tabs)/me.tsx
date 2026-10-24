import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/Avatar';
import { LevelTag } from '@/components/level';
import { Body, Button, Card, ChoiceChips, Eyebrow, Screen, Title } from '@/components/ui';
import { UI_LANGS, type UiLang } from '@/domain/languages';
import { deviceUiLang } from '@/i18n';
import { auth } from '@/services/auth';
import { useApp } from '@/state/store';
import { space, useColors } from '@/theme/colors';

type UiChoice = UiLang | 'device';

export default function Me() {
  const { t } = useTranslation();
  const c = useColors();
  const { profile, trust, account, uiLang, setUiLang, signOut } = useApp();
  if (!profile) return null;

  const logout = async () => {
    await auth.signOut();
    signOut();
    router.replace('/welcome');
  };

  return (
    <Screen>
      <Title>{t('me.title')}</Title>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <Avatar name={profile.name} color={profile.color} photoUri={profile.photoUri} size={64} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: c.ink, fontWeight: '700', fontSize: 17 }}>{profile.name}</Text>
            <Body small muted>{t('person.native', { lang: t(`lang.${profile.native}`) })}</Body>
            {profile.learning.map((l) => (
              <View key={l.lang} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Body small muted>{t(`lang.${l.lang}`)}</Body>
                <LevelTag level={l.level} />
              </View>
            ))}
          </View>
        </View>
      </Card>

      <Card>
        <Eyebrow>{t('me.trust')}</Eyebrow>
        <Text style={{ color: c.ink, fontSize: 32, fontWeight: '700' }}>{trust}</Text>
        <Body small muted>{t('me.trustNote')}</Body>
      </Card>

      <Card>
        <ChoiceChips<UiChoice>
          label={t('me.uiLanguage')}
          value={uiLang ?? 'device'}
          onChange={(v) => setUiLang(v === 'device' ? null : v)}
          options={[
            { key: 'device', label: t('me.device', { lang: t(`uiLangName.${deviceUiLang()}`) }) },
            ...UI_LANGS.map((l) => ({ key: l as UiChoice, label: t(`uiLangName.${l}`) })),
          ]}
        />
        <Body small muted>{t('me.uiLanguageNote')}</Body>
      </Card>

      <Card>
        <Eyebrow>{t('me.account')}</Eyebrow>
        {account ? <Body small muted>{t('me.signedInWith', { method: account.method === 'email' ? account.email ?? 'email' : account.method === 'apple' ? 'Apple' : 'Google' })}</Body> : null}
        <Button label={t('me.logout')} onPress={logout} />
        <Button variant="ghost" label={`${t('me.deleteAccount')} — ${t('me.comingSoon')}`} onPress={() => {}} disabled />
      </Card>

      <Card>
        <Eyebrow>{t('me.legal')}</Eyebrow>
        <Body small muted>{t('me.terms')} · {t('me.privacy')} · {t('me.guidelines')} — {t('me.comingSoon')}</Body>
      </Card>
    </Screen>
  );
}
