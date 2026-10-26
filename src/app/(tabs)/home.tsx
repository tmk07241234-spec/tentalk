import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/Avatar';
import { LevelBars } from '@/components/level';
import { Pip, type PipPose } from '@/components/Pip';
import { GoalBar, SpeechBubble, WeekDots } from '@/components/progress';
import { Body, Card, Eyebrow, Screen, Segmented, Title } from '@/components/ui';
import type { Mode } from '@/domain/matching';
import { WEEKLY_GOAL, currentStreak, homeMood, weekDays, weekSummary, type MascotMood } from '@/domain/progress';
import { matchmaking } from '@/services/matchmaking';
import { useActiveLearning, useApp } from '@/state/store';
import { CALL_BG, radius, space, useColors } from '@/theme/colors';

/** Rough online counts per mode until the server reports real numbers. */
const SAMPLE_ONLINE: Record<Mode, { count: number; wait: number }> = { buddy: { count: 2140, wait: 5 }, exchange: { count: 58, wait: 20 } };

const MOOD_POSE: Record<MascotMood, PipPose> = { welcome: 'wave', done_today: 'happy', keep_streak: 'wave', goal_met: 'cheer', invite: 'think' };

export default function Home() {
  const { t } = useTranslation();
  const c = useColors();
  const { profile, mode, setMode, setActiveLearn, settings, blocked, callLog } = useApp();
  const active = useActiveLearning();
  if (!profile || !active) return null;

  const learn = t(`lang.${active.lang}`);
  const native = t(`lang.${profile.native}`);
  const buddy = mode === 'buddy';
  const today = new Date();
  const mood = homeMood(callLog, today);
  const streak = currentStreak(callLog, today);
  const week = weekSummary(callLog, today);
  const suggestions = matchmaking.onlineSuggestions(
    { native: profile.native, learn: active.lang },
    { mode, myLevel: active.level, languageOnlyPartners: settings.languageOnlyPartners, matchLevel: false, blocked: new Set(blocked) },
  );

  return (
    <Screen>
      <Title>{t('home.hello', { name: profile.name })}</Title>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <Pip pose={MOOD_POSE[mood]} tone={buddy ? 'buddy' : 'learn'} size={76} />
        <SpeechBubble text={t(`pip.${mood}`, { n: streak })} />
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

      <Pressable accessibilityRole="button" accessibilityLabel={t('home.startNow')} onPress={() => router.push({ pathname: '/call', params: { kind: 'random' } })}
        style={({ pressed }) => ({ backgroundColor: buddy ? CALL_BG.buddy : CALL_BG.learn, borderRadius: radius.xl, padding: space.lg, gap: 4, transform: [{ scale: pressed ? 0.99 : 1 }] })}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, paddingHorizontal: 8, overflow: 'hidden' }}>{t('home.random')}</Text>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', opacity: 0.9 }}>
            {t('home.online', { people: SAMPLE_ONLINE[mode].count.toLocaleString(), seconds: SAMPLE_ONLINE[mode].wait })}
          </Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 21, fontWeight: '700', marginTop: 4 }}>{t('home.startNow')}</Text>
        <Text style={{ color: '#fff', fontSize: 12, opacity: 0.92 }}>{buddy ? t('home.buddyWho', { lang: learn }) : t('home.exchangeWho', { learn, native })}</Text>
        <View style={{ marginTop: space.md, backgroundColor: '#fff', borderRadius: radius.md, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: space.sm }}>
          <Ionicons name="call" size={18} color="#14204F" />
          <Text style={{ color: '#14204F', fontWeight: '700', fontSize: 15 }}>{t('home.cta')}</Text>
        </View>
      </Pressable>

      {!profile.complete ? (
        <Card>
          <Body small muted>{t('home.nudge')}</Body>
        </Card>
      ) : null}

      <Card style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Eyebrow>{t('progress.thisWeek')}</Eyebrow>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: streak ? c.nativeSoft : c.surface2, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 }}>
            <Ionicons name="flame" size={14} color={streak ? c.native : c.muted} />
            <Text style={{ color: streak ? c.native : c.muted, fontWeight: '700', fontSize: 12 }}>{t('progress.streak', { n: streak })}</Text>
          </View>
        </View>
        <WeekDots days={weekDays(callLog, today)} />
        <GoalBar value={week.completedCalls} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Body small muted>{t('progress.goal', { done: Math.min(week.completedCalls, WEEKLY_GOAL), goal: WEEKLY_GOAL })}</Body>
          <Body small muted>{t('progress.minutes', { n: week.minutes })}</Body>
        </View>
      </Card>

      <Card>
        <Eyebrow>{t('home.theme')}</Eyebrow>
        <Text style={{ color: c.ink, fontWeight: '700' }}>{t('home.themeTitle')}</Text>
        <Body small muted>{t('home.themeSub')}</Body>
      </Card>

      <Eyebrow>{buddy ? t('home.suggestedBuddy') : t('home.suggestedExchange')}</Eyebrow>
      {suggestions.length === 0 ? <Body small muted>{t('home.noOnline')}</Body> : null}
      {suggestions.map((p) => (
        <Card key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <Avatar name={p.name} color={p.color} online />
          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={{ color: c.ink, fontWeight: '700' }}>{p.name}</Text>
              {p.languageOnly ? <Text style={{ fontSize: 11, color: c.muted, backgroundColor: c.surface2, borderRadius: 99, paddingHorizontal: 7, overflow: 'hidden' }}>{t('person.languageOnly')}</Text> : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Body small muted>{t('person.native', { lang: t(`lang.${p.native}`) })} · {t(`lang.${p.learn}`)}</Body>
              <LevelBars level={p.level} />
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}
