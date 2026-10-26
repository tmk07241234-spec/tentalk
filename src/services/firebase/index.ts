import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Persistence } from 'firebase/auth';

import { firebaseConfig } from './config';

// The package's type entry is the browser one; the React Native build that Metro loads
// on phones also exports this function.
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: typeof AsyncStorage): Persistence;
}

const isFirst = getApps().length === 0;
export const app = isFirst ? initializeApp(firebaseConfig) : getApp();

/**
 * Native: keep the session in AsyncStorage so users stay signed in across launches.
 * initializeAuth may run only once per app, so Fast Refresh reuses the existing instance.
 */
export const firebaseAuth = isFirst
  ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  : getAuth(app);
