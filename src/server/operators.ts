import { pushTarget, sendPush } from './push';
import { firestore, type Data } from './firestore';

/**
 * config/operators  { [uid]: { tokens, lang } }  the operators' devices, saved whenever an
 * operator's app checks its operator status, so new reports can alert them at once and
 * be reviewed within 24 hours. Server-only (Firestore rules give apps no access).
 */
const PATH = 'config/operators';

export async function rememberOperator(uid: string): Promise<void> {
  const docs = await firestore.getMany([PATH, `users/${uid}/private/push`]);
  const target = pushTarget(docs[`users/${uid}/private/push`]);
  if (!target) return;
  const all = (docs[PATH] ?? {}) as Data;
  const mine = all[uid] as { tokens?: string[] } | undefined;
  if (mine && JSON.stringify(mine.tokens) === JSON.stringify(target.tokens)) return;
  await firestore.commit([{ set: PATH, data: { ...all, [uid]: { tokens: target.tokens, lang: target.lang } } }]);
}

export async function alertOperators(): Promise<void> {
  const all = (await firestore.get(PATH)) ?? {};
  const tokens = Object.values(all).flatMap((v) => ((v as { tokens?: string[] }).tokens ?? []));
  const lang = (Object.values(all)[0] as { lang?: string } | undefined)?.lang ?? 'ja';
  // One request for every operator device, to stay within the hosting's per-request limits.
  await sendPush(pushTarget({ tokens: [...new Set(tokens)], lang }), 'newReport');
}
