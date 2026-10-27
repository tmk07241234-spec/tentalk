import type { RemoteTrack } from 'livekit-client';

export const audioSession = {
  start: async () => {},
  stop: async () => {},
};

/** Web: plays the partner's audio through a hidden <audio> element. */
export function attachAudio(track: RemoteTrack): () => void {
  const el = track.attach();
  el.style.display = 'none';
  document.body.appendChild(el);
  return () => {
    track.detach(el);
    el.remove();
  };
}
