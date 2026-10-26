import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/Avatar';
import { LevelTag } from '@/components/level';
import { Pill, SwitchRow } from '@/components/people';
import { Badge } from '@/components/progress';
import { VoicePlayer } from '@/components/voice';
import { Body, Button, Card, ChoiceChips, Eyebrow, Screen, Title } from '@/components/ui';
import { UI_LANGS, type UiLang } from '@/domain/languages';
import { BADGES, earnedBadges } from '@/domain/progress';
import { findSamplePartner } from '@/services/matchmaking';
import { deviceUiLang } from '@/i18n';
import { auth } from '@/services/auth';
import { useApp } from '@/state/store';
import { space, useColors } from '@/theme/colors';

type UiChoice = UiLang | 'device';

export default function Me() {
  const { t } = useTranslation();
  const c = useColors();
  const { profile, trust, account, uiLang, setUiLang, signOut, callLog, seedDemoProgress, settings, updateSettings, blocked, unblock, plus } = useApp();
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
          <Avatar name={profile.name} color={profile.color} photoUri={profile.photoUri} size={64} frame={plus ? profile.frame : null} />
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
        {profile.voice ? <VoicePlayer voice={profile.voice} /> : null}
        {profile.bio ? <Body>{profile.bio}</Body> : null}
        {profile.hobbies.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{profile.hobbies.map((h) => <Pill key={h} label={t(`hobbies.${h}`)} />)}</View>
        ) : null}
        {profile.hours ? <Body small muted>{t('profileView.hours')}: {profile.hours.start}–{profile.hours.end}</Body> : null}
        <Button label={t('me.editProfile')} onPress={() => router.push('/profile-edit')} />
      </Card>

      <Pressable accessibilityRole="button" onPress={() => router.push('/plus')}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: c.learnSoft }}>
          <Ionicons name="sparkles" size={22} color={c.learn} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.ink, fontWeight: '700' }}>Tentalk Plus{plus ? ` · ${t('plus.cardActive')}` : ''}</Text>
            <Body small muted>{t('plus.card')}</Body>
          </View>
          <Text style={{ color: c.learn, fontWeight: '700' }}>{t('plus.see')}</Text>
        </Card>
      </Pressable>

      <Card>
        <Eyebrow>{t('me.trust')}</Eyebrow>
        <Text style={{ color: c.ink, fontSize: 32, fontWeight: '700' }}>{trust}</Text>
        <Body small muted>{t('me.trustNote')}</Body>
      </Card>

      <Card>
        <Eyebrow>{t('progress.badges')}</Eyebrow>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'space-between' }}>
          {BADGES.map((b) => <Badge key={b} id={b} earned={earnedBadges(callLog).has(b)} size={48} />)}
        </View>
        {__DEV__ ? <Button small variant="ghost" label={t('progress.devSeed')} onPress={seedDemoProgress} /> : null}
      </Card>

      <Card>
        <Eyebrow>{t('settings.title')}</Eyebrow>
        <SwitchRow label={t('settings.languageOnly')} note={t('settings.languageOnlyNote')} value={settings.languageOnly} onChange={(v) => updateSettings({ languageOnly: v })} />
        <SwitchRow label={t('settings.languageOnlyPartners')} note={t('settings.languageOnlyPartnersNote')} value={settings.languageOnlyPartners} onChange={(v) => updateSettings({ languageOnlyPartners: v })} />
        <SwitchRow label={t('settings.switchCue')} note={t('settings.switchCueNote')} value={settings.switchCue} onChange={(v) => updateSettings({ switchCue: v })} />
        <SwitchRow label={t('settings.matchLevel')} note={t('settings.matchLevelNote')} value={settings.matchLevel} onChange={(v) => updateSettings({ matchLevel: v })} />
        <Button variant="ghost" label={t('settings.guide')} onPress={() => router.push('/guide')} />
      </Card>

      <Card>
        <Eyebrow>{t('settings.blocked')}</Eyebrow>
        {blocked.length === 0 ? <Body small muted>{t('settings.noneBlocked')}</Body> : null}
        {blocked.map((id) => {
          const p = findSamplePartner(id);
          return (
            <View key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <Avatar name={p?.name ?? '?'} color={p?.color ?? '#8A8FA3'} size={36} />
              <Text style={{ color: c.ink, flex: 1 }}>{p?.name ?? id}</Text>
              <Button small label={t('settings.unblock')} onPress={() => unblock(id)} />
            </View>
          );
        })}
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
        <Eyebrow>{t('info.support')}</Eyebrow>
        <MenuRow label={t('info.faq')} onPress={() => router.push('/info/faq')} />
        <MenuRow label={t('info.contact')} onPress={() => router.push('/info/contact')} />
      </Card>

      <Card>
        <Eyebrow>{t('me.legal')}</Eyebrow>
        <MenuRow label={t('me.terms')} onPress={() => router.push('/info/terms')} />
        <MenuRow label={t('me.privacy')} onPress={() => router.push('/info/privacy')} />
        <MenuRow label={t('me.guidelines')} onPress={() => router.push('/info/guidelines')} />
        <MenuRow label={t('info.tokusho')} onPress={() => router.push('/info/tokusho')} />
        <MenuRow label={t('info.licenses')} onPress={() => router.push('/info/licenses')} />
      </Card>

      <Card>
        <Eyebrow>{t('me.account')}</Eyebrow>
        {account ? <Body small muted>{t('me.signedInWith', { method: account.method === 'email' ? account.email ?? 'email' : account.method === 'apple' ? 'Apple' : 'Google' })}</Body> : null}
        <Button label={t('me.logout')} onPress={logout} />
        <MenuRow label={t('me.deleteAccount')} danger onPress={() => router.push('/info/delete')} />
      </Card>
      <Body small muted style={{ textAlign: 'center' }}>{t('info.version', { v: Constants.expoConfig?.version ?? '' })}</Body>
    </Screen>
  );
}

function MenuRow({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', paddingVertical: space.sm + 2, borderTopWidth: 1, borderTopColor: c.line, opacity: pressed ? 0.7 : 1 })}>
      <Text style={{ flex: 1, color: danger ? c.bad : c.ink, fontSize: 14 }}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={c.muted} />
    </Pressable>
  );
}
