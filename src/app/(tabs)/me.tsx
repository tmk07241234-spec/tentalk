import { useEffect, useState, type ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/Avatar';
import { LevelTag } from '@/components/level';
import { Pill } from '@/components/people';
import { Badge } from '@/components/progress';
import { VoicePlayer } from '@/components/voice';
import { Body, Button, Card, Eyebrow, Screen, Title } from '@/components/ui';
import { BADGES, earnedBadges } from '@/domain/progress';
import { api } from '@/services/api';
import { auth } from '@/services/auth';
import { useApp } from '@/state/store';
import { space, useColors } from '@/theme/colors';

export default function Me() {
  const { t } = useTranslation();
  const c = useColors();
  const { profile, trust, account, signOut, callLog, seedDemoProgress, plus } = useApp();
  // Operators get a link to the report screen; the server decides who they are.
  const [operator, setOperator] = useState<{ admin: boolean; needsVerification: boolean } | null>(null);
  const uid = account?.uid;
  useEffect(() => {
    if (!uid) return;
    api<{ admin: boolean; needsVerification: boolean }>('/api/admin?check=1', undefined, 'GET').then(setOperator).catch(() => {});
  }, [uid]);
  if (!profile) return null;

  const logout = async () => {
    await auth.signOut();
    signOut();
    router.replace('/welcome');
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title>{t('me.title')}</Title>
        <Pressable accessibilityRole="button" accessibilityLabel={t('appSettings.title')} onPress={() => router.push('/settings')} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="settings-outline" size={24} color={c.ink} />
        </Pressable>
      </View>
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
        <MenuRow label={t('appSettings.title')} icon="settings-outline" first onPress={() => router.push('/settings')} />
        {operator?.admin ? <MenuRow label={t('admin.menu')} icon="shield-checkmark-outline" onPress={() => router.push('/admin')} /> : null}
        {operator?.needsVerification ? <Body small muted>{t('admin.verify')}</Body> : null}
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
      <Body small muted style={{ textAlign: 'center' }}>{t('info.version', { v: [Constants.expoConfig?.version, process.env.EXPO_PUBLIC_BUILD_ID].filter(Boolean).join(' · ') })}</Body>
    </Screen>
  );
}

function MenuRow({ label, onPress, danger, icon, first }: { label: string; onPress: () => void; danger?: boolean; icon?: ComponentProps<typeof Ionicons>['name']; first?: boolean }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm + 2, borderTopWidth: first ? 0 : 1, borderTopColor: c.line, opacity: pressed ? 0.7 : 1 })}>
      {icon ? <Ionicons name={icon} size={18} color={c.ink} /> : null}
      <Text style={{ flex: 1, color: danger ? c.bad : c.ink, fontSize: 14 }}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={c.muted} />
    </Pressable>
  );
}
