import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/Avatar';
import { LevelTag } from '@/components/level';
import { hoursForMe, Pill, useNow } from '@/components/people';
import { Sheet } from '@/components/Sheet';
import { Body, Button, Card, Eyebrow, Screen, Title } from '@/components/ui';
import { canFollow } from '@/domain/connections';
import { commonHobbies } from '@/domain/discovery';
import { relation } from '@/domain/matching';
import { clockAt, requestExpiresAt } from '@/domain/schedule';
import { connections } from '@/services/connections';
import { usePerson } from '@/services/people';
import { findSamplePartner } from '@/services/matchmaking';
import { requests, sendRequest, type SendError } from '@/services/requests';
import { useApp, type OutgoingRequest } from '@/state/store';
import { space, useColors } from '@/theme/colors';

/**
 * Someone's profile. There is no messaging: the only way to reach them is a
 * 10-minute call request. Follow appears only after a finished 10-minute call with them. Random-call partners are reachable here only after
 * both stayed 10 minutes (the History tab links here in that case).
 */
export default function PersonScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const [sheet, setSheet] = useState<null | 'block' | 'sent'>(null);
  const [refusal, setRefusal] = useState<SendError | null>(null);
  const { person, missing } = usePerson(id);
  const profile = app.profile;
  const now = useNow();

  if (!person && !missing) return <Screen><Body muted>{t('common.loading')}</Body></Screen>;
  if (!person || !profile || app.blocked.includes(person.id)) {
    return (
      <Screen footer={<Button label={t('common.close')} onPress={() => router.back()} />}>
        <Body muted>{t('profileView.unavailable')}</Body>
      </Screen>
    );
  }

  const online = person.status === 'online';
  const myLearn = profile.learning.find((l) => relation({ native: profile.native, learn: l.lang }, person));
  const rel = myLearn ? relation({ native: profile.native, learn: myLearn.lang }, person) : null;
  const shared = commonHobbies(profile.hobbies, person.hobbies);
  const following = app.following.includes(person.id);
  // Following is earned by finishing a 10-minute call, so strangers only get the request button.
  const followable = following || canFollow(app.history, person.id);
  const requested = app.requests.some((r) => r.partnerId === person.id && r.expiresAt > now);
  const L = (code: string) => t(`lang.${code}`);

  const realPerson = !!app.account?.uid && !findSamplePartner(person.id);
  const request = async () => {
    if (realPerson) {
      // The server checks whether they accept requests from me and whether they are online.
      try {
        const r = await sendRequest(person.id);
        if (r.kind === 'now') {
          router.replace({ pathname: '/call', params: { kind: 'direct', partner: person.id, requestId: r.id } });
          return;
        }
        app.addRequest(offlineRequest(person.id));
        setSheet('sent');
      } catch (e) {
        setRefusal((e as { reason?: SendError }).reason ?? 'network');
      }
      return;
    }
    if (online) {
      router.replace({ pathname: '/call', params: { kind: 'direct', partner: person.id, ask: '1' } });
      return;
    }
    app.addRequest(offlineRequest(person.id));
    await requests.queue(person.id);
    setSheet('sent');
  };

  return (
    <Screen footer={
      <View style={{ gap: space.sm }}>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {followable ? (
            <View style={{ flex: 1 }}>
              <Button label={following ? t('profileView.following') : t('profileView.follow')} onPress={() => (following ? connections.unfollow(person.id) : connections.follow(person.id))}
                icon={<Ionicons name={following ? 'checkmark' : 'add'} size={18} color={c.ink} />} />
            </View>
          ) : null}
          <View style={{ flex: 1.6 }}>
            <Button variant="primary" disabled={requested || !rel}
              label={requested ? t('profileView.requested') : online ? t('profileView.requestOnline') : t('profileView.requestOffline')}
              onPress={request} icon={<Ionicons name="call" size={16} color="#FFFFFF" />} />
          </View>
        </View>
        {followable ? null : <Body small muted style={{ textAlign: 'center' }}>{t('profileView.followAfterCall')}</Body>}
      </View>
    }>
      <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={() => router.back()} style={{ alignSelf: 'flex-end', padding: 4 }}>
        <Ionicons name="close" size={24} color={c.muted} />
      </Pressable>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <Avatar name={person.name} color={person.color} photoUri={person.photoUri} size={76} online={online} />
        <View style={{ flex: 1, gap: 4 }}>
          <Title>{person.name}</Title>
          <Body small muted>
            {person.country ? `${t(`country.${person.country}`)} · ` : ''}{t('profileView.localTime', { time: clockAt(person.utcOffset, new Date()) })} · {online ? t('person.online') : t('profileView.offline')}
          </Body>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {rel ? <Pill label={rel === 'buddy' ? t('home.buddy') : t('home.exchange')} tone={rel === 'buddy' ? 'buddy' : 'learn'} /> : null}
            {person.languageOnly ? <Pill label={t('person.languageOnly')} /> : null}
            <Pill label={person.calls < 5 ? t('person.new') : `✓ ${t('person.trusted')}`} tone={person.calls < 5 ? 'muted' : 'ok'} />
          </View>
        </View>
      </View>

      <Body>{person.bio}</Body>

      <Card>
        <Row label={t('languages.native')} value={L(person.native)} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Body small muted>{t('profileView.learning')}</Body>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Body small>{L(person.learn)}</Body><LevelTag level={person.level} /></View>
        </View>
        <Row label={t('profileView.hours')} value={t('profileView.hoursMine', { hours: hoursForMe(person) })} />
        <Row label="" value={t('profileView.calls', { n: person.calls })} />
      </Card>

      <Eyebrow>{t('profileEdit.hobbies')}</Eyebrow>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {person.hobbies.map((h) => <Pill key={h} label={t(`hobbies.${h}`)} tone={shared.includes(h) ? 'ok' : 'muted'} />)}
      </View>

      {rel && myLearn ? (
        <Card style={{ backgroundColor: c.surface2 }}>
          <Body small muted>
            {rel === 'buddy' ? t('profileView.modeBuddy', { lang: L(myLearn.lang) }) : t('profileView.modeExchange', { learn: L(myLearn.lang), native: L(profile.native) })}
            {' '}{online ? t('profileView.noteOnline') : t('profileView.noteOffline')}
          </Body>
        </Card>
      ) : null}

      <Pressable accessibilityRole="button" onPress={() => setSheet('block')} style={{ alignSelf: 'center', padding: space.sm }}>
        <Text style={{ color: c.muted, textDecorationLine: 'underline', fontSize: 13 }}>{t('profileView.block')}</Text>
      </Pressable>

      <Sheet visible={sheet === 'block'} onClose={() => setSheet(null)}>
        <Title>{t('profileView.blockTitle', { name: person.name })}</Title>
        <Body muted>{t('profileView.blockBody')}</Body>
        <Button variant="danger" label={t('profileView.blockConfirm')} onPress={() => { app.block(person.id); setSheet(null); router.back(); }} />
        <Button label={t('common.cancel')} onPress={() => setSheet(null)} />
      </Sheet>

      <Sheet visible={refusal !== null} onClose={() => setRefusal(null)}>
        <Title>{t('request.notSent')}</Title>
        <Body muted>{refusal ? t(`request.refused.${refusal}`, { name: person.name }) : ''}</Body>
        <Button variant="primary" label={t('request.ok')} onPress={() => setRefusal(null)} />
      </Sheet>

      <Sheet visible={sheet === 'sent'} onClose={() => setSheet(null)}>
        <Title>{t('request.sentTitle')}</Title>
        <Body muted>{t('request.sentBody', { name: person.name })}</Body>
        <Button variant="primary" label={t('request.ok')} onPress={() => setSheet(null)} />
      </Sheet>
    </Screen>
  );
}

function offlineRequest(partnerId: string): OutgoingRequest {
  const sent = new Date();
  return { partnerId, sentAt: sent.getTime(), expiresAt: requestExpiresAt(sent, false).getTime() };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.md }}>
      <Body small muted>{label}</Body>
      <Body small style={{ flexShrink: 1, textAlign: 'right' }}>{value}</Body>
    </View>
  );
}
