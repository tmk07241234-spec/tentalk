import { SignJWT } from 'jose';

/** A LiveKit access token that lets one person join one call's room with audio and data. */
export async function roomToken(input: { room: string; identity: string; name: string }): Promise<{ url: string; token: string }> {
  const key = process.env.LIVEKIT_API_KEY;
  const secret = process.env.LIVEKIT_API_SECRET;
  const url = process.env.LIVEKIT_URL;
  if (!key || !secret || !url) throw new Error('LiveKit settings are missing');
  const now = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({
    name: input.name,
    video: { room: input.room, roomJoin: true, canPublish: true, canSubscribe: true, canPublishData: true },
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(key).setSubject(input.identity).setJti(input.identity)
    .setNotBefore(now).setExpirationTime(now + 2 * 3600)
    .sign(new TextEncoder().encode(secret));
  return { url, token };
}
