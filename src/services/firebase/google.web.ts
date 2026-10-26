import { GoogleAuthProvider, signInWithPopup, type Auth } from 'firebase/auth';

export const googleAvailable = true;

export function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(auth, provider);
}
