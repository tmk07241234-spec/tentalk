import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

import { firebaseConfig } from './config';

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/** Web: the default persistence (IndexedDB) keeps the session across reloads. */
export const firebaseAuth = getAuth(app);
