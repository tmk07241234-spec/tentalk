import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/Avatar';
import { LevelBars } from '@/components/level';
import { Pip, type PipPose } from '@/components/Pip';
import { PersonRow, useNow } from '@/components/people';
import { GoalBar, SpeechBubble, WeekDots } from '@/components/progress';
import { Body, Card, Eyebrow, RefreshButton, Screen, Segmented, Title } from '@/components/ui';
import type { Mode } from '@/domain/matching';
import { WEEKLY_GOAL, currentStreak, homeMood, weekDays, weekSummary, type MascotMood } from '@/domain/progress';
import { matchmaking } from '@/services/matchmaking';
import { usePeoplePool } from '@/services/people';
import { useStats } from '@/services/stats';
import { isEligible } from '@/domain/matching';
import type { Partner } from '@/data/samplePartners';
import { useActiveLearning, useApp } from '@/state/store';
import { CALL_BG, radius, space, useColors } from '@/theme/colors';

/** Morning before 11, afternoon until 17, evening otherwise (device time). */
const greeting = (hour: number) => (hour >= 5 && hour < 11 ? 'morning' : hour >= 11 && hour < 17 ? 'afternoon' : 'evening');

/** A small row of overlapping faces. */
function FaceStack({ people, size, ring }: { people: Partner[]; size: number; ring: string }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {people.map((p, i) => (
        <View key={p.id} style={{ marginLeft: i ? -size * 0.28 : 0, borderRadius: size, borderWidth: 2, borderColor: ring }}>
          <Avatar name={p.name} color={p.color} avatar={p.avatar} photoUri={p.photoUri} size={size} />
        </View>
      ))}
    </View>
  );
}

const MOOD_POSE: Record<MascotMood, PipPose> = { welcome: 'wave', done_today: 'happy', keep_streak: 'wave', goal_met: 'cheer', invite: 'think' };

