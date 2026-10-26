import { GoogleAuthProvider, reauthenticateWithPopup, signInWithPopup, type Auth, type User } from 'firebase/auth';

export const googleAvailable = true;

const provider = () => {
  const p = new GoogleAuthProvider();
  p.setCustomParameters({ prompt: 'select_account' });
  return p;
};

export function signInWithGoogle(auth: Auth) {
  return signInWithPopup(auth, provider());
}

export function reauthWithGoogle(user: User) {
  return reauthenticateWithPopup(user, provider());
}

/** The browser keeps no Google session of its own for the app. */
export async function signOutOfGoogle() {}
