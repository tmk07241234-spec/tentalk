import type { Auth, UserCredential } from 'firebase/auth';

/**
 * Native Google sign-in needs the Google Sign-In native module, which only runs in a
 * development build (not Expo Go). Until that build exists the button is hidden on
 * phones; see `googleAvailable`.
 */
export const googleAvailable = false;

export async function signInWithGoogle(_auth: Auth): Promise<UserCredential> {
  throw Object.assign(new Error('Google sign-in is not available on this device yet.'), { code: 'tentalk/unavailable' });
}
