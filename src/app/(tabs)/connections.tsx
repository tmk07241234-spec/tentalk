import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Pip } from '@/components/Pip';
import { PersonRow } from '@/components/people';
import { Body, Screen, Segmented, Title } from '@/components/ui';
import { connectionGroups, type ConnectionGroup } from '@/domain/connections';
import { findSamplePartner } from '@/services/matchmaking';
import { useApp } from '@/state/store';
import { space } from '@/theme/colors';

/**
 * People you are connected with. Every connection starts with a finished 10-minute
 * call, so this list grows only by talking.
 */
export default function Connections() {
  const { t } = useTranslation();
  const { following, followers, blocked } = useApp();
  const [group, setGroup] = useState<ConnectionGroup>('mutual');
  const groups = connectionGroups(following, followers, blocked);
  const mutual = new Set(groups.mutual);
  const people = groups[group].map(findSamplePartner).filter((p) => p !== undefined);

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
        <View style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xl }}>
          <Pip pose="think" size={96} />
          <Body muted style={{ textAlign: 'center' }}>{t(`connections.empty_${group}`)}</Body>
        </View>
      ) : null}
      {people.map((p) => <PersonRow key={p.id} person={p} mutual={mutual.has(p.id)} />)}
    </Screen>
  );
}
