import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/Avatar';
import { SwitchRow } from '@/components/people';
import { Body, Button, Card, ChoiceChips, Eyebrow, Screen, Title } from '@/components/ui';
import { connectionGroups, type RequestPolicy } from '@/domain/connections';
import { UI_LANGS, type UiLang } from '@/domain/languages';
import { deviceUiLang } from '@/i18n';
import { usePeopleList } from '@/services/people';
import { useApp } from '@/state/store';
import { space, useColors } from '@/theme/colors';

type UiChoice = UiLang | 'device';

const POLICIES: RequestPolicy[] = ['everyone', 'following', 'mutual', 'selected', 'none'];

/** App settings, opened from Me. Profile editing stays on its own screen. */
export default function SettingsScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { settings, updateSettings, uiLang, setUiLang, blocked, unblock, following, followers } = useApp();
  // People who can be picked for "only people I choose": everyone I am connected with.
  const groups = connectionGroups(following, followers, blocked);
  const connected = usePeopleList([...new Set([...groups.following, ...groups.followers])]);
  const blockedPeople = usePeopleList(blocked);
  const allowed = new Set(settings.requestAllowList);
  const toggleAllowed = (id: string, on: boolean) =>
    updateSettings({ requestAllowList: on ? [...settings.requestAllowList, id] : settings.requestAllowList.filter((x) => x !== id) });
  const notify = (patch: Partial<typeof settings.notify>) => updateSettings({ notify: { ...settings.notify, ...patch } });

  return (
    <Screen footer={<Button label={t('common.close')} onPress={() => router.back()} />}>
      <Title>{t('appSettings.title')}</Title>

      <Card>
        <Eyebrow>{t('appSettings.requests')}</Eyebrow>
        <Body small muted>{t('appSettings.requestsNote')}</Body>
        <View accessibilityRole="radiogroup">
          {POLICIES.map((p) => {
            const on = settings.requestsFrom === p;
            return (
              <Pressable key={p} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => updateSettings({ requestsFrom: p })}
                style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm }}>
                <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={22} color={on ? c.learn : c.muted} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ color: c.ink, fontSize: 14, fontWeight: on ? '700' : '400' }}>{t(`appSettings.policy.${p}`)}</Text>
                  <Text style={{ color: c.muted, fontSize: 12 }}>{t(`appSettings.policyNote.${p}`)}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        {settings.requestsFrom === 'selected' ? (
          <View style={{ borderTopWidth: 1, borderTopColor: c.line, paddingTop: space.sm }}>
            {connected.length === 0 ? <Body small muted>{t('appSettings.noConnections')}</Body> : null}
            {connected.map((p) => (
              <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <Avatar name={p.name} color={p.color} size={32} />
                <View style={{ flex: 1 }}>
                  <SwitchRow label={p.name} value={allowed.has(p.id)} onChange={(v) => toggleAllowed(p.id, v)} />
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </Card>

      <Card>
        <Eyebrow>{t('appSettings.notifications')}</Eyebrow>
        <SwitchRow label={t('appSettings.notifyAccepted')} value={settings.notify.accepted} onChange={(v) => notify({ accepted: v })} />
        <SwitchRow label={t('appSettings.notifyFollowed')} value={settings.notify.followed} onChange={(v) => notify({ followed: v })} />
        <SwitchRow label={t('appSettings.notifyTheme')} value={settings.notify.theme} onChange={(v) => notify({ theme: v })} />
        <Body small muted>{t('appSettings.notificationsNote')}</Body>
      </Card>

      <Card>
        <Eyebrow>{t('settings.title')}</Eyebrow>
        <SwitchRow label={t('settings.languageOnly')} note={t('settings.languageOnlyNote')} value={settings.languageOnly} onChange={(v) => updateSettings({ languageOnly: v })} />
        <SwitchRow label={t('settings.languageOnlyPartners')} note={t('settings.languageOnlyPartnersNote')} value={settings.languageOnlyPartners} onChange={(v) => updateSettings({ languageOnlyPartners: v })} />
        <SwitchRow label={t('settings.switchCue')} note={t('settings.switchCueNote')} value={settings.switchCue} onChange={(v) => updateSettings({ switchCue: v })} />
        <SwitchRow label={t('settings.matchLevel')} note={t('settings.matchLevelNote')} value={settings.matchLevel} onChange={(v) => updateSettings({ matchLevel: v })} />
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
        <Eyebrow>{t('settings.blocked')}</Eyebrow>
        {blocked.length === 0 ? <Body small muted>{t('settings.noneBlocked')}</Body> : null}
        {blocked.map((id) => {
          const p = blockedPeople.find((x) => x.id === id);
          return (
            <View key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <Avatar name={p?.name ?? '?'} color={p?.color ?? '#8A8FA3'} size={36} />
              <Text style={{ color: c.ink, flex: 1 }}>{p?.name ?? id}</Text>
              <Button small label={t('settings.unblock')} onPress={() => unblock(id)} />
            </View>
          );
        })}
      </Card>

      <Button variant="ghost" label={t('settings.guide')} onPress={() => router.push('/guide')} />
    </Screen>
  );
}
