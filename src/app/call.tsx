import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Pip } from '@/components/Pip';
import { Badge, Confetti, SpeechBubble } from '@/components/progress';
import { Sheet } from '@/components/Sheet';
import { Body, Button, Card, Title } from '@/components/ui';
import { ENDONYM, EXAMPLE_QUESTIONS, HELP_PHRASES, TOPICS } from '@/data/conversation';
import type { Partner } from '@/data/samplePartners';
import {
  REQUIRED_SECONDS, SWITCH_CUE_SECONDS, callOutcome, formatClock, silenceNudge, type CallOutcome, type EndReason,
} from '@/domain/callRules';
import type { Lang } from '@/domain/languages';
import { calledToday, currentStreak, dayKey, newBadges, type BadgeId } from '@/domain/progress';
import { matchmaking } from '@/services/matchmaking';
import { useActiveLearning, useApp } from '@/state/store';
import { CALL_BG, space, useColors } from '@/theme/colors';

type Phase = 'searching' | 'none' | 'connected' | 'result';
const REASONS = ['romance', 'sexual', 'abuse', 'spam', 'minor', 'trolling', 'other'] as const;

/**
 * Random call: search → 10 required minutes → open-ended extension → result.
 * Audio is not connected yet; the call service will plug in where noted.
 */
