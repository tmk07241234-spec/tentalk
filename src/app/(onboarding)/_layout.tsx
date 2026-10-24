import { Stack } from 'expo-router';

import { useColors } from '@/theme/colors';

/**
 * First run: welcome (sign in) → email → code → birthday → languages → level
 * → profile (icon and name) → guide → home.
 */
export default function OnboardingLayout() {
  const c = useColors();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />;
}
