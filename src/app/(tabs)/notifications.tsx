import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/Avatar';
import { Pip } from '@/components/Pip';
import { useNow, useRelativeTime } from '@/components/people';
import { Body, Button, Card, Screen, Title } from '@/components/ui';
import { SAMPLE_PARTNERS } from '@/data/samplePartners';
import { findSamplePartner } from '@/services/matchmaking';
import { receiveRequest } from '@/services/requests';
import { useApp, type AppNotification } from '@/state/store';
import { space, useColors } from '@/theme/colors';

const ICON: Record<AppNotification['type'], React.ComponentProps<typeof Ionicons>['name']> = {
  welcome: 'sparkles', theme: 'chatbubbles', followed: 'person-add', accepted: 'call', incoming: 'call', reportResult: 'shield-checkmark',
};

export default function Notifications() {
  const { t } = useTranslation();
  const c = useColors();
  const ago = useRelativeTime();
  const { notifications, markNotificationsRead, markHandled, blocked, following } = useApp();

  // Opening the tab clears the badge; items that were unread stay highlighted until you leave.
  const [highlight, setHighlight] = useState<Set<string>>(new Set());
  useFocusEffect(useCallback(() => {
    setHighlight(new Set(useApp.getState().notifications.filter((n) => !n.read).map((n) => n.id)));
    markNotificationsRead();
  }, [markNotificationsRead]));

  const visible = notifications.filter((n) => !n.partnerId || !blocked.includes(n.partnerId));
  const now = useNow();

  return (
    <Screen>
      <Title>{t('notifications.title')}</Title>
      {visible.length === 0 ? (
        <View style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xl }}>
          <Pip pose="sleepy" size={96} />
          <Body muted>{t('notifications.empty')}</Body>
        </View>
      ) : null}
      {visible.map((n) => {
        const p = n.partnerId ? findSamplePartner(n.partnerId) : undefined;
        const name = p?.name ?? '';
        const live = (n.type === 'accepted' || n.type === 'incoming') && !n.handled && (!n.expiresAt || n.expiresAt > now);
        const text = n.type === 'followed' || n.type === 'accepted' || n.type === 'incoming' ? t(`notifications.${n.type}`, { name }) : t(`notifications.${n.type}`);
        return (
          <Card key={n.id} style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start', borderLeftWidth: highlight.has(n.id) || !n.read ? 3 : 0, borderLeftColor: c.learn }}>
            {p ? <Avatar name={p.name} color={p.color} size={40} /> : (
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.learnSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={ICON[n.type]} size={20} color={c.learn} />
              </View>
            )}
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ color: c.ink, fontSize: 14, lineHeight: 20 }}>{text}</Text>
              <Body small muted>{ago(n.at, now)}</Body>
              {(n.type === 'accepted' || n.type === 'incoming') && p ? (
                live ? (
                  <View style={{ flexDirection: 'row', gap: space.sm }}>
                    <Button small variant="primary" label={n.type === 'accepted' ? t('notifications.call') : t('notifications.accept')}
                      onPress={() => { markHandled(n.id); router.push({ pathname: '/call', params: { kind: 'direct', partner: p.id } }); }} />
                    {n.type === 'incoming' ? <Button small label={t('notifications.decline')} onPress={() => markHandled(n.id)} /> : null}
                  </View>
                ) : <Body small muted>{n.handled ? t('notifications.done') : t('notifications.expired')}</Body>
              ) : null}
            </View>
          </Card>
        );
      })}

      {__DEV__ ? (
        <Button small variant="ghost" label={t('notifications.devIncoming')} onPress={() => {
          // Tries everyone online, people I follow first, so each request setting can be checked.
          const online = SAMPLE_PARTNERS.filter((x) => x.status === 'online' && !blocked.includes(x.id));
          const ordered = [...online.filter((x) => following.includes(x.id)), ...online];
          ordered.some((x) => receiveRequest(x.id));
        }} />
      ) : null}
    </Screen>
  );
}
