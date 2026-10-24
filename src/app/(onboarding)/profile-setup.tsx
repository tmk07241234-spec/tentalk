import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/Avatar';
import { Body, Button, ErrorText, Field, Screen, StepLabel, Title } from '@/components/ui';
import { SETUP_STEPS, useOnboarding } from '@/state/onboarding';
import { useApp } from '@/state/store';
import { AVATAR_COLORS, space, useColors } from '@/theme/colors';

export default function ProfileStep() {
  const { t } = useTranslation();
  const c = useColors();
  const draft = useOnboarding();
  const completeSetup = useApp((s) => s.completeSetup);
  const [name, setName] = useState(draft.suggestedName);
  const [color, setColor] = useState(AVATAR_COLORS[1]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState('');

  const pickPhoto = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!r.canceled) setPhotoUri(r.assets[0].uri);
  };

  const next = () => {
    if (!name.trim()) return setError(t('profileSetup.nameRequired'));
    if (!draft.method || !draft.native || !draft.learn) return router.replace('/welcome');
    completeSetup({
      account: { method: draft.method, email: draft.email },
      profile: {
        name: name.trim(), color, photoUri, native: draft.native,
        learning: [{ lang: draft.learn, level: draft.level }], activeLearn: draft.learn, complete: false,
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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
        <Avatar name={name || '?'} color={color} photoUri={photoUri} size={72} />
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
      <Field label={t('profileSetup.name')} value={name} onChangeText={(v) => { setName(v); setError(''); }} maxLength={20} autoComplete="nickname" />
      <ErrorText>{error}</ErrorText>
    </Screen>
  );
}
