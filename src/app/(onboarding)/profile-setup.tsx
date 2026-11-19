import { useState } from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

import { AvatarPicker } from '@/components/AvatarPicker';
import type { CharacterId } from '@/components/Character';
import { Body, Button, ErrorText, Field, Screen, StepLabel, Title } from '@/components/ui';
import { contentProblem } from '@/domain/contentFilter';
import { deviceOffset } from '@/domain/schedule';
import { SETUP_STEPS, useOnboarding } from '@/state/onboarding';
import { useApp } from '@/state/store';
import { AVATAR_COLORS } from '@/theme/colors';

export default function ProfileStep() {
  const { t } = useTranslation();
  const draft = useOnboarding();
  const completeSetup = useApp((s) => s.completeSetup);
  const [name, setName] = useState(draft.suggestedName);
  const [color, setColor] = useState(AVATAR_COLORS[1]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  // An illustrated character by default, so nobody starts with just an initial.
  const [avatar, setAvatar] = useState<CharacterId | null>('cat');
  const [error, setError] = useState('');

  const pickPhoto = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!r.canceled) setPhotoUri(r.assets[0].uri);
  };

  const next = () => {
    if (!name.trim()) return setError(t('profileSetup.nameRequired'));
    const content = contentProblem(name);
    if (content) return setError(t(`profileEdit.errors.${content}`));
    if (!draft.method || !draft.uid || !draft.native || !draft.learn) return router.replace('/welcome');
    completeSetup({
      account: { method: draft.method, uid: draft.uid, email: draft.email },
      profile: {
        name: name.trim(), color, photoUri, avatar: photoUri ? null : avatar, native: draft.native,
        learning: [{ lang: draft.learn, level: draft.level }], activeLearn: draft.learn,
        bio: '', hobbies: [], hours: null, utcOffset: deviceOffset(),
      },
    });
    draft.reset();
    router.replace('/guide');
  };

  return (
    <Screen footer={<><Button variant="primary" label={t('common.next')} onPress={next} /><Button label={t('common.back')} onPress={() => router.back()} /></>}>
      <StepLabel>{t('common.step', { n: 5, total: SETUP_STEPS })}</StepLabel>
      <Title>{t('profileSetup.title')}</Title>
      <Body muted>{t('profileSetup.desc')}</Body>
      <Body small muted>{t('profileSetup.icon')}</Body>
      <AvatarPicker name={name} color={color} avatar={avatar} photoUri={photoUri} onPickPhoto={pickPhoto}
        onChange={(v) => { if (v.color) setColor(v.color); if ('avatar' in v) setAvatar(v.avatar ?? null); if ('photoUri' in v) setPhotoUri(v.photoUri ?? null); }} />
      <Field label={t('profileSetup.name')} value={name} onChangeText={(v) => { setName(v); setError(''); }} maxLength={20} autoComplete="nickname" />
      <ErrorText>{error}</ErrorText>
    </Screen>
  );
}
