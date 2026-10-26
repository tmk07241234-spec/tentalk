import { getStorage } from 'firebase/storage';

import { app } from './index';

export const storage = getStorage(app);
