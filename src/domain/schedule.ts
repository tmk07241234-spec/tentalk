/**
 * "Available hours" are stored in each person's own local time with their UTC
 * offset, and shown to the viewer converted into the viewer's local time.
 */
export interface HoursRange {
  start: string; // "HH:MM"
  end: string; // "HH:MM", "24:00" allowed
}

const DAY = 24 * 60;

export function parseHM(hm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 24 || min > 59 || (h === 24 && min > 0)) return null;
  return h * 60 + min;
}

export function formatHM(minutes: number): string {
  const m = ((minutes % DAY) + DAY) % DAY;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function isValidRange(r: HoursRange): boolean {
  const s = parseHM(r.start);
  const e = parseHM(r.end);
  return s !== null && e !== null && s % DAY !== e % DAY;
}

/** Converts a range from one UTC offset (minutes) to another. */
export function shiftRange(r: HoursRange, fromOffset: number, toOffset: number): HoursRange {
  const d = toOffset - fromOffset;
  return { start: formatHM(parseHM(r.start)! + d), end: formatHM(parseHM(r.end)! + d) };
}

/** Whether `minutesOfDay` falls inside the range; ranges may wrap past midnight. */
export function isWithin(r: HoursRange, minutesOfDay: number): boolean {
  const s = parseHM(r.start)! % DAY;
  const e = parseHM(r.end)! % DAY;
  const t = ((minutesOfDay % DAY) + DAY) % DAY;
  return s < e ? t >= s && t < e : t >= s || t < e;
}

/** Clock time ("HH:MM") at a given UTC offset. */
export function clockAt(offsetMinutes: number, now: Date): string {
  return formatHM(now.getUTCHours() * 60 + now.getUTCMinutes() + offsetMinutes);
}

/** UTC offset of this device in minutes east of UTC (e.g. Japan = 540). */
export function deviceOffset(now: Date = new Date()): number {
  return -now.getTimezoneOffset();
}

export const ONLINE_REQUEST_SECONDS = 60;
export const OFFLINE_REQUEST_HOURS = 24;
/** An accepted request can still be called for this long after the requester missed the ring. */
export const ACCEPTED_CALLABLE_HOURS = 24;

export function requestExpiresAt(now: Date, partnerOnline: boolean): Date {
  return new Date(now.getTime() + (partnerOnline ? ONLINE_REQUEST_SECONDS * 1000 : OFFLINE_REQUEST_HOURS * 3600 * 1000));
}
