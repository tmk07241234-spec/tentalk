import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/Avatar';
import { LevelBars, LevelPicker } from '@/components/level';
import { SmallChips } from '@/components/people';
import { VoiceRecorder } from '@/components/voice';
import { Sheet } from '@/components/Sheet';
import { Body, Button, ChoiceChips, ErrorText, Eyebrow, Field, Screen, Title } from '@/components/ui';
import { MAX_LEARNING_LANGS, SELECTABLE_LANGS, type Lang } from '@/domain/languages';
import type { Level } from '@/domain/levels';
import { HOBBIES, MAX_BIO, MAX_NAME, validateProfile } from '@/domain/profile';
import { deviceOffset, formatHM, type HoursRange } from '@/domain/schedule';
import { useApp, type FrameId, type LearningLang, type VoiceIntro } from '@/state/store';
import { AVATAR_COLORS, radius, space, useColors } from '@/theme/colors';

const HOUR_OPTIONS = Array.from({ length: 48 }, (_, i) => formatHM(i * 30)).concat('24:00');

export default function ProfileEdit() {
  const { t } = useTranslation();
  const c = useColors();
  const { profile, updateProfile, setActiveLearn, plus } = useApp();
  const [name, setName] = useState(profile?.name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [color, setColor] = useState(profile?.color ?? AVATAR_COLORS[1]);
  const [photoUri, setPhotoUri] = useState<string | null>(profile?.photoUri ?? null);
  const [native, setNative] = useState<Lang>(profile?.native ?? 'ja');
  const [learning, setLearning] = useState<LearningLang[]>(profile?.learning ?? []);
  const [hobbies, setHobbies] = useState<string[]>(profile?.hobbies ?? []);
  const [hours, setHours] = useState<HoursRange>(profile?.hours ?? { start: '21:00', end: '23:00' });
  const [voice, setVoice] = useState<VoiceIntro | null>(profile?.voice ?? null);
  const [frame, setFrame] = useState<FrameId | null>(profile?.frame ?? null);
  const [levelFor, setLevelFor] = useState<number | null>(null);
  const [picking, setPicking] = useState<null | 'start' | 'end'>(null);
  const [error, setError] = useState('');
  if (!profile) return null;

  const langOptions = SELECTABLE_LANGS.map((l) => ({ key: l, label: t(`lang.${l}`) }));
  const setLearnAt = (i: number, patch: Partial<LearningLang>) => setLearning((ls) => ls.map((l, k) => (k === i ? { ...l, ...patch } : l)));

  const pickPhoto = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!r.canceled) setPhotoUri(r.assets[0].uri);
  };

  const save = () => {
    const err = validateProfile({ name, bio, native, learning, hobbies, hours });
    if (err) return setError(t(`profileEdit.errors.${err}`));
    updateProfile({ name: name.trim(), bio: bio.trim(), color, photoUri, native, learning, hobbies, hours, voice, frame: plus ? frame : null, utcOffset: deviceOffset() });
    if (!learning.some((l) => l.lang === profile.activeLearn)) setActiveLearn(learning[0].lang);
    router.back();
  };

  return (
    <Screen footer={<><Button variant="primary" label={t('profileEdit.save')} onPress={save} /><Button label={t('common.cancel')} onPress={() => router.back()} /></>}>
      <Title>{t('profileEdit.title')}</Title>

      <Eyebrow>{t('profileEdit.icon')}</Eyebrow>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
        <Avatar name={name || '?'} color={color} photoUri={photoUri} size={72} frame={plus ? frame : null} />
        <View style={{ flex: 1, gap: space.sm }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {AVATAR_COLORS.map((col) => (
              <Pressable key={col} accessibilityRole="radio" accessibilityLabel={col} accessibilityState={{ checked: !photoUri && col === color }}
                onPress={() => { setColor(col); setPhotoUri(null); }}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: col, borderWidth: 2, borderColor: !photoUri && col === color ? c.ink : 'transparent' }} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Button small label={t('profileSetup.photo')} onPress={pickPhoto} />
            {photoUri ? <Button small variant="ghost" label={t('profileSetup.removePhoto')} onPress={() => setPhotoUri(null)} /> : null}
          </View>
        </View>
      </View>

      <Eyebrow>{t('frames.title')}</Eyebrow>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
        {([null, 'gold', 'sakura', 'wave'] as (FrameId | null)[]).map((f) => {
          const on = (plus ? frame : null) === f;
          return (
            <Pressable key={f ?? 'none'} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={t(`frames.${f ?? 'none'}`)}
              onPress={() => (f && !plus ? router.push('/plus') : setFrame(f))}
              style={{ alignItems: 'center', gap: 4, padding: 6, borderRadius: radius.md, borderWidth: 1.5, borderColor: on ? c.learn : 'transparent' }}>
              <Avatar name={name || '?'} color={color} photoUri={photoUri} size={44} frame={f} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                {f && !plus ? <Ionicons name="lock-closed" size={10} color={c.muted} /> : null}
                <Text style={{ fontSize: 11, color: c.muted }}>{t(`frames.${f ?? 'none'}`)}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {!plus ? <Body small muted>{t('frames.locked')}</Body> : null}

      <Field label={t('profileEdit.name')} value={name} onChangeText={setName} maxLength={MAX_NAME} />
      <Field label={`${t('profileEdit.bio')} (${bio.length}/${MAX_BIO})`} value={bio} onChangeText={setBio} maxLength={MAX_BIO} multiline
        placeholder={t('profileEdit.bioPlaceholder')} style={{ minHeight: 80, textAlignVertical: 'top' }} />

      <ChoiceChips<Lang> label={t('profileEdit.native')} options={langOptions} value={native} onChange={setNative} />

      <Eyebrow>{t('profileEdit.learning')}</Eyebrow>
      {learning.map((l, i) => (
        <View key={i} style={{ gap: space.sm, backgroundColor: c.surface, borderRadius: radius.md, padding: space.md }}>
          <ChoiceChips<Lang> label={`${i + 1}`} options={langOptions} value={l.lang} onChange={(lang) => setLearnAt(i, { lang })} />
          <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
            <Pressable accessibilityRole="button" onPress={() => setLevelFor(i)}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: c.line, borderRadius: radius.sm, padding: 10 }}>
              <LevelBars level={l.level} />
              <Text style={{ color: c.ink, fontWeight: '700' }}>{t(`levels.${l.level}.name`)}</Text>
            </Pressable>
            {learning.length > 1 ? <Button small variant="ghost" label={t('profileEdit.remove')} onPress={() => setLearning((ls) => ls.filter((_, k) => k !== i))} /> : null}
          </View>
        </View>
      ))}
      {learning.length < MAX_LEARNING_LANGS ? (
        <Button small variant="ghost" label={t('profileEdit.addLanguage')}
          onPress={() => setLearning((ls) => [...ls, { lang: SELECTABLE_LANGS.find((x) => x !== native && !ls.some((l) => l.lang === x)) ?? 'en', level: 1 }])} />
      ) : null}
      <Body small muted>{t('profileEdit.levelHelp')}</Body>

      <Eyebrow>{t('profileEdit.hobbies')}</Eyebrow>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {HOBBIES.map((h) => {
          const on = hobbies.includes(h);
          return (
            <Pressable key={h} accessibilityRole="checkbox" accessibilityState={{ checked: on }}
              onPress={() => setHobbies((hs) => (on ? hs.filter((x) => x !== h) : [...hs, h]))}
              style={{ borderRadius: 99, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderColor: on ? c.ok : c.line, backgroundColor: on ? c.okSoft : c.surface }}>
              <Text style={{ color: on ? c.ok : c.ink, fontWeight: on ? '700' : '400', fontSize: 13 }}>{t(`hobbies.${h}`)}</Text>
            </Pressable>
          );
        })}
      </View>

      <Eyebrow>{t('profileEdit.hours')}</Eyebrow>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <View style={{ flex: 1 }}><Button label={`${t('profileEdit.from')} ${hours.start}`} onPress={() => setPicking('start')} /></View>
        <View style={{ flex: 1 }}><Button label={`${t('profileEdit.to')} ${hours.end}`} onPress={() => setPicking('end')} /></View>
      </View>
      <Body small muted>{t('profileEdit.hoursNote')}</Body>

      <Eyebrow>{t('profileEdit.voice')}</Eyebrow>
      <VoiceRecorder value={voice} onChange={setVoice} />

      <ErrorText>{error}</ErrorText>

      <Sheet visible={levelFor !== null} onClose={() => setLevelFor(null)}>
        {levelFor !== null && learning[levelFor] ? (
          <>
            <Title>{t('level.title', { lang: t(`lang.${learning[levelFor].lang}`) })}</Title>
            <LevelPicker value={learning[levelFor].level} onChange={(lv: Level) => { setLearnAt(levelFor, { level: lv }); setLevelFor(null); }} />
          </>
        ) : null}
      </Sheet>

      <Sheet visible={picking !== null} onClose={() => setPicking(null)}>
        <Title>{picking === 'start' ? t('profileEdit.from') : t('profileEdit.to')}</Title>
        <SmallChips label={t('profileEdit.hours')} value={picking === 'start' ? hours.start : hours.end}
          onChange={(v) => { setHours((h) => (picking === 'start' ? { ...h, start: v } : { ...h, end: v })); setPicking(null); }}
          options={HOUR_OPTIONS.filter((x) => (picking === 'start' ? x !== '24:00' : x !== '00:00')).map((x) => ({ key: x, label: x }))} />
      </Sheet>
    </Screen>
  );
}
