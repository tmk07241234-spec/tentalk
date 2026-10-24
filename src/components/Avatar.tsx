import { Image, Text, View } from 'react-native';

export function Avatar({ name, color, photoUri, size = 44, online }: {
  name: string; color: string; photoUri?: string | null; size?: number; online?: boolean;
}) {
  return (
    <View style={{ width: size, height: size }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={{ width: size, height: size }} accessibilityIgnoresInvertColors />
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
