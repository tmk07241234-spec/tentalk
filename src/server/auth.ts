import { createRemoteJWKSet, jwtVerify } from 'jose';

import { firebaseConfig } from '@/services/firebase/config';

const PROJECT_ID = firebaseConfig.projectId;
const keys = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** The signed-in user's id from the Firebase ID token in the Authorization header. */
export async function requireUser(request: Request): Promise<string> {
  const token = request.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!token) throw new HttpError(401, 'Sign in first.');
  try {
    const { payload } = await jwtVerify(token, keys, { issuer: `https://securetoken.google.com/${PROJECT_ID}`, audience: PROJECT_ID });
    if (!payload.sub) throw new Error('no subject');
    return payload.sub;
  } catch {
    throw new HttpError(401, 'Sign in again.');
  }
}

/** Runs an API handler and turns thrown errors into JSON responses. */
export async function handle(run: () => Promise<unknown>): Promise<Response> {
  try {
    return Response.json(await run());
  } catch (e) {
    if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
    console.error(e);
    return Response.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
