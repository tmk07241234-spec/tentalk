import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Pip } from '@/components/Pip';
import { Badge, Confetti, SpeechBubble } from '@/components/progress';
import { Sheet } from '@/components/Sheet';
import { Body, Button, Card, Title } from '@/components/ui';
import { EXAMPLE_QUESTIONS, HELP_PHRASES, QUESTIONS, questionIn, questionsFor } from '@/data/conversation';
import type { Partner } from '@/data/samplePartners';
import {
  REQUIRED_SECONDS, callOutcome, formatClock, shouldShowAd, silenceNudge, type CallOutcome, type EndReason,
} from '@/domain/callRules';
import { canFollow } from '@/domain/connections';
import type { Lang, UiLang } from '@/domain/languages';
import { relation, type Mode } from '@/domain/matching';
import { calledToday, currentStreak, dayKey, newBadges, type BadgeId } from '@/domain/progress';
import { ONLINE_REQUEST_SECONDS } from '@/domain/schedule';
import { api } from '@/services/api';
import { connections } from '@/services/connections';
import { joinCallRoom, type CallMessage, type CallRoom } from '@/services/callRoom';
import { callInfo, findSamplePartner, matchmaking, searchRandomCall } from '@/services/matchmaking';
import { loadPerson, usePerson } from '@/services/people';
import { setInCall } from '@/services/presence';
import { cancelRequest, requests, sendRequest, watchRequest, type RequestAnswer } from '@/services/requests';
import { useActiveLearning, useApp, type HistoryEntry } from '@/state/store';
import { CALL_BG, space, useColors } from '@/theme/colors';

/** A new question card stays this long before either person can draw the next one. */
const QUESTION_COOLDOWN_SECONDS = 20;
type Phase = 'searching' | 'joining' | 'none' | 'waiting' | 'noAnswer' | 'connected' | 'result';
/** If the matched partner has not joined the audio room by then, search again. */
const PARTNER_JOIN_TIMEOUT_MS = 30_000;
const REASONS = ['romance', 'sexual', 'abuse', 'spam', 'minor', 'trolling', 'other'] as const;

/**
 * kind=random: search → 10 required minutes → open-ended extension → result.
 * kind=direct&partner=<id>: a call with a chosen person. With ask=1 we first wait
 * for them to accept; without it the request was already accepted.
 * Random calls of signed-in users are real: the server pairs two searching people and
 * both join the call's LiveKit audio room. Direct calls with real users work the same way
 * once the partner accepts (requestId: waiting for the answer; callId: already accepted).
 * Calls with the sample people are simulated.
 */
