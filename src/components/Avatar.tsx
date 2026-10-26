import { Image, Text, View } from 'react-native';

/** Tentalk Plus icon frames. */
export const FRAME_COLORS = { gold: '#D9A62E', sakura: '#EF8FB0', wave: '#3BA7C9' } as const;

export function Avatar({ name, color, photoUri, size = 44, online, frame }: {
  name: string; color: string; photoUri?: string | null; size?: number; online?: boolean; frame?: keyof typeof FRAME_COLORS | null;
}) {
  const ring = frame ? Math.max(2, Math.round(size * 0.06)) : 0;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, padding: ring, backgroundColor: frame ? FRAME_COLORS[frame] : 'transparent' }}>
      <View style={{ width: size - ring * 2, height: size - ring * 2, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: frame ? 2 : 0, borderColor: '#FFFFFF' }}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={{ width: size - ring * 2, height: size - ring * 2 }} accessibilityIgnoresInvertColors />
        ) : (
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: size * 0.38 }}>{name.trim()[0]?.toUpperCase() ?? '?'}</Text>
        )}
      </View>
      {online ? (
        <View style={{ position: 'absolute', right: 0, bottom: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#1F8A5B', borderWidth: 2, borderColor: '#FFFFFF' }} />
      ) : null}
    </View>
  );
}
