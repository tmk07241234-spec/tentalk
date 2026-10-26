import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PersonRow, SmallChips } from '@/components/people';
import { Body, Button, Card, Eyebrow, Screen, Segmented, Title } from '@/components/ui';
import { SAMPLE_PARTNERS } from '@/data/samplePartners';
import { discover, onlineByLevel, type Segment, type SortKey } from '@/domain/discovery';
import { LEVELS, type Level } from '@/domain/levels';
import { useActiveLearning, useApp } from '@/state/store';

type LevelKey = 'all' | `${Level}`;

export default function Find() {
  const { t } = useTranslation();
  const profile = useApp((s) => s.profile);
  const blocked = useApp((s) => s.blocked);
  const active = useActiveLearning();
  const [segment, setSegment] = useState<Segment>('exchange');
  const [level, setLevel] = useState<LevelKey>('all');
  const [hobby, setHobby] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('online');
  if (!profile || !active) return null;

  const me = { native: profile.native, learn: active.lang, level: active.level, hobbies: profile.hobbies };
  const base = { segment, level: null, hobby: hobby === 'all' ? null : hobby, sort, blocked: new Set(blocked) };
  // Level counts are for the current segment before the level filter is applied.
  const counts = onlineByLevel(discover(me, SAMPLE_PARTNERS, base));
  const list = discover(me, SAMPLE_PARTNERS, { ...base, level: level === 'all' ? null : (Number(level) as Level) });
  const learn = t(`lang.${active.lang}`);
  // In exchange mode the partner's level is in my native language; otherwise in the language we both learn.
  const levelLang = t(`lang.${segment === 'exchange' ? profile.native : active.lang}`);
  const hobbyCounts = (h: string) => discover(me, SAMPLE_PARTNERS, { ...base, segment: 'hobby', hobby: h }).filter((p) => p.status === 'online').length;

  return (
    <Screen>
      <Title>{t('find.title')}</Title>
      <Segmented<Segment>
        value={segment}
        onChange={(s) => { setSegment(s); setLevel('all'); setHobby('all'); }}
        options={[
          { key: 'exchange', label: t('find.exchange'), sub: t('find.exchangeSub', { lang: learn }) },
          { key: 'buddy', label: t('find.buddy'), sub: t('find.buddySub', { lang: learn }) },
          { key: 'hobby', label: t('find.hobby'), sub: t('find.hobbySub') },
        ]}
      />

      {segment === 'hobby' ? (
        profile.hobbies.length ? (
          <>
            <Eyebrow>{t('find.yourHobbies')}</Eyebrow>
            <SmallChips label={t('find.yourHobbies')} value={hobby} onChange={setHobby}
              options={[{ key: 'all', label: t('find.all') }, ...profile.hobbies.map((h) => ({ key: h, label: t(`hobbies.${h}`), count: hobbyCounts(h) }))]} />
          </>
        ) : (
          <Card>
            <Body small muted>{t('find.noHobbies')}</Body>
            <Button small variant="primary" label={t('find.addHobbies')} onPress={() => router.push('/profile-edit')} />
          </Card>
        )
      ) : null}

      <Eyebrow>{segment === 'hobby' ? t('find.level') : t('find.levelOf', { lang: levelLang })}</Eyebrow>
      <SmallChips<LevelKey> label={t('find.level')} value={level} onChange={setLevel}
        options={[{ key: 'all', label: t('find.all') }, ...LEVELS.map((l) => ({ key: `${l}` as LevelKey, label: t(`levels.${l}.name`), count: counts[l] }))]} />

      <Eyebrow>{t('find.sort')}</Eyebrow>
      <SmallChips<SortKey> label={t('find.sort')} value={sort} onChange={setSort}
        options={[{ key: 'online', label: t('find.sortOnline') }, { key: 'common', label: t('find.sortCommon') }, { key: 'level', label: t('find.sortLevel') }]} />

      <Body small muted>{t('find.count', { n: list.length })}</Body>
      {list.length === 0 && (segment !== 'hobby' || profile.hobbies.length) ? <Body muted>{t('find.empty')}</Body> : null}
      {list.map((p) => <PersonRow key={p.id} person={p} />)}
      <Body small muted>{t('find.note')}</Body>
    </Screen>
  );
}