export default function Call() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const app = useApp();
  const active = useActiveLearning();
  const profile = app.profile!;
  const params = useLocalSearchParams<{ kind?: string; partner?: string; ask?: string; requestId?: string; callId?: string }>();
  const kind = params.kind === 'direct' ? 'direct' : 'random';
  const myUid = app.account?.uid;
  const sample = kind === 'direct' && params.partner ? findSamplePartner(params.partner) ?? null : null;
  const realDirect = kind === 'direct' && !!myUid && !!params.partner && !sample;
  const { person: realChosen } = usePerson(realDirect ? params.partner : undefined);
  const chosen = sample ?? realChosen ?? null;
  const live = !!myUid && (kind === 'random' || realDirect);

  const [phase, setPhase] = useState<Phase>(() => {
    if (realDirect) return params.callId ? 'joining' : params.requestId || params.ask === '1' ? 'waiting' : 'none';
    return sample ? (params.ask === '1' ? 'waiting' : 'connected') : kind === 'direct' ? 'none' : 'searching';
  });
  const [partner, setPartner] = useState<Partner | null>(chosen);
  const [answer, setAnswer] = useState<RequestAnswer | null>(null);
  const [waitLeft, setWaitLeft] = useState(ONLINE_REQUEST_SECONDS);
  const [elapsed, setElapsed] = useState(0);
  const [silence, setSilence] = useState(0);
  // The shared question card. The first one appears on its own; after that either person draws the next.
  // `at` is the call time it appeared, so the next one can wait a little (see QUESTION_COOLDOWN_SECONDS).
  const [question, setQuestion] = useState<{ id: string; by: 'auto' | 'me' | 'partner'; at: number }>({ id: QUESTIONS[0].id, by: 'auto', at: 0 });
  // Also show the card in my app language; stays on for later cards once turned on.
  const [translate, setTranslate] = useState(false);
  const [muted, setMuted] = useState(false);
  const [sheet, setSheet] = useState<null | 'leave' | 'report' | 'help'>(null);
  const [reason, setReason] = useState<(typeof REASONS)[number] | null>(null);
  const [outcome, setOutcome] = useState<(CallOutcome & { reason: EndReason; badges: BadgeId[]; streakUp: number; ad: boolean }) | null>(null);
  const [adClosed, setAdClosed] = useState(false);
  const [devSpeed, setDevSpeed] = useState(1);
  const [devSilent, setDevSilent] = useState(false);
  // Live calls: the audio room, whether anyone is talking, and whether the browser blocked sound.
  const room = useRef<CallRoom | null>(null);
  const speaking = useRef(false);
  const [callId, setCallId] = useState<string | null>(realDirect ? params.callId ?? null : null);
  // The mode the server decided for a live call (direct calls: from both people's languages).
  const [serverMode, setServerMode] = useState<Mode | null>(null);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [failure, setFailure] = useState<'mic' | 'network' | null>(null);

  const me = { native: profile.native, learn: active?.lang ?? 'en' };
  // A chosen person may relate to any of my learning languages; random calls use the Home mode.
  const myLearnFor = (p: Partner | null) => (p && p.native !== me.native ? (profile.learning.find((l) => relation({ native: me.native, learn: l.lang }, p)) ?? null) : null);
  const directLearn = chosen ? myLearnFor(chosen)?.lang ?? me.learn : me.learn;
  const meNow = { native: me.native, learn: kind === 'direct' ? directLearn : me.learn };
  const mode = serverMode ?? (kind === 'direct' && chosen ? relation(meNow, chosen) ?? 'buddy' : app.mode);
  // Question cards show in the language I am learning; each person can also read them in
  // their own app language. Nobody switches the other person's screen.
  const lang: Lang = meNow.learn;
  const buddy = mode === 'buddy';

  // Live direct call: wait for the partner's answer to the request (60 s at most).
  // Without a request yet ("call now" on an accepted request), send one first.
  useEffect(() => {
    if (phase !== 'waiting' || !realDirect || !params.partner) return;
    let left = false;
    let settled = false; // answered, declined or timed out
    let requestId = params.requestId ?? null;
    let stopWatch = () => {};
    const tick = setInterval(() => setWaitLeft((n) => Math.max(0, n - 1)), 1000);
    const giveUp = (a: RequestAnswer) => { settled = true; if (!left) { setAnswer(a); setPhase('noAnswer'); } };
    const timeout = setTimeout(() => { if (requestId) void cancelRequest(requestId); giveUp('expired'); }, ONLINE_REQUEST_SECONDS * 1000);
    (async () => {
      if (!requestId) {
        const r = await sendRequest(params.partner!);
        if (r.kind !== 'now') return giveUp('expired'); // they went offline meanwhile; the request waits for them
        requestId = r.id;
      }
      if (left) return void cancelRequest(requestId);
      stopWatch = watchRequest(requestId, (r) => {
        if (r.status === 'accepted' && r.callId) { settled = true; clearTimeout(timeout); setCallId(r.callId); setPhase('joining'); }
        else if (r.status === 'declined') giveUp('declined');
      });
    })().catch(() => giveUp('expired'));
    return () => {
      left = true; stopWatch(); clearInterval(tick); clearTimeout(timeout);
      // Closing the screen while still waiting withdraws the request.
      if (requestId && !settled) void cancelRequest(requestId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Simulated direct call with a sample person and ask=1: wait for the answer (60 s at most).
  useEffect(() => {
    if (phase !== 'waiting' || !sample) return;
    const ctrl = new AbortController();
    let left = false; // set when this screen is closed, so a late answer is ignored
    const tick = setInterval(() => setWaitLeft((n) => Math.max(0, n - 1)), 1000);
    const timeout = setTimeout(() => ctrl.abort(), ONLINE_REQUEST_SECONDS * 1000);
    requests.askNow(sample.id, ctrl.signal)
      .then((a) => {
        if (left) return;
        if (a === 'accepted') setPhase('connected');
        else { setAnswer(a); setPhase('noAnswer'); }
      })
      .catch(() => { if (!left) { setAnswer('expired'); setPhase('noAnswer'); } });
    return () => { left = true; ctrl.abort(); clearInterval(tick); clearTimeout(timeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const searchAgain = () => {
    setCallId(null); setFailure(null); setAudioBlocked(false);
    if (live) setPartner(null);
    setPhase('searching');
  };

  const startCall = () => {
    setElapsed(0); setSilence(0); setQuestion({ id: QUESTIONS[0].id, by: 'auto', at: 0 });
    setPhase('connected');
  };

  // Search for a partner whenever we enter the searching phase.
  useEffect(() => {
    if (phase !== 'searching') return;
    const ctrl = new AbortController();
    if (live && kind === 'random') {
      searchRandomCall({
        mode, native: me.native, learn: me.learn, level: active?.level ?? 1, languageOnly: app.settings.languageOnly,
        wantLanguageOnly: app.settings.languageOnlyPartners, matchLevel: app.settings.matchLevel,
      }, ctrl.signal)
        .then((id) => {
          if (ctrl.signal.aborted) return;
          if (!id) return setPhase('none');
          setCallId(id);
          setPhase('joining');
        })
        .catch(() => { if (!ctrl.signal.aborted) { setFailure('network'); setPhase('none'); } });
      return () => ctrl.abort();
    }
    matchmaking
      .findPartner(me, { mode, myLevel: active?.level ?? 3, languageOnlyPartners: app.settings.languageOnlyPartners, matchLevel: app.settings.matchLevel, blocked: new Set(app.blocked) }, ctrl.signal)
      .then((p) => {
        if (!p) return setPhase('none');
        setPartner(p);
        startCall();
      })
      .catch(() => {});
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Call clock. Silence: nobody speaking in a live call; a dev toggle stands in for simulated calls.
  useEffect(() => {
    if (phase !== 'connected') return;
    const id = setInterval(() => {
      const quiet = live ? !speaking.current : devSilent;
      setElapsed((e) => e + 0.25 * devSpeed);
      setSilence((s) => (quiet ? s + 0.25 * devSpeed : 0));
    }, 250);
    return () => clearInterval(id);
  }, [phase, devSpeed, devSilent, live]);

  const nudge = silenceNudge(silence);
  // The question card is shared so both answer the same one; the screen says who drew it.
  const send = (m: CallMessage) => room.current?.send(m);
  const drawQuestion = () => {
    const cards = questionsFor(active?.level ?? 1);
    const next = cards[(cards.findIndex((c) => c.id === question.id) + 1) % cards.length];
    setQuestion({ id: next.id, by: 'me', at: elapsed });
    send({ t: 'question', id: next.id });
  };
  const onMessage = (m: CallMessage) => {
    if (m.t === 'question' && QUESTIONS.some((q) => q.id === m.id)) setQuestion({ id: m.id, by: 'partner', at: elapsed });
  };

  const end = (r: EndReason) => {
    if (phase !== 'connected') return;
    if (r === 'report' && callId) void api('/api/report', { callId, reason: reason ?? 'other' }).catch(() => {});
    void room.current?.leave(); room.current = null;
    const o = callOutcome({ elapsedSeconds: elapsed, reason: r, kind, todayGain: app.todayGain });
    const before = app.callLog;
    const after = [...before, { date: dayKey(new Date()), minutes: Math.round(elapsed / 60), completed: o.completedRequired }];
    // The streak only goes up on the first completed call of the day.
    const streakUp = o.completedRequired && !calledToday(before, new Date()) ? currentStreak(after, new Date()) : 0;
    app.applyCallResult({ trustDelta: o.trustDelta, todayGain: o.todayGain, minutes: Math.round(elapsed / 60), completed: o.completedRequired, cooldownMinutes: o.randomCooldownMinutes });
    if (partner) {
      const record: Omit<HistoryEntry, 'id'> = { partnerId: partner.id, kind, endedAt: Date.now(), seconds: Math.round(elapsed), completed: o.completedRequired, unlocked: o.profileUnlocked };
      app.addHistory(record);
      if (r !== 'report' && canFollow([record], partner.id)) connections.afterCompletedCall(partner.id);
      if (r === 'report') app.block(partner.id);
    }
    // callCount after this call; ads never show for reports, and never full-screen.
    const ad = r !== 'report' && shouldShowAd({ plus: app.plus, callCount: app.callCount + 1 });
    setAdClosed(false);
    setOutcome({ ...o, reason: r, badges: newBadges(before, after), streakUp, ad });
    setSheet(null);
    setPhase('result');
  };
  // The audio room's callbacks outlive renders; these always run the current handlers.
  const endFromRoom = useEffectEvent(end);
  const messageFromRoom = useEffectEvent(onMessage);

  // Matched: load the partner, then join the audio room and wait for them to arrive.
  // Keyed on the call only, so moving on to the connected phase keeps the room open.
  useEffect(() => {
    if (!callId) return;
    let stale = false;
    let joined = false;
    const giveUp = setTimeout(() => {
      if (joined || stale) return;
      void room.current?.leave(); room.current = null;
      // A random partner who never arrived: look for someone else. A direct one: give up.
      if (kind === 'random') searchAgain();
      else { setAnswer('expired'); setPhase('noAnswer'); }
    }, PARTNER_JOIN_TIMEOUT_MS);
    (async () => {
      const info = await callInfo(callId);
      const person = await loadPerson(info.partnerId);
      if (stale) return;
      setPartner(person ?? unknownPartner(info.partnerId));
      setServerMode(info.mode);
      const r = await joinCallRoom(info.url, info.token, {
        onPartnerJoined: () => { if (!joined) { joined = true; startCall(); } },
        onPartnerLeft: () => endFromRoom('partner_left'),
        onMessage: (m) => messageFromRoom(m),
        onSpeaking: (anyone) => { speaking.current = anyone; },
        onAudioBlocked: setAudioBlocked,
        onDisconnected: () => endFromRoom('connection_lost'),
      }).catch((e: unknown) => {
        throw Object.assign(new Error('join failed'), { mic: /permission|NotAllowed|denied/i.test(String((e as Error)?.name) + String((e as Error)?.message)) });
      });
      if (stale) return void r.leave();
      room.current = r;
    })().catch((e: { mic?: boolean }) => {
      if (stale) return;
      void room.current?.leave(); room.current = null;
      setFailure(e?.mic ? 'mic' : 'network');
      setPhase('none');
    });
    return () => { stale = true; clearTimeout(giveUp); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId]);

  // Others see me as "in a call" while connected, so they do not send me requests.
  useEffect(() => {
    if (!live || phase !== 'connected') return;
    setInCall(true);
    return () => setInCall(false);
  }, [live, phase]);

  // Leave the audio room when the screen closes.
  useEffect(() => () => { void room.current?.leave(); room.current = null; }, []);

  const bg = buddy ? CALL_BG.buddy : CALL_BG.learn;

  if (phase === 'waiting' || phase === 'noAnswer') {
    const name = chosen?.name ?? '';
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          {phase === 'waiting'
            ? <Pip pose="listen" tone={buddy ? 'buddy' : 'learn'} size={130} motion="bounce" />
            : <Pip pose="sleepy" tone={buddy ? 'buddy' : 'learn'} size={130} />}
        </View>
        {chosen ? <View style={{ alignItems: 'center' }}><Avatar name={chosen.name} color={chosen.color} size={56} /></View> : null}
        <Title>{phase === 'waiting' ? t('request.waiting', { name }) : answer === 'declined' ? t('request.declined', { name }) : t('request.expired')}</Title>
        <Body muted>{phase === 'waiting' ? t('request.waitingBody', { seconds: waitLeft }) : t('request.tryLater')}</Body>
        <Button label={phase === 'waiting' ? t('request.cancel') : t('call.home')} onPress={() => router.back()} />
      </SafeAreaView>
    );
  }
  const required = elapsed < REQUIRED_SECONDS;

  if (phase === 'searching' || phase === 'joining' || phase === 'none') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
        {phase !== 'none' ? (
          <>
            <View style={{ alignItems: 'center' }}><Pip pose="listen" tone={buddy ? 'buddy' : 'learn'} size={130} motion="bounce" /></View>
            <Title>{phase === 'joining' ? t('call.joining') : t('call.searching')}</Title>
            <Body>{t('pip.searching')}</Body>
            <Body muted>{buddy ? t('call.condBuddy', { lang: t(`lang.${me.learn}`), native: t(`lang.${me.native}`) }) : t('call.condExchange', { learn: t(`lang.${me.learn}`), native: t(`lang.${me.native}`) })}</Body>
          </>
        ) : (
          <>
            <View style={{ alignItems: 'center' }}><Pip pose="sleepy" tone={buddy ? 'buddy' : 'learn'} size={130} /></View>
            <Title>{failure ? t(failure === 'mic' ? 'call.micBlocked' : 'call.networkError') : t('call.noPartner')}</Title>
            <Body muted>{failure ? t(failure === 'mic' ? 'call.micBlockedBody' : 'call.networkErrorBody') : t('call.noPartnerBody')}</Body>
            {kind === 'random' ? <Button variant="primary" label={t('call.retry')} onPress={searchAgain} /> : null}
          </>
        )}
        <Button label={t('common.cancel')} onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (phase === 'result' && outcome && partner) {
    const titleKey = outcome.reason === 'report' ? 'call.resultReport' : outcome.trustDelta < 0 ? 'call.resultEarly' : 'call.resultDone';
    const following = app.following.includes(partner.id);
    const celebrate = outcome.completedRequired && outcome.reason !== 'report';
    const pipLine = outcome.reason === 'report' ? t('pip.report') : celebrate ? t('pip.done') : t('pip.early');
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
        {celebrate ? <Confetti /> : null}
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Pip pose={outcome.reason === 'report' ? 'listen' : celebrate ? 'cheer' : 'wave'} tone={buddy ? 'buddy' : 'learn'} size={88} motion={celebrate ? 'bounce' : 'idle'} />
            <SpeechBubble text={pipLine} />
          </View>
          <Body small muted>{formatClock(elapsed)}</Body>
          <Title>{t(titleKey)}</Title>
          {outcome.streakUp > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: c.nativeSoft, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 }}>
              <Ionicons name="flame" size={16} color={c.native} />
              <Text style={{ color: c.native, fontWeight: '700' }}>{t('progress.streakUp', { n: outcome.streakUp })}</Text>
            </View>
          ) : null}
          {outcome.badges.length ? (
            <Card style={{ alignItems: 'center' }}>
              <Body>{t('pip.newBadge')}</Body>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.md }}>
                {outcome.badges.map((b) => <Badge key={b} id={b} earned size={64} />)}
              </View>
            </Card>
          ) : null}
          <Body muted>
            {outcome.reason === 'report' ? t('call.resultReportBody')
              : outcome.trustDelta < 0 ? t('call.resultCooldown')
              : outcome.completedRequired ? (outcome.trustDelta > 0 ? t('call.resultCompleted') : t('call.resultCapped')) : ''}
          </Body>
          <Body>{t('call.trust')}: {outcome.trustDelta > 0 ? '+' : ''}{outcome.trustDelta} → {app.trust}</Body>
          {outcome.profileUnlocked ? (
            <Card style={{ backgroundColor: c.surface2 }}>
              <Body small muted>{t('call.unlocked')}</Body>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <Avatar name={partner.name} color={partner.color} />
                <Text style={{ color: c.ink, fontWeight: '700', flex: 1 }}>{partner.name}</Text>
                <Button small variant={following ? 'secondary' : 'primary'} label={following ? t('call.following') : t('call.follow')} onPress={() => connections.follow(partner.id)} />
              </View>
              <Body small muted>{t('call.followLater')}</Body>
            </Card>
          ) : outcome.reason !== 'report' ? <Body small muted>{t('call.notUnlocked')}</Body> : null}
          {outcome.ad && !adClosed ? (
            <View accessibilityLabel={t('ad.label')} style={{ borderRadius: 14, borderWidth: 1, borderColor: c.line, overflow: 'hidden', backgroundColor: c.surface }}>
              <View style={{ height: 86, backgroundColor: '#F4C95D', justifyContent: 'center', paddingHorizontal: space.md }}>
                <Text style={{ color: '#2a1405', fontWeight: '700', fontSize: 15 }}>{t('ad.sample')}</Text>
              </View>
              <Text style={{ position: 'absolute', top: 8, left: 8, color: '#fff', backgroundColor: 'rgba(0,0,0,0.55)', fontSize: 10, borderRadius: 4, paddingHorizontal: 5, overflow: 'hidden' }}>{t('ad.label')}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={t('ad.close')} onPress={() => setAdClosed(true)}
                style={{ position: 'absolute', top: 6, right: 6, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="close" size={16} color="#fff" />
              </Pressable>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: space.sm }}>
                <Body small muted>{t('ad.every')}</Body>
                <Pressable accessibilityRole="button" onPress={() => router.push('/plus')}><Text style={{ color: c.learn, fontWeight: '700', fontSize: 12 }}>{t('ad.remove')}</Text></Pressable>
              </View>
            </View>
          ) : null}
          {kind === 'random' && (outcome.reason !== 'hangup' || outcome.trustDelta >= 0) ? (
            <Button variant="primary" label={t('call.talkAgain')} onPress={searchAgain} />
          ) : null}
          <Button label={t('call.home')} onPress={() => router.back()} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!partner) return null;
  // Deep questions only when whoever is speaking their learning language can handle them.
  const cards = questionsFor(active?.level ?? 1);
  const card = QUESTIONS.find((q) => q.id === question.id) ?? cards[0];
  const shown = questionIn(card, lang);
  const uiLang = i18n.language as UiLang;
  const mine = questionIn(card, uiLang);
  const canTranslate = mine.q !== shown.q;
  // Whoever drew the card answers second, so the other person starts. For the first card
  // both screens agree on the order by comparing user ids.
  const meFirst = question.by === 'partner' || (question.by === 'auto' && (!live || (myUid ?? '') < partner.id));
  const order = meFirst ? [t('call.you'), partner.name] : [partner.name, t('call.you')];
  // A new card stays up for a moment, so neither person can skip the other's topic right away.
  const nextIn = Math.ceil(question.at + QUESTION_COOLDOWN_SECONDS - elapsed);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ flex: 1, padding: space.lg, gap: space.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pill text={nudge ? t('call.aiActive') : t('call.aiIdle')} />
          <Pill text={buddy ? t('home.buddy') : t('home.exchange')} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <Avatar name={partner.name} color={partner.color} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{partner.name}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
              {t('person.native', { lang: t(`lang.${partner.native}`) })}{partner.languageOnly ? ` · ${t('person.languageOnly')}` : ''}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'center', gap: space.sm, marginVertical: space.md }}>
          <Text accessibilityRole="timer" style={{ color: '#fff', fontSize: 44, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{formatClock(elapsed)}</Text>
          <View style={{ height: 6, alignSelf: 'stretch', borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
            <View style={{ height: 6, width: `${Math.min(100, (elapsed / REQUIRED_SECONDS) * 100)}%`, backgroundColor: required ? '#fff' : '#7CF0B5' }} />
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
            {required ? t('call.required', { time: formatClock(REQUIRED_SECONDS - elapsed) }) : t('call.extended')}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: space.sm }}>
          <Text style={{ color: '#fff', fontSize: 13, textAlign: 'center' }}>
            {buddy ? t('call.onlyLang', { lang: t(`lang.${lang}`) }) : t('call.exchangeLangs', { learn: t(`lang.${lang}`), native: t(`lang.${profile.native}`) })}
          </Text>
        </View>

        <View style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: space.md, gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700' }}>{t('call.question')}</Text>
            <Text numberOfLines={1} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, flexShrink: 1 }}>{t('call.order', { first: order[0], second: order[1] })}</Text>
          </View>
          {question.by === 'partner' ? <Text style={{ color: '#FFD166', fontSize: 11, fontWeight: '700' }}>{t('call.partnerDrew', { name: partner.name })}</Text> : null}
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, lineHeight: 22 }}>{shown.q}</Text>
          {shown.options ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <OptionChip label={shown.options[0]} />
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>vs</Text>
              <OptionChip label={shown.options[1]} />
            </View>
          ) : null}
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{shown.hint}</Text>
          {canTranslate && translate ? (
            <View style={{ borderLeftWidth: 2, borderLeftColor: 'rgba(255,255,255,0.5)', paddingLeft: space.sm, gap: 2 }}>
              <Text style={{ color: '#fff', fontSize: 13 }}>{mine.q}</Text>
              {mine.options ? <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{mine.options.join(' vs ')}</Text> : null}
            </View>
          ) : null}
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{t('call.questionNote')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: 2 }}>
            <GlassButton label={nextIn > 0 ? t('call.nextQuestionIn', { s: nextIn }) : t('call.nextQuestion')} disabled={nextIn > 0} onPress={drawQuestion} />
            {canTranslate ? (
              <GlassButton label={translate ? t('call.hideTranslation') : t('call.showTranslation', { lang: t(`uiLangName.${uiLang}`) })} onPress={() => setTranslate((v) => !v)} />
            ) : null}
          </View>
        </View>

        {kind === 'random' ? (
          <View style={{ borderRadius: 12, padding: space.sm, borderWidth: 1, borderStyle: required ? 'dashed' : 'solid', borderColor: 'rgba(255,255,255,0.5)', backgroundColor: required ? 'transparent' : 'rgba(255,255,255,0.95)' }}>
            <Text style={{ color: required ? '#fff' : '#111', fontSize: 12, textAlign: 'center', fontWeight: required ? '400' : '700' }}>
              {required ? t('call.unlockPending') : t('call.unlockDone', { name: partner.name })}
            </Text>
          </View>
        ) : null}

        {audioBlocked ? (
          <Nudge text={t('call.audioBlocked')} actions={[{ label: t('call.audioOn'), onPress: () => void room.current?.startAudio() }]} />
        ) : null}

        {nudge ? (
          <Nudge text={nudge === 'example' ? t('call.silenceExample', { example: EXAMPLE_QUESTIONS[lang] ?? '' }) : t('call.silenceTopic')}
            actions={nudge === 'topic' ? [{ label: t('call.nextQuestion'), onPress: drawQuestion }] : []} />
        ) : null}

        {__DEV__ ? (
          <View style={{ flexDirection: 'row', gap: space.sm, justifyContent: 'center' }}>
            <GlassButton label={devSpeed > 1 ? '1×' : t('call.devSpeed')} onPress={() => setDevSpeed((s) => (s > 1 ? 1 : 30))} />
            <GlassButton label={devSilent ? 'talk' : 'silence'} onPress={() => setDevSilent((s) => !s)} />
          </View>
        ) : null}

        <View style={{ marginTop: 'auto', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: space.lg }}>
          <RoundButton icon="flag-outline" label={t('call.report')} onPress={() => setSheet('report')} />
          <RoundButton icon="chatbox-ellipses-outline" label={t('call.help')} onPress={() => setSheet('help')} />
          <RoundButton icon={muted ? 'mic-off' : 'mic-outline'} label={t('call.mute')} onPress={() => { const m = !muted; setMuted(m); void room.current?.setMuted(m); }} active={muted} />
          {!required && kind === 'random' ? (
            <Pressable accessibilityRole="button" onPress={() => end('hangup')} style={{ backgroundColor: '#fff', borderRadius: 99, paddingHorizontal: 18, height: 50, justifyContent: 'center' }}>
              <Text style={{ color: '#111', fontWeight: '700' }}>{t('call.nextPerson')}</Text>
            </Pressable>
          ) : null}
          <RoundButton icon="call" label={t('call.hangup')} danger onPress={() => (required ? setSheet('leave') : end('hangup'))} />
        </View>
      </View>

      <Sheet visible={sheet === 'leave'} onClose={() => setSheet(null)}>
        <Title>{t('call.leaveTitle')}</Title>
        <Body muted>{t('call.leaveBody', { time: formatClock(REQUIRED_SECONDS - elapsed) })}</Body>
        <Body>• {t('call.leavePenalty')}{'\n'}• {t('call.leaveCooldown')}{'\n'}• {t('call.leaveProfile')}</Body>
        <Body small muted>{t('call.leaveSafety')}</Body>
        <Button variant="primary" label={t('call.backToCall')} onPress={() => setSheet(null)} />
        <Button label={t('call.reportAndLeave')} onPress={() => setSheet('report')} />
        <Button variant="danger" label={t('call.leaveAnyway')} onPress={() => end('hangup')} />
      </Sheet>

      <Sheet visible={sheet === 'report'} onClose={() => setSheet(null)}>
        <Title>{t('call.reportTitle', { name: partner.name })}</Title>
        <Body muted>{t('call.reportBody')}</Body>
        <View accessibilityRole="radiogroup" style={{ gap: 6 }}>
          {REASONS.map((r) => (
            <Pressable key={r} accessibilityRole="radio" accessibilityState={{ checked: reason === r }} onPress={() => setReason(r)}
              style={{ borderRadius: 10, padding: 10, borderWidth: 1.5, borderColor: reason === r ? c.bad : c.surface2, backgroundColor: c.surface2 }}>
              <Text style={{ color: c.ink }}>{t(`call.reasons.${r}`)}</Text>
            </Pressable>
          ))}
        </View>
        <Body small muted>{t('call.reportNote')}</Body>
        <Button variant="danger" label={t('call.sendReport')} disabled={!reason} onPress={() => end('report')} />
        <Button label={t('call.backToCall')} onPress={() => setSheet(null)} />
      </Sheet>

      <Sheet visible={sheet === 'help'} onClose={() => setSheet(null)}>
        <Title>{t('call.helpTitle')}</Title>
        <Body small muted>{t('call.helpBody')}</Body>
        {(HELP_PHRASES[lang] ?? []).map((p) => (
          <Card key={p} style={{ backgroundColor: c.surface2 }}><Text style={{ color: c.ink, fontSize: 16 }}>{p}</Text></Card>
        ))}
        <Button label={t('call.backToCall')} onPress={() => setSheet(null)} />
      </Sheet>
    </SafeAreaView>
  );
}

