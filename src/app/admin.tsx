import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useNow } from '@/components/people';
import { Sheet } from '@/components/Sheet';
import { Body, Button, Card, Screen, Title } from '@/components/ui';
import { MODERATION_ACTIONS, type ModerationAction } from '@/domain/moderation';
import { api } from '@/services/api';
import { space, useColors } from '@/theme/colors';

interface ReportRow {
  id: string;
  reason: string;
  createdAt: number;
  by: { id: string; name: string };
  against: { id: string; name: string; reportsIn30Days: number; suspendedUntil: number };
}

/**
 * Operators only (the server checks): open reports and the four decisions. Each
 * decision is applied on the server and reaches both people's apps.
 */
export default function Admin() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const [reports, setReports] = useState<ReportRow[] | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<{ report: ReportRow; action: ModerationAction } | null>(null);
  const [busy, setBusy] = useState(false);
  const date = (ms: number) => new Date(ms).toLocaleString(i18n.language);

  // Bumped after each decision to load the list again.
  const [version, setVersion] = useState(0);
  const now = useNow();
  useEffect(() => {
    let stale = false;
    api<{ reports: ReportRow[] }>('/api/admin', undefined, 'GET')
      .then((r) => { if (!stale) { setReports(r.reports); setError(''); } })
      .catch((e: { status?: number }) => { if (!stale) setError(e.status === 403 ? t('admin.forbidden') : t('admin.loadFailed')); });
    return () => { stale = true; };
  }, [version, t]);

  const decide = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      await api('/api/admin', { id: pending.report.id, action: pending.action });
      setPending(null);
      setVersion((v) => v + 1);
    } catch {
      setError(t('admin.actFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen footer={<Button label={t('common.close')} onPress={() => router.back()} />}>
      <Title>{t('admin.title')}</Title>
      <Body small muted>{t('admin.note')}</Body>
      {error ? <Body style={{ color: c.bad }}>{error}</Body> : null}
      {reports === null && !error ? <Body muted>{t('common.loading')}</Body> : null}
      {reports?.length === 0 ? <Body muted>{t('admin.empty')}</Body> : null}
      {reports?.map((r) => (
        <Card key={r.id} style={{ gap: space.sm }}>
          <Text style={{ color: c.ink, fontWeight: '700', fontSize: 15 }}>{t(`call.reasons.${r.reason}`, { defaultValue: r.reason })}</Text>
          <Body small muted>{date(r.createdAt)}</Body>
          <Body small>{t('admin.against', { name: r.against.name, n: r.against.reportsIn30Days })}</Body>
          {r.against.suspendedUntil > now ? <Body small style={{ color: c.bad }}>{t('admin.suspendedUntil', { date: date(r.against.suspendedUntil) })}</Body> : null}
          <Body small muted>{t('admin.by', { name: r.by.name })}</Body>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {MODERATION_ACTIONS.map((a) => (
              <Button key={a} small variant={a === 'dismiss' ? 'secondary' : 'danger'} label={t(`admin.actions.${a}`)} onPress={() => setPending({ report: r, action: a })} />
            ))}
          </View>
        </Card>
      ))}

      <Sheet visible={pending !== null} onClose={() => setPending(null)}>
        <Title>{pending ? t(`admin.actions.${pending.action}`) : ''}</Title>
        <Body muted>{pending ? t(`admin.explain.${pending.action}`, { against: pending.report.against.name, by: pending.report.by.name }) : ''}</Body>
        <Button variant="primary" label={t('admin.confirm')} loading={busy} onPress={decide} />
        <Button label={t('common.cancel')} onPress={() => setPending(null)} />
      </Sheet>
    </Screen>
  );
}