export default function Call() {
  const { t } = useTranslation();
  const c = useColors();
  const app = useApp();
  const active = useActiveLearning();
  const profile = app.profile!;

  const [phase, setPhase] = useState<Phase>('searching');
  const [partner, setPartner] = useState<Partner | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [silence, setSilence] = useState(0);
  const [lang, setLang] = useState<Lang>(active?.lang ?? 'en');
  const [topicIndex, setTopicIndex] = useState(0);
  const [cueDone, setCueDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [sheet, setSheet] = useState<null | 'leave' | 'report' | 'help'>(null);
  const [reason, setReason] = useState<(typeof REASONS)[number] | null>(null);
  const [outcome, setOutcome] = useState<(CallOutcome & { reason: EndReason; badges: BadgeId[]; streakUp: number }) | null>(null);
  const [devSpeed, setDevSpeed] = useState(1);
  const [devSilent, setDevSilent] = useState(false);
  const autoTopicDone = useRef(false);

  const me = { native: profile.native, learn: active?.lang ?? 'en' };
  const mode = app.mode;
  const buddy = mode === 'buddy';

  // Search for a partner whenever we enter the searching phase.
  useEffect(() => {
    if (phase !== 'searching') return;
    const ctrl = new AbortController();
    matchmaking
      .findPartner(me, { mode, myLevel: active?.level ?? 3, languageOnlyPartners: app.settings.languageOnlyPartners, matchLevel: app.settings.matchLevel, blocked: new Set(app.blocked) }, ctrl.signal)
      .then((p) => {
        if (!p) return setPhase('none');
        setPartner(p);
        setElapsed(0); setSilence(0); setCueDone(false); setTopicIndex(0); setLang(me.learn);
        setPhase('connected');
        // TODO(call service): join the audio room for this match here.
      })
      .catch(() => {});
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Call clock. Silence comes from on-device voice activity detection later; a dev toggle stands in for now.
  useEffect(() => {
    if (phase !== 'connected') return;
    const id = setInterval(() => {
      setElapsed((e) => e + 0.25 * devSpeed);
      setSilence((s) => (devSilent ? s + 0.25 * devSpeed : 0));
    }, 250);
    return () => clearInterval(id);
  }, [phase, devSpeed, devSilent]);

  const topics = TOPICS[lang] ?? TOPICS.en!;
  const nudge = silenceNudge(silence);
  // When silence first reaches 30 s, move to a new topic once.
  useEffect(() => {
    if (nudge && !autoTopicDone.current) {
      autoTopicDone.current = true;
      setTopicIndex((i) => i + 1);
    }
    if (!nudge) autoTopicDone.current = false;
  }, [nudge]);

  const end = (r: EndReason) => {
    const o = callOutcome({ elapsedSeconds: elapsed, reason: r, kind: 'random', todayGain: app.todayGain });
    const before = app.callLog;
    const after = [...before, { date: dayKey(new Date()), minutes: Math.round(elapsed / 60), completed: o.completedRequired }];
    // The streak only goes up on the first completed call of the day.
    const streakUp = o.completedRequired && !calledToday(before, new Date()) ? currentStreak(after, new Date()) : 0;
    app.applyCallResult({ trustDelta: o.trustDelta, todayGain: o.todayGain, minutes: Math.round(elapsed / 60), completed: o.completedRequired });
    if (r === 'report' && partner) app.block(partner.id);
    // TODO(call service): leave the audio room; send the report with the reason to the server.
    setOutcome({ ...o, reason: r, badges: newBadges(before, after), streakUp });
    setSheet(null);
    setPhase('result');
  };

  const otherLang: Lang = lang === me.learn ? profile.native : me.learn;
  const bg = buddy ? CALL_BG.buddy : lang === me.learn ? CALL_BG.learn : CALL_BG.native;
  const required = elapsed < REQUIRED_SECONDS;

  if (phase === 'searching' || phase === 'none') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
        {phase === 'searching' ? (
          <>
            <View style={{ alignItems: 'center' }}><Pip pose="listen" tone={buddy ? 'buddy' : 'learn'} size={130} motion="bounce" /></View>
            <Title>{t('call.searching')}</Title>
            <Body>{t('pip.searching')}</Body>
            <Body muted>{buddy ? t('call.condBuddy', { lang: t(`lang.${me.learn}`), native: t(`lang.${me.native}`) }) : t('call.condExchange', { learn: t(`lang.${me.learn}`), native: t(`lang.${me.native}`) })}</Body>
          </>
        ) : (
          <>
            <View style={{ alignItems: 'center' }}><Pip pose="sleepy" tone={buddy ? 'buddy' : 'learn'} size={130} /></View>
            <Title>{t('call.noPartner')}</Title>
            <Body muted>{t('call.noPartnerBody')}</Body>
            <Button variant="primary" label={t('call.retry')} onPress={() => setPhase('searching')} />
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
                <Button small variant={following ? 'secondary' : 'primary'} label={following ? t('call.following') : t('call.follow')} onPress={() => app.follow(partner.id)} />
              </View>
              <Body small muted>{t('call.followLater')}</Body>
            </Card>
          ) : outcome.reason !== 'report' ? <Body small muted>{t('call.notUnlocked')}</Body> : null}
          {outcome.reason !== 'hangup' || outcome.trustDelta >= 0 ? (
            <Button variant="primary" label={t('call.talkAgain')} onPress={() => setPhase('searching')} />
          ) : null}
          <Button label={t('call.home')} onPress={() => router.back()} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!partner) return null;
  const topic = topics[topicIndex % topics.length];
  const showCue = !buddy && app.settings.switchCue && !cueDone && elapsed >= SWITCH_CUE_SECONDS && required && !nudge;

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
          {buddy ? (
            <Text style={{ color: '#fff', fontSize: 13 }}>{t('call.onlyLang', { lang: t(`lang.${lang}`) })}</Text>
          ) : (
            <>
              <Text style={{ color: '#fff', fontSize: 13 }}>{t('call.current', { lang: ENDONYM[lang] ?? t(`lang.${lang}`) })}</Text>
              <GlassButton label={t('call.switchTo', { lang: ENDONYM[otherLang] ?? t(`lang.${otherLang}`) })} onPress={() => { setLang(otherLang); setCueDone(true); setTopicIndex(0); }} />
            </>
          )}
        </View>

        <View style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: space.md, gap: 4 }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700' }}>{t('call.topic')}</Text>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{topic.q}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{topic.hint}</Text>
          <View style={{ alignSelf: 'flex-start', marginTop: 6 }}><GlassButton label={t('call.nextTopic')} onPress={() => setTopicIndex((i) => i + 1)} /></View>
        </View>

        <View style={{ borderRadius: 12, padding: space.sm, borderWidth: 1, borderStyle: required ? 'dashed' : 'solid', borderColor: 'rgba(255,255,255,0.5)', backgroundColor: required ? 'transparent' : 'rgba(255,255,255,0.95)' }}>
          <Text style={{ color: required ? '#fff' : '#111', fontSize: 12, textAlign: 'center', fontWeight: required ? '400' : '700' }}>
            {required ? t('call.unlockPending') : t('call.unlockDone', { name: partner.name })}
          </Text>
        </View>

        {nudge ? (
          <Nudge text={nudge === 'example' ? t('call.silenceExample', { example: EXAMPLE_QUESTIONS[lang] ?? '' }) : t('call.silenceTopic')} />
        ) : showCue ? (
          <Nudge text={t('call.cue', { lang: t(`lang.${otherLang}`) })}
            actions={[{ label: t('call.cueSwitch'), onPress: () => { setLang(otherLang); setCueDone(true); setTopicIndex(0); } }, { label: t('call.cueKeep'), onPress: () => setCueDone(true) }]} />
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
          <RoundButton icon={muted ? 'mic-off' : 'mic-outline'} label={t('call.mute')} onPress={() => setMuted((m) => !m)} active={muted} />
          {!required ? (
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

function GlassButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 6 }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
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