function Pill({ text }: { text: string }) {
  return <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3, overflow: 'hidden' }}>{text}</Text>;
}

function GlassButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}
      style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 6, opacity: disabled ? 0.5 : 1 }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

function OptionChip({ label }: { label: string }) {
  return <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 3, overflow: 'hidden' }}>{label}</Text>;
}

function Nudge({ text, actions = [] }: { text: string; actions?: { label: string; onPress: () => void }[] }) {
  return (
    <View accessibilityLiveRegion="polite" style={{ backgroundColor: '#FFD166', borderRadius: 14, padding: space.sm, paddingRight: space.md, flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
      <Pip pose="think" size={40} motion="none" />
      <Text style={{ color: '#3a2a00', fontWeight: '700', fontSize: 12, flex: 1 }}>{text}</Text>
      {actions.map((a) => (
        <Pressable key={a.label} accessibilityRole="button" onPress={a.onPress} style={{ backgroundColor: '#3a2a00', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ color: '#FFD166', fontWeight: '700', fontSize: 11 }}>{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function RoundButton({ icon, label, onPress, danger, active }: {
  icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void; danger?: boolean; active?: boolean;
}) {
  const size = danger ? 62 : 52;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: !!active }} onPress={onPress}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: danger ? '#E5483A' : active ? '#fff' : 'rgba(255,255,255,0.18)' }}>
      <Ionicons name={icon} size={22} color={active ? '#111' : '#fff'} style={danger ? { transform: [{ rotate: '135deg' }] } : undefined} />
    </Pressable>
  );
}

/** Stand-in when a matched person's profile cannot be loaded (e.g. deleted meanwhile). */
function unknownPartner(id: string): Partner {
  return { id, name: '—', country: '', color: '#8A8FA3', calls: 0, bio: '', hours: null, utcOffset: 0, native: 'en', learn: 'en', level: 1, status: 'online', languageOnly: false, hobbies: [] };
}
