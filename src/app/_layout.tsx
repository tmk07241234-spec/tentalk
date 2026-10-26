import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

// Importing the i18n module also initialises i18next before any screen renders.
import { deviceUiLang } from '@/i18n';
import { auth } from '@/services/auth';
import { useApp } from '@/state/store';
import { startCloudSync } from '@/state/sync';
import { useColors } from '@/theme/colors';

/** Waits for the persisted store to load so the first redirect is correct. */
function useHydrated() {
  const [done, setDone] = useState(useApp.persist.hasHydrated());
  useEffect(() => useApp.persist.onFinishHydration(() => setDone(true)), []);
  return done;
}

export default function RootLayout() {
  const hydrated = useHydrated();
  const uiLang = useApp((s) => s.uiLang);
  const { i18n } = useTranslation();
  const c = useColors();

  useEffect(() => {
    const lang = uiLang ?? deviceUiLang();
    i18n.changeLanguage(lang);
    auth.setLanguage(lang);
  }, [uiLang, i18n]);

  useEffect(() => (hydrated ? startCloudSync() : undefined), [hydrated]);

  if (!hydrated) return null;

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="call" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
        <Stack.Screen name="person/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="profile-edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="info/[page]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="plus" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
