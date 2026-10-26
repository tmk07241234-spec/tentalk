import { useEffect, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/Avatar';
import { LevelBars } from '@/components/level';
import type { Partner } from '@/data/samplePartners';
import { commonHobbies } from '@/domain/discovery';
import { relation } from '@/domain/matching';
import { deviceOffset, shiftRange } from '@/domain/schedule';
import { useApp } from '@/state/store';
import { radius, space, useColors } from '@/theme/colors';

export function Pill({ label, tone = 'muted' }: { label: string; tone?: 'muted' | 'learn' | 'buddy' | 'ok' }) {
  const c = useColors();
  const map = { muted: [c.surface2, c.muted], learn: [c.learnSoft, c.learn], buddy: [c.buddySoft, c.buddy], ok: [c.okSoft, c.ok] } as const;
  const [bg, fg] = map[tone];
  return <Text style={{ fontSize: 11, fontWeight: '700', color: fg, backgroundColor: bg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 1, overflow: 'hidden' }}>{label}</Text>;
}

/** The partner's available hours, converted to this device's local time. */
export function hoursForMe(p: Partner): string {
  const r = shiftRange(p.hours, p.utcOffset, deviceOffset());
  return `${r.start}–${r.end}`;
}

/** One person in a list (Find, Home). Opens their profile. */
export function PersonRow({ person }: { person: Partner }) {
  const { t } = useTranslation();
  const c = useColors();
  const profile = useApp((s) => s.profile);
  const following = useApp((s) => s.following.includes(person.id));
  if (!profile) return null;
  const rel = profile.learning.map((l) => relation({ native: profile.native, learn: l.lang }, person)).find(Boolean);
  const shared = commonHobbies(profile.hobbies, person.hobbies);
  const online = person.status === 'online';

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={person.name} onPress={() => router.push({ pathname: '/person/[id]', params: { id: person.id } })}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: c.surface, borderRadius: radius.lg, padding: space.md, opacity: pressed ? 0.85 : online ? 1 : 0.8 })}>
      <Avatar name={person.name} color={person.color} online={online} />
      <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Text style={{ color: c.ink, fontWeight: '700', fontSize: 15 }}>{person.name}</Text>
          {rel ? <Pill label={rel === 'buddy' ? t('home.buddy') : t('home.exchange')} tone={rel === 'buddy' ? 'buddy' : 'learn'} /> : null}
          {person.languageOnly ? <Pill label={t('person.languageOnly')} /> : null}
          {following ? <Pill label={t('profileView.following')} tone="ok" /> : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text numberOfLines={1} style={{ color: c.muted, fontSize: 12, flexShrink: 1 }}>
            {t(`country.${person.country}`)} · {t('person.native', { lang: t(`lang.${person.native}`) })} · {t(`lang.${person.learn}`)}
          </Text>
          <LevelBars level={person.level} />
        </View>
        <Text numberOfLines={1} style={{ color: online ? c.ok : c.muted, fontSize: 12, fontWeight: online ? '700' : '400' }}>
          {online ? t('person.online') : t('profileView.nextAvailable', { hours: hoursForMe(person) })}
          {shared.length ? <Text style={{ color: c.muted, fontWeight: '400' }}>{`  ·  ${shared.map((h) => t(`hobbies.${h}`)).join(', ')}`}</Text> : null}
        </Text>
      </View>
    </Pressable>
  );
}

export function SwitchRow({ label, note, value, onChange }: { label: string; note?: string; value: boolean; onChange: (v: boolean) => void }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: c.ink, fontSize: 14 }}>{label}</Text>
        {note ? <Text style={{ color: c.muted, fontSize: 12 }}>{note}</Text> : null}
      </View>
      <Switch accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{ true: c.ok, false: c.line }} />
    </View>
  );
}

/** Current time that refreshes every `intervalMs`, so render stays pure. */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** "5 min ago" style labels for notifications and history. */
export function useRelativeTime() {
  const { t } = useTranslation();
  return (at: number, now: number) => {
    const min = Math.floor((now - at) / 60000);
    if (min < 1) return t('notifications.justNow');
    if (min < 60) return t('notifications.minutes', { n: min });
    const h = Math.floor(min / 60);
    if (h < 24) return t('notifications.hours', { n: h });
    return t('notifications.days', { n: Math.floor(h / 24) });
  };
}

export function SmallChips<K extends string>({ options, value, onChange, label }: {
  options: { key: K; label: string; count?: number }[]; value: K; onChange: (k: K) => void; label: string;
}) {
  const c = useColors();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable key={o.key} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => onChange(o.key)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 99, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 5,
              borderColor: on ? c.ink : c.line, backgroundColor: on ? c.ink : c.surface }}>
            <Text style={{ color: on ? c.bg : c.ink, fontSize: 12, fontWeight: on ? '700' : '400' }}>{o.label}</Text>
            {o.count !== undefined ? <Text style={{ color: on ? c.bg : c.ok, fontSize: 12, fontWeight: '700' }}>{o.count}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
