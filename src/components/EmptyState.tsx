import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Pip, type PipPose } from './Pip';
import { space, useColors } from '@/theme/colors';

/** An empty screen with Pip, a short title, a line of explanation and what to do next. */
export function EmptyState({ pose, title, body, children }: { pose: PipPose; title: string; body: string; children?: ReactNode }) {
  const c = useColors();
  return (
    <View style={{ gap: space.lg, paddingTop: space.lg }}>
      <View style={{ alignItems: 'center', gap: space.sm, paddingHorizontal: space.md }}>
        <Pip pose={pose} tone="buddy" size={110} />
        <Text style={{ color: c.ink, fontSize: 18, fontWeight: '800', textAlign: 'center' }}>{title}</Text>
        <Text style={{ color: c.muted, fontSize: 13.5, lineHeight: 21, textAlign: 'center' }}>{body}</Text>
      </View>
      {children}
    </View>
  );
}
