import { Text, View } from 'react-native';

/** The app icon: blue and red speech bubbles overlapping, with "10" where they meet. */
export function AppMark({ size = 64 }: { size?: number }) {
  const u = size / 120;
  return (
    <View accessibilityRole="image" accessibilityLabel="Tentalk" style={{ width: size, height: size, borderRadius: 28 * u, backgroundColor: '#161A2B', overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: 24 * u, top: 20 * u, width: 54 * u, height: 46 * u, borderRadius: 14 * u, backgroundColor: '#2D55E0' }} />
      <View style={{ position: 'absolute', left: 42 * u, top: 44 * u, width: 54 * u, height: 46 * u, borderRadius: 14 * u, backgroundColor: '#D6402A' }} />
      <View style={{ position: 'absolute', left: 42 * u, top: 44 * u, width: 36 * u, height: 22 * u, borderTopLeftRadius: 14 * u, backgroundColor: '#8A3A86' }} />
      <Text style={{ position: 'absolute', left: 50 * u, top: 56 * u, width: 40 * u, textAlign: 'center', color: '#FFFFFF', fontWeight: '700', fontSize: 22 * u }}>10</Text>
    </View>
  );
}
