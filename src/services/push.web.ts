/** The web version has no push notifications; requests arrive while the page is open. */
export async function registerForPush(_uid: string, _lang: string): Promise<void> {}

export function startPushResponses(): () => void {
  return () => {};
}
