import { isLoginCode } from '@/domain/validation';

export type SignInMethod = 'apple' | 'google' | 'email';

export interface SignInResult {
  method: SignInMethod;
  email: string | null;
  /** Name from the identity provider, used to pre-fill the profile. */
  displayName: string | null;
}

/**
 * Sign-in boundary. The app only talks to this interface, so the mock below can
 * be swapped for Firebase Authentication (or Supabase Auth) without touching screens.
 */
export interface AuthService {
  signInWithApple(): Promise<SignInResult>;
  signInWithGoogle(): Promise<SignInResult>;
  sendEmailCode(email: string): Promise<void>;
  verifyEmailCode(email: string, code: string): Promise<SignInResult>;
  signOut(): Promise<void>;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Development stand-in: every provider succeeds and any 6-digit code is accepted. */
export const mockAuth: AuthService = {
  async signInWithApple() {
    await wait(300);
    return { method: 'apple', email: null, displayName: null };
  },
  async signInWithGoogle() {
    await wait(300);
    return { method: 'google', email: 'user@gmail.com', displayName: 'Takeshi' };
  },
  async sendEmailCode() {
    await wait(300);
  },
  async verifyEmailCode(email, code) {
    await wait(300);
    if (!isLoginCode(code)) throw new Error('invalid-code');
    return { method: 'email', email, displayName: email.split('@')[0] };
  },
  async signOut() {},
};

export const auth: AuthService = mockAuth;
