import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, space, useColors } from '@/theme/colors';

/** Bottom sheet. Tapping the dimmed area calls onClose when it is given. */
export function Sheet({ visible, onClose, children }: { visible: boolean; onClose?: () => void; children: ReactNode }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose ?? (() => {})}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable accessibilityLabel="close" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,12,24,0.45)' }} onPress={onClose} disabled={!onClose} />
        <View style={{ backgroundColor: c.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '92%' }}>
          <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: space.lg + insets.bottom, gap: space.md }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.line, alignSelf: 'center' }} />
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
