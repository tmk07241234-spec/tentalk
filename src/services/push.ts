import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';

import { db } from './firebase/db';

/**
 * Push notifications (phones only; see push.web.ts). The device's Expo push token is
 * kept in users/{uid}/private/push with the app language, so the server can send
 * requests, acceptances and follows in the right language while the app is closed.
 */

// While the app is open, the in-app notification list already shows new items.
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: false, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

/** Asks once for permission and saves this device's token. Safe to call on every launch. */
export async function registerForPush(uid: string, lang: string): Promise<void> {
  try {
    const current = await Notifications.getPermissionsAsync();
    const granted = current.granted || (current.canAskAgain && (await Notifications.requestPermissionsAsync()).granted);
    if (!granted) return;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await setDoc(doc(db, 'users', uid, 'private', 'push'), { tokens: [token], lang, updatedAt: Date.now() });
  } catch {
    // No permission, simulator or offline: the in-app list still works.
  }
}

/** Opening a notification goes to the Notifications tab, where requests can be answered. */
export function startPushResponses(): () => void {
  const open = () => router.push('/notifications');
  if (Notifications.getLastNotificationResponse()) open();
  const sub = Notifications.addNotificationResponseReceivedListener(open);
  return () => sub.remove();
}
