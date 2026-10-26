import { initializeFirestore } from 'firebase/firestore';

import { app } from './index';

/** Fields the app leaves undefined (e.g. no frame yet) are skipped instead of rejected. */
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
