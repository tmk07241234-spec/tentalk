import { Room, RoomEvent, Track, type Participant } from 'livekit-client';

import { attachAudio, audioSession } from './setup';

/** Messages the two apps send each other during a call. */
export type CallMessage = { t: 'question'; id: string };

export interface CallRoomEvents {
  onPartnerJoined: () => void;
  onPartnerLeft: () => void;
  onMessage: (m: CallMessage) => void;
  /** Whether anyone in the call is speaking right now. */
  onSpeaking: (anyone: boolean) => void;
  /** The browser blocked sound until the user taps something. */
  onAudioBlocked: (blocked: boolean) => void;
  /** Lost the connection for good (LiveKit already retried). */
  onDisconnected: () => void;
}

export interface CallRoom {
  send: (m: CallMessage) => void;
  setMuted: (muted: boolean) => Promise<void>;
  /** Unblocks sound; call from a tap. */
  startAudio: () => Promise<void>;
  leave: () => Promise<void>;
}

/** Joins the audio room of a matched call with the microphone on. */
export async function joinCallRoom(url: string, token: string, events: CallRoomEvents): Promise<CallRoom> {
  const room = new Room({ adaptiveStream: false, dynacast: false });
  const detach = new Map<string, () => void>();
  let leaving = false;

  const partnerHere = () => room.remoteParticipants.size > 0;
  room
    .on(RoomEvent.ParticipantConnected, () => events.onPartnerJoined())
    .on(RoomEvent.ParticipantDisconnected, () => { if (!partnerHere()) events.onPartnerLeft(); })
    .on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Audio) detach.set(track.sid ?? String(detach.size), attachAudio(track));
    })
    .on(RoomEvent.TrackUnsubscribed, (track) => {
      detach.get(track.sid ?? '')?.();
      detach.delete(track.sid ?? '');
    })
    .on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => events.onSpeaking(speakers.length > 0))
    .on(RoomEvent.AudioPlaybackStatusChanged, () => events.onAudioBlocked(!room.canPlaybackAudio))
    .on(RoomEvent.DataReceived, (payload) => {
      try {
        events.onMessage(JSON.parse(new TextDecoder().decode(payload)) as CallMessage);
      } catch {
        // ignore messages from other app versions
      }
    })
    .on(RoomEvent.Disconnected, () => { if (!leaving) events.onDisconnected(); });

  await audioSession.start();
  await room.connect(url, token);
  await room.localParticipant.setMicrophoneEnabled(true);
  if (partnerHere()) events.onPartnerJoined();
  if (!room.canPlaybackAudio) events.onAudioBlocked(true);

  return {
    send: (m) => { void room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(m)), { reliable: true }); },
    setMuted: async (muted) => { await room.localParticipant.setMicrophoneEnabled(!muted); },
    startAudio: async () => { await room.startAudio(); events.onAudioBlocked(!room.canPlaybackAudio); },
    leave: async () => {
      leaving = true;
      detach.forEach((d) => d());
      await room.disconnect();
      await audioSession.stop();
    },
  };
}
