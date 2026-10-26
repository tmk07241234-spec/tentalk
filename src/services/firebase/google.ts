import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import { OAuthProvider, reauthenticateWithCredential, signInWithCredential, type Auth, type User, type UserCredential } from 'firebase/auth';
import { Platform } from 'react-native';

type NativeGoogle = typeof import('react-native-nitro-google-signin');

/**
 * Native Google sign-in needs the Google Sign-In native module and the Firebase file
 * (`google-services.json`), so it works only in a development or store build made with
 * that file (app.config.js sets `extra.googleSignIn`), never in Expo Go. iOS joins once
 * the Apple Developer Program account and GoogleService-Info.plist exist.
 */
const native: NativeGoogle | null = (() => {
  if (Platform.OS !== 'android' || !Constants.expoConfig?.extra?.googleSignIn) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- loaded only when the native module is in the build
    return require('react-native-nitro-google-signin') as NativeGoogle;
  } catch {
    return null;
  }
})();

export const googleAvailable = native !== null;

const unavailable = () => Object.assign(new Error('Google sign-in is not available on this device yet.'), { code: 'tentalk/unavailable' });
const cancelled = () => Object.assign(new Error('Google sign-in was cancelled.'), { code: 'tentalk/cancelled' });

/**
 * Shows Google's account sheet and turns the result into a Firebase credential.
 * The ID token always carries a nonce, so Firebase must be given the raw value behind it.
 */
async function googleCredential() {
  if (!native) throw unavailable();
  const { GoogleOneTapSignIn, isNoSavedCredentialFoundResponse, isSuccessResponse, isErrorWithCode, statusCodes } = native;
  const rawNonce = Crypto.randomUUID();
  const nonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  try {
    // 'autoDetect' reads the web client ID that google-services.json puts into the build.
    GoogleOneTapSignIn.configure({ webClientId: 'autoDetect', nonce });
    await GoogleOneTapSignIn.checkPlayServices();
    let response = await GoogleOneTapSignIn.signIn();
    if (isNoSavedCredentialFoundResponse(response)) response = await GoogleOneTapSignIn.createAccount();
    if (isNoSavedCredentialFoundResponse(response)) response = await GoogleOneTapSignIn.presentExplicitSignIn();
    if (!isSuccessResponse(response)) throw cancelled();
    return new OAuthProvider('google.com').credential({ idToken: response.data.idToken, rawNonce });
  } catch (e) {
    if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) throw cancelled();
    if (isErrorWithCode(e) && (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE || e.code === statusCodes.DEVELOPER_ERROR)) {
      throw Object.assign(unavailable(), { cause: e });
    }
    throw e;
  }
}

export async function signInWithGoogle(auth: Auth): Promise<UserCredential> {
  return signInWithCredential(auth, await googleCredential());
}

export async function reauthWithGoogle(user: User): Promise<UserCredential> {
  return reauthenticateWithCredential(user, await googleCredential());
}

/** Forgets the Google account on this device so the next sign-in asks which one to use. */
export async function signOutOfGoogle() {
  await native?.GoogleOneTapSignIn.signOut().catch(() => {});
}
