import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type UserCredential,
} from 'firebase/auth';

import { firebaseAuth } from './firebase';
import { googleAvailable, signInWithGoogle } from './firebase/google';

export type SignInMethod = 'apple' | 'google' | 'email';

export interface SignInResult {
  method: SignInMethod;
  uid: string;
  email: string | null;
  /** Name from the identity provider, used to pre-fill the profile. */
  displayName: string | null;
  /** True when this sign-in created the account. */
  isNew: boolean;
}

/** Why a sign-in failed, in terms the screens can turn into a message. */
export type AuthErrorKind =
  | 'wrong-password' | 'weak-password' | 'invalid-email' | 'too-many-requests'
  | 'network' | 'cancelled' | 'unavailable' | 'requires-recent-login' | 'unknown';

export function authErrorKind(e: unknown): AuthErrorKind {
  const code = (e as { code?: string } | null)?.code ?? '';
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/email-already-in-use':
      return 'wrong-password';
    case 'auth/weak-password': return 'weak-password';
    case 'auth/invalid-email': return 'invalid-email';
    case 'auth/too-many-requests': return 'too-many-requests';
    case 'auth/network-request-failed': return 'network';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'cancelled';
    case 'tentalk/unavailable':
    case 'auth/operation-not-allowed':
      return 'unavailable';
    case 'auth/requires-recent-login': return 'requires-recent-login';
    default: return 'unknown';
  }
}

/** Sign-in boundary. Screens only talk to this object, never to Firebase directly. */
export interface AuthService {
  /** Sign-in methods that work on this device right now. */
  methods: SignInMethod[];
  signInWithGoogle(): Promise<SignInResult>;
  /** Signs in, or creates the account when the address is new. */
  continueWithEmail(email: string, password: string): Promise<SignInResult>;
  sendPasswordReset(email: string): Promise<void>;
  /**
   * Deletes the signed-in account, running `removeData` first while still signed in.
   * Fails with 'requires-recent-login', before anything is removed, when the last
   * sign-in is too old for Firebase to allow the deletion.
   */
  deleteAccount(removeData: (uid: string) => Promise<void>): Promise<void>;
  signOut(): Promise<void>;
  /** Language of the emails Firebase sends (verification, password reset). */
  setLanguage(lang: string): void;
}

/** Firebase asks for a fresh sign-in before deleting an account; its window is about 5 minutes. */
const RECENT_LOGIN_MS = 4 * 60_000;

const result = (method: SignInMethod, cred: UserCredential, isNew: boolean): SignInResult => ({
  method,
  uid: cred.user.uid,
  email: cred.user.email,
  displayName: cred.user.displayName,
  isNew,
});

export const auth: AuthService = {
  // Apple joins once the Apple Developer Program account exists.
  methods: googleAvailable ? ['google', 'email'] : ['email'],

  async signInWithGoogle() {
    const cred = await signInWithGoogle(firebaseAuth);
    const isNew = cred.user.metadata.creationTime === cred.user.metadata.lastSignInTime;
    return result('google', cred, isNew);
  },

  async continueWithEmail(email, password) {
    try {
      return result('email', await signInWithEmailAndPassword(firebaseAuth, email, password), false);
    } catch (e) {
      // With email enumeration protection on, an unknown address and a wrong password
      // both come back as invalid-credential. Creating the account tells them apart:
      // it fails with email-already-in-use when the password was simply wrong.
      if ((e as { code?: string }).code !== 'auth/invalid-credential' && (e as { code?: string }).code !== 'auth/user-not-found') throw e;
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      sendEmailVerification(cred.user).catch(() => {});
      return result('email', cred, true);
    }
  },

  async sendPasswordReset(email) {
    await sendPasswordResetEmail(firebaseAuth, email);
  },

  async deleteAccount(removeData) {
    const user = firebaseAuth.currentUser;
    if (!user) return;
    const lastSignIn = Date.parse(user.metadata.lastSignInTime ?? '');
    if (!(Date.now() - lastSignIn < RECENT_LOGIN_MS)) {
      throw Object.assign(new Error('Sign in again to delete the account.'), { code: 'auth/requires-recent-login' });
    }
    await removeData(user.uid);
    await deleteUser(user);
  },

  async signOut() {
    await firebaseSignOut(firebaseAuth);
  },

  setLanguage(lang) {
    firebaseAuth.languageCode = lang;
  },
};
