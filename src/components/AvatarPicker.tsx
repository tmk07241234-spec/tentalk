import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Avatar } from './Avatar';
import { Character, CHARACTERS, type CharacterId } from './Character';
import { Body, Button } from './ui';
import { AVATAR_COLORS, space, useColors } from '@/theme/colors';

/**
 * Choosing an icon: a colour, then an illustrated character or the initial, or a photo.
 * Characters come first so a photo is a choice, not the default (Tentalk is voice first).
 */
export function AvatarPicker({ name, color, avatar, photoUri, frame, onChange, onPickPhoto }: {
  name: string; color: string; avatar: CharacterId | null; photoUri: string | null; frame?: 'gold' | 'sakura' | 'wave' | null;
  onChange: (v: { color?: string; avatar?: CharacterId | null; photoUri?: string | null }) => void;
  onPickPhoto: () => void;
}) {
  const { t } = useTranslation();
  const c = useColors();
  const ring = (on: boolean) => ({ borderWidth: 2.5, borderColor: on ? c.ink : 'transparent', borderRadius: 999, padding: 2 });
  return (
    <View style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
        <Avatar name={name || '?'} color={color} avatar={avatar} photoUri={photoUri} size={72} frame={frame} />
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {AVATAR_COLORS.map((col) => (
            <Pressable key={col} accessibilityRole="radio" accessibilityLabel={col} accessibilityState={{ checked: col === color }}
              onPress={() => onChange({ color: col })} style={ring(col === color)}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: col }} />
            </Pressable>
          ))}
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        <Pressable accessibilityRole="radio" accessibilityLabel={t('avatarPicker.initial')} accessibilityState={{ checked: !photoUri && !avatar }}
          onPress={() => onChange({ avatar: null, photoUri: null })} style={ring(!photoUri && !avatar)}>
          <Avatar name={name || '?'} color={color} size={44} />
        </Pressable>
        {CHARACTERS.map((id) => (
          <Pressable key={id} accessibilityRole="radio" accessibilityLabel={t(`avatarPicker.${id}`)} accessibilityState={{ checked: !photoUri && avatar === id }}
            onPress={() => onChange({ avatar: id, photoUri: null })} style={ring(!photoUri && avatar === id)}>
            <Character id={id} color={color} size={44} />
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
        <Button small label={t('profileSetup.photo')} onPress={onPickPhoto} />
        {photoUri ? <Button small variant="ghost" label={t('profileSetup.removePhoto')} onPress={() => onChange({ photoUri: null })} /> : null}
        <Body small muted style={{ flex: 1 }}>{t('avatarPicker.note')}</Body>
      </View>
    </View>
  );
}
