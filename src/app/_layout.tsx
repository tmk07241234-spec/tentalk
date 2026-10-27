import { useEffect, useSyncExternalStore } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

// Importing the i18n module also initialises i18next before any screen renders.
import { deviceUiLang } from '@/i18n';
import { auth } from '@/services/auth';
import { UpdateBanner } from '@/components/UpdateBanner';
import { startFollowersListener } from '@/services/connections';
import { startPresence } from '@/services/presence';
import { startRequestListeners } from '@/services/requests';
import { useApp } from '@/state/store';
import { startCloudSync } from '@/state/sync';
import { useColors } from '@/theme/colors';

/**
 * Waits for the persisted store to load so the first redirect is correct. On the web
 * the pre-built page has no saved data, so it always starts as "not loaded"; that keeps
 * the first browser render identical to the page and avoids a hydration mismatch.
 */
function useHydrated() {
  return useSyncExternalStore(
    (onChange) => useApp.persist.onFinishHydration(onChange),
    () => useApp.persist.hasHydrated(),
    () => false,
  );
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
  const uid = useApp((s) => s.account?.uid);
  useEffect(() => (hydrated && uid ? startPresence() : undefined), [hydrated, uid]);
  useEffect(() => (hydrated && uid ? startRequestListeners(uid) : undefined), [hydrated, uid]);
  useEffect(() => (hydrated && uid ? startFollowersListener(uid) : undefined), [hydrated, uid]);

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
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
      </Stack>
      <UpdateBanner />
    </>
  );
}
