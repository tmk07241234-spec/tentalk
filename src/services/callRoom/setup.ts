import { AudioSession, registerGlobals } from '@livekit/react-native';
import type { RemoteTrack } from 'livekit-client';

registerGlobals();

/** Native: route call audio like a phone call while the room is open. */
export const audioSession = {
  start: () => AudioSession.startAudioSession(),
  stop: () => AudioSession.stopAudioSession(),
};

/** Native plays remote audio by itself. */
export function attachAudio(_track: RemoteTrack): () => void {
  return () => {};
}
