import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Avatar } from './Avatar';
import { Character, HAIR_COLORS, HAIRS, lookId, OUTFITS, parseLook, randomLook, SKINS, type CharacterId, type Look } from './Character';
import { Body, Button } from './ui';
import { AVATAR_COLORS, space, useColors } from '@/theme/colors';

/**
 * Choosing an icon: any photo from the library comes first. People who would rather not
 * show a photo can put together an illustrated portrait (hair, skin, clothes) or keep
 * the initial; the colour row sets their background.
 */
export function AvatarPicker({ name, color, avatar, photoUri, frame, onChange, onPickPhoto }: {
  name: string; color: string; avatar: CharacterId | null; photoUri: string | null; frame?: 'gold' | 'sakura' | 'wave' | null;
  onChange: (v: { color?: string; avatar?: CharacterId | null; photoUri?: string | null }) => void;
  onPickPhoto: () => void;
}) {
  const { t } = useTranslation();
  const c = useColors();
  const look = parseLook(avatar);
  const set = (patch: Partial<Look>) => onChange({ avatar: lookId({ ...(look ?? parseLook(randomLook())!), ...patch }), photoUri: null });
  const ring = (on: boolean) => ({ borderWidth: 2.5, borderColor: on ? c.ink : 'transparent', borderRadius: 999, padding: 2 });
  const swatches = (label: string, colors: string[], value: number, key: 'hairColor' | 'skin' | 'outfit') => (
    <View style={{ gap: 6 }}>
      <Text style={{ color: c.muted, fontSize: 12, fontWeight: '700' }}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {colors.map((col, i) => (
          <Pressable key={col} accessibilityRole="radio" accessibilityLabel={`${label} ${i + 1}`} accessibilityState={{ checked: value === i }}
            onPress={() => set({ [key]: i })} style={ring(value === i)}>
            <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: col, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' }} />
          </Pressable>
        ))}
      </View>
    </View>
  );

  const label = (text: string) => <Text style={{ color: c.muted, fontSize: 12, fontWeight: '700' }}>{text}</Text>;
  return (
    <View style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
        <Avatar name={name || '?'} color={color} avatar={photoUri ? null : avatar} photoUri={photoUri} size={72} frame={frame} />
        <View style={{ flex: 1, gap: space.sm, alignItems: 'flex-start' }}>
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            <Button small variant="primary" label={photoUri ? t('avatarPicker.changePhoto') : t('avatarPicker.choosePhoto')} onPress={onPickPhoto} />
            {photoUri ? <Button small variant="ghost" label={t('profileSetup.removePhoto')} onPress={() => onChange({ photoUri: null })} /> : null}
          </View>
          <Body small muted>{t('avatarPicker.note')}</Body>
        </View>
      </View>

      {!photoUri ? (
        <View style={{ gap: space.md }}>
          {label(t('avatarPicker.noPhoto'))}
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            <Button small variant={look ? 'primary' : 'secondary'} label={t('avatarPicker.illustration')} onPress={() => onChange({ avatar: look ? avatar : randomLook(), photoUri: null })} />
            <Button small variant={!look ? 'primary' : 'secondary'} label={t('avatarPicker.initial')} onPress={() => onChange({ avatar: null, photoUri: null })} />
          </View>
          <View style={{ gap: 6 }}>
            {label(t('avatarPicker.background'))}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {AVATAR_COLORS.map((col) => (
                <Pressable key={col} accessibilityRole="radio" accessibilityLabel={col} accessibilityState={{ checked: col === color }}
                  onPress={() => onChange({ color: col })} style={ring(col === color)}>
                  <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: col }} />
                </Pressable>
              ))}
            </View>
          </View>
          {look ? (
            <>
              <View style={{ gap: 6 }}>
                {label(t('avatarPicker.hair'))}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
                  {HAIRS.map((h, i) => (
                    <Pressable key={h} accessibilityRole="radio" accessibilityLabel={`${t('avatarPicker.hair')} ${i + 1}`} accessibilityState={{ checked: look.hair === h }}
                      onPress={() => set({ hair: h })} style={ring(look.hair === h)}>
                      <Character id={lookId({ ...look, hair: h })} color={color} size={48} />
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              {look.hair !== 'scarf' ? swatches(t('avatarPicker.hairColor'), HAIR_COLORS, look.hairColor, 'hairColor') : null}
              {swatches(t('avatarPicker.skin'), SKINS, look.skin, 'skin')}
              {swatches(t('avatarPicker.outfit'), OUTFITS, look.outfit, 'outfit')}
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
