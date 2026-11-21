import type { Data } from './firestore';

/**
 * Push notifications through Expo's push service. Each person's devices and language
 * are in users/{uid}/private/push (written by their app). Texts stay short and never
 * include anything private beyond the other person's display name.
 */
export type PushKind = 'incomingNow' | 'incomingLater' | 'accepted' | 'followed' | 'moderation' | 'newReport' | 'searching';

const TEXT: Record<string, Record<PushKind, string>> = {
  ja: {
    incomingNow: '{name}さんが、いま10分話したいそうです',
    incomingLater: '{name}さんから10分通話のリクエストが届きました',
    accepted: '{name}さんがリクエストを承認しました。いま話せます',
    followed: '{name}さんがあなたをフォローしました',
    moderation: '運営からのお知らせがあります',
    newReport: '新しい通報があります。24時間以内に確認してください',
    searching: 'いま、あなたと話せる相手がクイックマッチで待っています。10分話してみませんか？',
  },
  en: {
    incomingNow: '{name} wants to talk for 10 minutes now',
    incomingLater: '{name} sent you a 10-minute call request',
    accepted: '{name} accepted your request. You can talk now',
    followed: '{name} followed you',
    moderation: 'You have a message from the Tentalk team',
    newReport: 'New report to review within 24 hours',
    searching: 'Someone you could talk with is waiting in quick match. Up for 10 minutes?',
  },
  ko: {
    incomingNow: '{name}님이 지금 10분 이야기하고 싶어 해요',
    incomingLater: '{name}님이 10분 통화를 요청했어요',
    accepted: '{name}님이 요청을 승인했어요. 지금 이야기할 수 있어요',
    followed: '{name}님이 나를 팔로우했어요',
    moderation: '운영팀의 알림이 있어요',
    newReport: '새 신고가 있어요. 24시간 안에 확인해 주세요',
    searching: '지금 나와 이야기할 수 있는 사람이 빠른 매칭에서 기다리고 있어요. 10분 이야기해 볼까요?',
  },
  es: {
    incomingNow: '{name} quiere hablar 10 minutos ahora',
    incomingLater: '{name} te envió una solicitud de llamada de 10 minutos',
    accepted: '{name} aceptó tu solicitud. Ya pueden hablar',
    followed: '{name} empezó a seguirte',
    moderation: 'Tienes un aviso del equipo de Tentalk',
    newReport: 'Hay una denuncia nueva para revisar en 24 horas',
    searching: 'Alguien con quien podrías hablar está esperando en Rápida. ¿Hablan 10 minutos?',
  },
};

export interface PushTarget { tokens: string[]; lang: string }

export function pushTarget(doc: Data | null): PushTarget | null {
  const tokens = Array.isArray(doc?.tokens) ? (doc.tokens as string[]).filter((t) => typeof t === 'string' && t.startsWith('ExponentPushToken[')) : [];
  return tokens.length ? { tokens, lang: typeof doc?.lang === 'string' ? doc.lang : 'en' } : null;
}

/** Sends one kind of notification to several people in a single request (EAS Hosting allows few outside requests per call). */
export async function sendPushMany(targets: PushTarget[], kind: PushKind, data: Record<string, string> = {}): Promise<void> {
  const messages = targets.flatMap((t) => t.tokens.map((to) => ({ to, title: 'Tentalk', body: (TEXT[t.lang] ?? TEXT.en)[kind].replace('{name}', 'Tentalk'), sound: 'default', data: { kind, ...data }, priority: 'high' })));
  if (!messages.length) return;
  try {
    const r = await fetch('https://exp.host/--/api/v2/push/send', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(messages.slice(0, 100)) });
    if (!r.ok) console.error('push', r.status, await r.text());
  } catch (e) {
    console.error('push', e);
  }
}

/** Sends one notification to a person's devices. Failures are logged and never block the action that caused them. */
export async function sendPush(target: PushTarget | null, kind: PushKind, name = ''): Promise<void> {
  if (!target) return;
  const body = (TEXT[target.lang] ?? TEXT.en)[kind].replace('{name}', name || 'Tentalk');
  try {
    const r = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(target.tokens.map((to) => ({ to, title: 'Tentalk', body, sound: 'default', data: { kind }, priority: 'high' }))),
    });
    if (!r.ok) console.error('push', r.status, await r.text());
  } catch (e) {
    console.error('push', e);
  }
}