export default function Home() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const { profile, mode, setMode, setActiveLearn, blocked, callLog, following, randomPausedUntil, suspendedUntil } = useApp();
  const myStats = useStats(useApp((st) => st.account?.uid));
  const now = useNow(15_000);
  const active = useActiveLearning();
  const uid = useApp((s) => s.account?.uid);
  const { pool, refreshing, refresh } = usePeoplePool({ uid, native: profile?.native ?? 'en', learn: active?.lang ?? 'en' });
  if (!profile || !active) return null;

  const learn = t(`lang.${active.lang}`);
  const native = t(`lang.${profile.native}`);
  const buddy = mode === 'buddy';
  const today = new Date();
  const mood = homeMood(callLog, today);
  const streak = currentStreak(callLog, today);
  const week = weekSummary(callLog, today);
  const suspended = suspendedUntil > now;
  // Quick-match pauses come from the server since 1.1 (longer for repeated early leaves); the local one is a fallback.
  const pauseEnd = Math.max(randomPausedUntil, myStats?.pausedUntil ?? 0);
  const paused = pauseEnd > now || suspended;
  const pausedMinutes = Math.max(1, Math.ceil((pauseEnd - now) / 60_000));
  const learner = { native: profile.native, learn: active.lang };
  const prefs = { mode, myLevel: active.level, languageOnlyPartners: false, matchLevel: false, blocked: new Set(blocked) };
  // Real people who are online now; the sample people for accounts without sign-in.
  const suggestions = uid ? pool.filter((p) => isEligible(learner, p, prefs)) : matchmaking.onlineSuggestions(learner, prefs);
  // Only real presence: people in this mode who are online right now.
  const online = suggestions.filter((p) => p.status === 'online');
  const checklist = [
    { key: 'bio', done: profile.bio.trim().length > 0, icon: 'create-outline' },
    { key: 'voice', done: !!profile.voice, icon: 'mic-outline' },
    { key: 'hobbies', done: profile.hobbies.length > 0, icon: 'heart-outline' },
    { key: 'hours', done: !!profile.hours, icon: 'time-outline' },
  ] as const;
  const checked = checklist.filter((x) => x.done).length;
  const pipLine = (mood === 'invite' || mood === 'keep_streak') && online.length > 0 ? t('pip.online', { n: online.length }) : t(`pip.${mood}`, { n: streak });

  return (
    <Screen refreshing={refreshing} onRefresh={uid ? refresh : undefined}>
      <Title>{t(`home.hello_${greeting(new Date(now).getHours())}`, { name: profile.name })}</Title>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <Pip pose={MOOD_POSE[mood]} tone={buddy ? 'buddy' : 'learn'} size={76} />
        <SpeechBubble text={pipLine} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
        <Body small muted>{t('home.learning')}</Body>
        {profile.learning.map((l) => {
          const on = l.lang === active.lang;
          return (
            <Pressable key={l.lang} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setActiveLearn(l.lang)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4,
                borderColor: on ? c.learn : c.line, backgroundColor: on ? c.learnSoft : c.surface }}>
              <Text style={{ color: on ? c.learn : c.ink, fontWeight: '700', fontSize: 12 }}>{t(`lang.${l.lang}`)}</Text>
              <LevelBars level={l.level} />
            </Pressable>
          );
        })}
      </View>

      <Segmented<Mode>
        value={mode}
        onChange={setMode}
        options={[
          { key: 'buddy', label: t('home.buddy'), sub: t('home.buddySub', { lang: learn }) },
          { key: 'exchange', label: t('home.exchange'), sub: t('home.exchangeSub', { learn, native }) },
        ]}
      />

      {paused ? (
        <Card style={{ backgroundColor: c.nativeSoft }}>
          <Body small>{suspended ? t('home.suspended', { date: new Date(suspendedUntil).toLocaleDateString(i18n.language) }) : t('home.paused', { m: pausedMinutes })}</Body>
        </Card>
      ) : null}
      <Pressable accessibilityRole="button" accessibilityLabel={t('home.startNow')} accessibilityState={{ disabled: paused }} disabled={paused}
        onPress={() => router.push({ pathname: '/call', params: { kind: 'random' } })}
        style={({ pressed }) => ({ backgroundColor: buddy ? CALL_BG.buddy : CALL_BG.learn, borderRadius: radius.xl, padding: space.lg, gap: 4, overflow: 'hidden', opacity: paused ? 0.45 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })}>
        <Svg width={200} height={120} viewBox="0 0 200 120" style={{ position: 'absolute', right: -24, top: -8, opacity: 0.14 }} pointerEvents="none">
          <Path d="M0 60 Q25 10 50 60 T100 60 T150 60 T200 60" stroke="#fff" strokeWidth={10} fill="none" />
          <Path d="M0 92 Q25 52 50 92 T100 92 T150 92 T200 92" stroke="#fff" strokeWidth={6} fill="none" />
        </Svg>
        <Text style={{ alignSelf: 'flex-start', color: '#fff', fontSize: 11, fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 1, overflow: 'hidden' }}>{t('home.random')}</Text>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 6 }}>{t('home.startNow')}</Text>
        <Text style={{ color: '#fff', fontSize: 12.5, opacity: 0.88 }}>{buddy ? t('home.buddyWho', { lang: learn }) : t('home.exchangeWho', { learn, native })}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.md, minHeight: 34 }}>
          {online.length ? <FaceStack people={online.slice(0, 4)} size={30} ring={buddy ? CALL_BG.buddy : CALL_BG.learn} /> : null}
          <Text style={{ color: '#fff', fontSize: 12.5, opacity: 0.92, flex: 1 }}>
            {online.length ? t('home.online', { n: online.length }) : t('home.onlineNone')}
          </Text>
        </View>
        <View style={{ marginTop: space.md, backgroundColor: c.sun, borderRadius: radius.md, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: space.sm }}>
          <Ionicons name="call" size={18} color={c.sunInk} />
          <Text style={{ color: c.sunInk, fontWeight: '800', fontSize: 16 }}>{t('home.cta')}</Text>
        </View>
      </Pressable>

      {online.length ? (
        <Pressable accessibilityRole="button" onPress={() => router.push('/find')}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: c.surface, borderRadius: radius.lg, padding: space.md, opacity: pressed ? 0.85 : 1 })}>
          <FaceStack people={online.slice(0, 5)} size={38} ring={c.surface} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ color: c.ink, fontWeight: '700', fontSize: 13 }}>{t('home.liveTitle')}</Text>
            <Text numberOfLines={1} style={{ color: c.muted, fontSize: 12 }}>
              {online.length > 2 ? t('home.liveMore', { names: online.slice(0, 2).map((p) => p.name).join(t('home.nameSep')), n: online.length - 2 }) : online.map((p) => p.name).join(t('home.nameSep'))}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={c.muted} />
        </Pressable>
      ) : null}

      <Card style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Eyebrow>{t('progress.thisWeek')}</Eyebrow>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.sunSoft, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 }}>
            <Ionicons name="flame" size={14} color={c.sunText} />
            <Text style={{ color: c.sunText, fontWeight: '700', fontSize: 12 }}>{streak ? t('progress.streak', { n: streak }) : t('progress.streakStart')}</Text>
          </View>
        </View>
        <WeekDots days={weekDays(callLog, today)} />
        <GoalBar value={week.completedCalls} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Body small muted>{week.completedCalls >= WEEKLY_GOAL ? t('progress.goalMet') : t('progress.goalLeft', { n: WEEKLY_GOAL - week.completedCalls })}</Body>
          <Body small muted>{t('progress.minutes', { n: week.minutes })}</Body>
        </View>
      </Card>

      {checked < checklist.length ? (
        <Card style={{ gap: space.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Eyebrow>{t('home.checklistTitle')}</Eyebrow>
            <Text style={{ color: c.coral, fontWeight: '700', fontSize: 12 }}>{checked} / {checklist.length}</Text>
          </View>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: c.surface2, overflow: 'hidden' }}>
            <View style={{ width: `${(checked / checklist.length) * 100}%`, height: 6, borderRadius: 3, backgroundColor: c.coral }} />
          </View>
          {checklist.map((x) => (
            <Pressable key={x.key} accessibilityRole="button" accessibilityState={{ checked: x.done }} disabled={x.done} onPress={() => router.push('/profile-edit')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 4 }}>
              <View style={{ width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: x.done ? c.okSoft : c.coralSoft }}>
                <Ionicons name={x.done ? 'checkmark' : x.icon} size={16} color={x.done ? c.ok : c.coral} />
              </View>
              <Text style={{ flex: 1, color: x.done ? c.muted : c.ink, fontSize: 14, textDecorationLine: x.done ? 'line-through' : 'none' }}>{t(`home.check.${x.key}`)}</Text>
              {x.done ? null : <Ionicons name="chevron-forward" size={16} color={c.muted} />}
            </Pressable>
          ))}
        </Card>
      ) : null}

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
        <View style={{ width: 54, height: 54, borderRadius: 16, backgroundColor: c.sun, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="film-outline" size={26} color={c.sunInk} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Eyebrow>{t('home.theme')}</Eyebrow>
          <Text style={{ color: c.ink, fontWeight: '800', fontSize: 17 }}>{t('home.themeTitle')}</Text>
          <Body small muted>{t('home.themeSub')}</Body>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Eyebrow>{buddy ? t('home.suggestedBuddy') : t('home.suggestedExchange')}</Eyebrow>
        {uid ? <RefreshButton onPress={refresh} refreshing={refreshing} label={t('common.refresh')} /> : null}
      </View>
      {suggestions.length === 0 ? <Body small muted>{t('home.noOnline')}</Body> : null}
      {suggestions.filter((p) => !following.includes(p.id)).map((p) => <PersonRow key={p.id} person={p} />)}
    </Screen>
  );
}
