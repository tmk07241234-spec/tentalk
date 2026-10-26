import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/Avatar';
import { Pip } from '@/components/Pip';
import { Pill, useNow, useRelativeTime } from '@/components/people';
import { Body, Card, Screen, Title } from '@/components/ui';
import { formatClock } from '@/domain/callRules';
import { findSamplePartner } from '@/services/matchmaking';
import { useApp } from '@/state/store';
import { space, useColors } from '@/theme/colors';

/** Every call. Random partners stay anonymous unless both stayed 10 minutes. */
export default function History() {
  const { t } = useTranslation();
  const c = useColors();
  const ago = useRelativeTime();
  const now = useNow();
  const { history, blocked, following } = useApp();
  const list = history.filter((h) => !blocked.includes(h.partnerId));

  return (
    <Screen>
      <Title>{t('history.title')}</Title>
      <Body small muted>{t('history.note')}</Body>
      {list.length === 0 ? (
        <View style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xl }}>
          <Pip pose="think" size={96} />
          <Body muted>{t('history.empty')}</Body>
        </View>
      ) : null}
      {list.map((h) => {
        const p = findSamplePartner(h.partnerId);
        const open = h.kind === 'direct' || h.unlocked;
        const name = open && p ? p.name : t('history.unknown');
        return (
          <Pressable key={h.id} accessibilityRole="button" disabled={!open || !p}
            onPress={() => p && router.push({ pathname: '/person/[id]', params: { id: p.id } })}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <Avatar name={open && p ? p.name : '?'} color={open && p ? p.color : '#8A8FA3'} />
              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={{ color: c.ink, fontWeight: '700' }}>{name}</Text>
                  <Pill label={h.kind === 'random' ? t('history.random') : t('history.direct')} tone={h.kind === 'random' ? 'buddy' : 'learn'} />
                  {open && p && following.includes(p.id) ? <Pill label={t('profileView.following')} tone="ok" /> : null}
                </View>
                <Body small muted>{ago(h.endedAt, now)} · {formatClock(h.seconds)}</Body>
                <Body small muted>{h.kind === 'random' ? (h.unlocked ? t('history.open') : t('history.hidden')) : ''}</Body>
              </View>
              {open && p ? <Text style={{ color: c.learn, fontWeight: '700' }}>{t('history.view')}</Text> : null}
            </Card>
          </Pressable>
        );
      })}
    </Screen>
  );
}
