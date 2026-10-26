import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus,
  useAudioRecorder, useAudioRecorderState,
} from 'expo-audio';
import { useTranslation } from 'react-i18next';

import { Body, Button, ErrorText } from '@/components/ui';
import { VOICE_MAX_SECONDS, VOICE_MIN_SECONDS } from '@/domain/profile';
import type { VoiceIntro } from '@/state/store';
import { radius, space, useColors } from '@/theme/colors';

/** Play / pause button with a progress bar and length. */
export function VoicePlayer({ voice, label }: { voice: VoiceIntro; label?: string }) {
  const { t } = useTranslation();
  const c = useColors();
  const player = useAudioPlayer(voice.uri);
  const status = useAudioPlayerStatus(player);
  const duration = status.duration || voice.seconds;
  const progress = duration ? Math.min(1, status.currentTime / duration) : 0;

  // Rewind at the end so the next tap plays from the start.
  useEffect(() => {
    if (status.didJustFinish) player.seekTo(0);
  }, [status.didJustFinish, player]);

  const toggle = () => {
    if (status.playing) player.pause();
    else player.play();
  };

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${label ?? t('voice.title')} ${status.playing ? t('voice.pause') : t('voice.play')}`} onPress={toggle}
      style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: c.surface2, borderRadius: radius.md, padding: space.sm }}>
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.learn, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={status.playing ? 'pause' : 'play'} size={18} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: c.line, overflow: 'hidden' }}>
        <View style={{ width: `${progress * 100}%`, height: 6, backgroundColor: c.learn }} />
      </View>
      <Text style={{ color: c.muted, fontSize: 12, fontVariant: ['tabular-nums'] }}>{label ?? t('voice.title')} · 0:{String(Math.round(voice.seconds)).padStart(2, '0')}</Text>
    </Pressable>
  );
}

/** Records a self-introduction of up to 15 seconds, with preview, re-record, and delete. */
export function VoiceRecorder({ value, onChange }: { value: VoiceIntro | null; onChange: (v: VoiceIntro | null) => void }) {
  const { t } = useTranslation();
  const c = useColors();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder, 200);
  const [error, setError] = useState('');
  const seconds = Math.floor(state.durationMillis / 1000);

  const start = async () => {
    setError('');
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) return setError(t('voice.permission'));
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record({ forDuration: VOICE_MAX_SECONDS });
  };

  const stop = async () => {
    const length = state.durationMillis / 1000;
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false });
    if (length < VOICE_MIN_SECONDS || !recorder.uri) return setError(t('voice.tooShort', { n: VOICE_MIN_SECONDS }));
    onChange({ uri: recorder.uri, seconds: Math.min(VOICE_MAX_SECONDS, Math.round(length)) });
  };

  // The recorder stops itself at 15 seconds; save the take when that happens.
  const wasRecording = useRef(false);
  useEffect(() => {
    if (wasRecording.current && !state.isRecording && recorder.uri) {
      const length = state.durationMillis / 1000;
      if (length >= VOICE_MAX_SECONDS - 0.5) onChange({ uri: recorder.uri, seconds: VOICE_MAX_SECONDS });
    }
    wasRecording.current = state.isRecording;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isRecording]);

  if (state.isRecording) {
    return (
      <View style={{ gap: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.bad }} />
          <Text accessibilityLiveRegion="polite" style={{ color: c.ink, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
            {t('voice.recording', { s: seconds, max: VOICE_MAX_SECONDS })}
          </Text>
        </View>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: c.line, overflow: 'hidden' }}>
          <View style={{ width: `${Math.min(100, (state.durationMillis / 10 / VOICE_MAX_SECONDS))}%`, height: 6, backgroundColor: c.bad }} />
        </View>
        <Button variant="danger" label={t('voice.stop')} onPress={stop} icon={<Ionicons name="stop" size={16} color="#FFFFFF" />} />
      </View>
    );
  }

  return (
    <View style={{ gap: space.sm }}>
      {value ? <VoicePlayer voice={value} /> : <Body small muted>{t('voice.hint', { max: VOICE_MAX_SECONDS })}</Body>}
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <View style={{ flex: 1 }}>
          <Button label={value ? t('voice.rerecord') : t('voice.record')} onPress={start} icon={<Ionicons name="mic" size={16} color={c.ink} />} />
        </View>
        {value ? <Button variant="ghost" label={t('voice.delete')} onPress={() => onChange(null)} /> : null}
      </View>
      <ErrorText>{error}</ErrorText>
    </View>
  );
}
