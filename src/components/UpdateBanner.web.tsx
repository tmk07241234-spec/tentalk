import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

const CHECK_MS = 5 * 60_000;
const entryOf = (html: string) => html.match(/\/_expo\/static\/js\/web\/entry-[a-f0-9]+\.js/)?.[0] ?? null;

/**
 * A tab left open keeps running the version it loaded. Every few minutes (and when the
 * tab comes back into view) this compares the published page's script with the one
 * running, and offers a reload when they differ.
 */
export function UpdateBanner() {
  const { t } = useTranslation();
  const [stale, setStale] = useState(false);

  useEffect(() => {
    const running = [...document.scripts].map((s) => s.src.replace(location.origin, '')).find((src) => entryOf(src));
    if (!running) return; // development server
    const check = async () => {
      try {
        const html = await (await fetch('/', { cache: 'no-store' })).text();
        const latest = entryOf(html);
        if (latest && latest !== running) setStale(true);
      } catch {
        // offline: try later
      }
    };
    const onVisible = () => { if (document.visibilityState === 'visible') void check(); };
    const timer = setInterval(check, CHECK_MS);
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  if (!stale) return null;
  return (
    <Pressable accessibilityRole="button" onPress={() => location.reload()}
      style={{ position: 'absolute', left: 16, right: 16, bottom: 90, backgroundColor: '#14204F', borderRadius: 14, padding: 14, alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '700' }}>{t('common.updateReady')}</Text>
    </Pressable>
  );
}
