import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { Pill, useNow, useRelativeTime } from '@/components/people';
import { Body, Button, Card, Screen, Title } from '@/components/ui';
import { formatClock } from '@/domain/callRules';
import { usePeopleList } from '@/services/people';
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
  const people = usePeopleList([...new Set(list.map((h) => h.partnerId))]);

  return (
    <Screen>
      <Title>{t('history.title')}</Title>
      <Body small muted>{t('history.note')}</Body>
      {list.length === 0 ? (
        <EmptyState pose="think" title={t('history.emptyTitle')} body={t('history.emptyBody')}>
          {/* A faded example of what a finished call looks like here. */}
          <View accessible accessibilityLabel={t('history.emptyExample')} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.line, opacity: 0.6 }}>
              <Avatar name="M" color="#1F8A5B" avatar="side-0-1-1" size={36} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.ink, fontWeight: '700' }}>{t('history.exampleName')}</Text>
                <Text style={{ color: c.muted, fontSize: 12 }}>{t('history.exampleLine')}</Text>
              </View>
            </View>
            <Text style={{ color: c.muted, fontSize: 12, textAlign: 'center' }}>{t('history.emptyExample')}</Text>
          </View>
          <Button variant="sun" icon={<Ionicons name="call" size={18} color={c.sunInk} />} label={t('history.emptyCta')} onPress={() => router.push({ pathname: '/call', params: { kind: 'random' } })} />
        </EmptyState>
      ) : null}
      {list.map((h) => {
        const p = people.find((x) => x.id === h.partnerId);
        // Everyone you talked with is shown by name: quick matches show the person before the call starts.
        const name = p ? p.name : t('history.unknown');
        return (
          <Pressable key={h.id} accessibilityRole="button" disabled={!p}
            onPress={() => p && router.push({ pathname: '/person/[id]', params: { id: p.id } })}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <Avatar name={p ? p.name : '?'} color={p ? p.color : '#8A8FA3'} avatar={p?.avatar} />
              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={{ color: c.ink, fontWeight: '700' }}>{name}</Text>
                  <Pill label={h.kind === 'random' ? t('history.random') : t('history.direct')} tone={h.kind === 'random' ? 'buddy' : 'learn'} />
                  {p && following.includes(p.id) ? <Pill label={t('profileView.following')} tone="ok" /> : null}
                </View>
                <Body small muted>{ago(h.endedAt, now)} · {formatClock(h.seconds)}</Body>
                <Body small muted>{h.unlocked || (h.kind === 'direct' && h.completed) ? t('history.open') : t('history.hidden')}</Body>
              </View>
              {p ? <Text style={{ color: c.learn, fontWeight: '700' }}>{t('history.view')}</Text> : null}
            </Card>
          </Pressable>
        );
      })}
    </Screen>
  );
}
