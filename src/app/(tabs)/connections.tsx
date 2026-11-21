import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/EmptyState';
import { PersonRow } from '@/components/people';
import { Body, Button, Screen, Segmented, Title } from '@/components/ui';
import { connectionGroups, type ConnectionGroup } from '@/domain/connections';
import { usePeopleList } from '@/services/people';
import { useApp } from '@/state/store';
import { space, useColors } from '@/theme/colors';

/**
 * People you are connected with. Every connection starts with a finished 10-minute
 * call, so this list grows only by talking.
 */
export default function Connections() {
  const c = useColors();
  const { t } = useTranslation();
  const { following, followers, blocked } = useApp();
  const [group, setGroup] = useState<ConnectionGroup>('mutual');
  const groups = connectionGroups(following, followers, blocked);
  const mutual = new Set(groups.mutual);
  const people = usePeopleList(groups[group]);

  return (
    <Screen>
      <Title>{t('connections.title')}</Title>
      <Body small muted>{t('connections.note')}</Body>
      <Segmented<ConnectionGroup>
        value={group}
        onChange={setGroup}
        options={(['mutual', 'following', 'followers'] as const).map((g) => ({ key: g, label: t(`connections.${g}`), sub: String(groups[g].length) }))}
      />
      {people.length === 0 ? (
        <EmptyState pose={group === 'followers' ? 'think' : 'wave'} title={t(group === 'followers' ? 'connections.emptyFollowersTitle' : 'connections.emptyTitle')} body={t(`connections.empty_${group}`)}>
          {group !== 'followers' ? (
            <>
              {/* How connections grow in Tentalk: talk, finish 10 minutes, then follow. */}
              <View style={{ backgroundColor: c.surface, borderRadius: 18, padding: space.md, gap: space.sm }}>
                {(['talk', 'finish', 'follow'] as const).map((k, i) => (
                  <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                    <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.coralSoft, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: c.coral, fontWeight: '800', fontSize: 13 }}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.ink, fontWeight: '700' }}>{t(`connections.steps.${k}`)}</Text>
                      <Text style={{ color: c.muted, fontSize: 12 }}>{t(`connections.steps.${k}Sub`)}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Button variant="sun" icon={<Ionicons name="call" size={18} color={c.sunInk} />} label={t('connections.emptyCta')} onPress={() => router.push({ pathname: '/call', params: { kind: 'random' } })} />
            </>
          ) : null}
        </EmptyState>
      ) : null}
      {people.map((p) => <PersonRow key={p.id} person={p} mutual={mutual.has(p.id)} />)}
    </Screen>
  );
}
