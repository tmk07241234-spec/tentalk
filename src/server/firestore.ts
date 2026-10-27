import { importPKCS8, SignJWT } from 'jose';

/**
 * Firestore access for API routes, as the server (bypassing the security rules).
 * Uses the REST API with a service-account token, since the Firebase Admin SDK does
 * not run on EAS Hosting's worker runtime.
 */

interface ServiceAccount { project_id: string; client_email: string; private_key: string }

let account: ServiceAccount | null = null;
let cached: { token: string; expires: number } | null = null;

function serviceAccount(): ServiceAccount {
  if (!account) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set');
    account = JSON.parse(raw) as ServiceAccount;
  }
  return account;
}

async function accessToken(): Promise<string> {
  if (cached && cached.expires > Date.now() + 60_000) return cached.token;
  const sa = serviceAccount();
  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({ scope: 'https://www.googleapis.com/auth/datastore' })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(sa.client_email).setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now).setExpirationTime(now + 3600)
    .sign(await importPKCS8(sa.private_key, 'RS256'));
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  if (!r.ok) throw new Error(`Google token: ${r.status}`);
  const data = (await r.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return cached.token;
}

const root = () => `projects/${serviceAccount().project_id}/databases/(default)/documents`;
const api = () => `https://firestore.googleapis.com/v1/${root()}`;

async function call<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(`${api()}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { authorization: `Bearer ${await accessToken()}`, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (r.status === 404 && body === undefined) return null as T;
  if (!r.ok) throw new Error(`Firestore ${path}: ${r.status} ${await r.text()}`);
  return (await r.json()) as T;
}

// Plain JSON values <-> Firestore's typed values. Times are stored as numbers (ms).
type Value =
  | { nullValue: null } | { booleanValue: boolean } | { integerValue: string } | { doubleValue: number }
  | { stringValue: string } | { arrayValue: { values?: Value[] } } | { mapValue: { fields?: Record<string, Value> } }
  | { timestampValue: string };

export type Data = Record<string, unknown>;

function toValue(v: unknown): Value {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  return { mapValue: { fields: toFields(v as Data) } };
}

function toFields(d: Data): Record<string, Value> {
  return Object.fromEntries(Object.entries(d).filter(([, v]) => v !== undefined).map(([k, v]) => [k, toValue(v)]));
}

function fromValue(v: Value): unknown {
  if ('nullValue' in v) return null;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('stringValue' in v) return v.stringValue;
  if ('timestampValue' in v) return Date.parse(v.timestampValue);
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(fromValue);
  return fromFields(v.mapValue.fields ?? {});
}

function fromFields(f: Record<string, Value>): Data {
  return Object.fromEntries(Object.entries(f).map(([k, v]) => [k, fromValue(v)]));
}

interface RawDoc { name: string; fields?: Record<string, Value> }
const docData = (d: RawDoc) => fromFields(d.fields ?? {});

/** A write inside commit(): set (replace) or delete a document by its path, e.g. "queue/abc". */
export type Write = { set: string; data: Data } | { delete: string };

export const firestore = {
  async get(path: string, transaction?: string): Promise<Data | null> {
    const q = transaction ? `?transaction=${encodeURIComponent(transaction)}` : '';
    const d = await call<RawDoc | null>(`/${path}${q}`);
    return d ? docData(d) : null;
  },

  /** Documents in `collection` whose `field` equals `value` (at most `limit`). */
  async where(collection: string, field: string, value: unknown, limit: number, transaction?: string): Promise<Data[]> {
    const rows = await call<{ document?: RawDoc }[]>(':runQuery', {
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: toValue(value) } },
        limit,
      },
      ...(transaction ? { transaction } : {}),
    });
    return rows.filter((r) => r.document).map((r) => docData(r.document!));
  },

  async begin(): Promise<string> {
    return (await call<{ transaction: string }>(':beginTransaction', {})).transaction;
  },

  /** Applies all writes at once; with a transaction, fails if anything read in it changed meanwhile. */
  async commit(writes: Write[], transaction?: string): Promise<void> {
    await call(':commit', {
      writes: writes.map((w) => ('delete' in w ? { delete: `${root()}/${w.delete}` } : { update: { name: `${root()}/${w.set}`, fields: toFields(w.data) } })),
      ...(transaction ? { transaction } : {}),
    });
  },
};
