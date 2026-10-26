import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { SmallChips } from '@/components/people';
import { Body, Button, Card, ChoiceChips, ErrorText, Field, Screen, Title } from '@/components/ui';
import { LICENSES, legalDoc, type DocId } from '@/data/legal';
import { auth, authErrorKind } from '@/services/auth';
import { cloud } from '@/services/cloud';
import { support, type InquiryKind } from '@/services/support';
import { useApp } from '@/state/store';
import { space, useColors } from '@/theme/colors';

const DOCS: DocId[] = ['terms', 'privacy', 'guidelines', 'tokusho', 'faq'];

/** Terms, privacy, guidelines, commercial disclosure, FAQ, licenses, contact, and account deletion. */
export default function InfoPage() {
  const { page } = useLocalSearchParams<{ page: string }>();
  if (page === 'contact') return <Contact />;
  if (page === 'delete') return <DeleteAccount />;
  if (page === 'licenses') return <Licenses />;
  if (DOCS.includes(page as DocId)) return <Doc id={page as DocId} />;
  return null;
}

function Close() {
  const c = useColors();
  const { t } = useTranslation();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={() => router.back()} style={{ alignSelf: 'flex-end', padding: 4 }}>
      <Ionicons name="close" size={24} color={c.muted} />
    </Pressable>
  );
}

function Doc({ id }: { id: DocId }) {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const { doc, fallback } = legalDoc(id, i18n.language);
  return (
    <Screen>
      <Close />
      <Title>{doc.title}</Title>
      {doc.updated ? <Body small muted>{doc.updated}</Body> : null}
      {fallback ? <Body small muted>{t('info.englishOnly')}</Body> : null}
      {__DEV__ ? <Card style={{ backgroundColor: c.nativeSoft }}><Body small>{t('info.draftNote')}</Body></Card> : null}
      {doc.sections.map((s) => (
        <View key={s.h} style={{ gap: 6 }}>
          <Text accessibilityRole="header" style={{ color: c.ink, fontWeight: '700', fontSize: 15 }}>{s.h}</Text>
          {s.p.map((para) => <Body key={para}>{para}</Body>)}
        </View>
      ))}
    </Screen>
  );
}

function Licenses() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Close />
      <Title>{t('info.licenses')}</Title>
      <Body small muted>{t('info.licensesNote')}</Body>
      <Card>
        {LICENSES.map(([name, version, license]) => (
          <View key={name} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.md }}>
            <Body small style={{ flexShrink: 1 }}>{name} {version}</Body>
            <Body small muted>{license}</Body>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

function Contact() {
  const { t } = useTranslation();
  const email = useApp((s) => s.account?.email ?? null);
  const [kind, setKind] = useState<InquiryKind>('bug');
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState(email ?? '');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const send = async () => {
    if (message.trim().length < 10) return setError(t('info.contactTooShort'));
    setState('sending');
    await support.sendInquiry({ kind, message: message.trim(), replyTo: replyTo.trim() || null });
    setState('sent');
  };

  if (state === 'sent') {
    return (
      <Screen footer={<Button variant="primary" label={t('common.close')} onPress={() => router.back()} />}>
        <Title>{t('info.contactSent')}</Title>
        <Body muted>{t('info.contactSentBody')}</Body>
      </Screen>
    );
  }

  return (
    <Screen footer={<Button variant="primary" label={t('info.send')} loading={state === 'sending'} onPress={send} />}>
      <Close />
      <Title>{t('info.contact')}</Title>
      <ChoiceChips<InquiryKind> label={t('info.contactKind')} value={kind} onChange={setKind}
        options={(['bug', 'account', 'payment', 'safety', 'other'] as const).map((k) => ({ key: k, label: t(`info.kinds.${k}`) }))} />
      <Field label={t('info.contactMessage')} value={message} onChangeText={(v) => { setMessage(v); setError(''); }} multiline maxLength={2000}
        style={{ minHeight: 140, textAlignVertical: 'top' }} />
      <Field label={t('info.contactReply')} value={replyTo} onChangeText={setReplyTo} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
      <ErrorText>{error}</ErrorText>
    </Screen>
  );
}

function DeleteAccount() {
  const { t } = useTranslation();
  const c = useColors();
  const signOut = useApp((s) => s.signOut);
  // Email accounts confirm with their password; Firebase requires a recent sign-in to delete.
  const usesPassword = useApp((s) => s.account?.method === 'email' && !!s.account.uid);
  const [step, setStep] = useState<'explain' | 'confirm' | 'deleting'>('explain');
  const [reason, setReason] = useState('none');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const remove = async () => {
    if (usesPassword && !password) return setError(t('info.deletePasswordRequired'));
    setStep('deleting');
    setError('');
    try {
      if (usesPassword) await auth.reauthenticate(password);
      else if (auth.needsReauth()) await auth.reauthenticate();
    } catch (e) {
      setStep('confirm');
      const kind = authErrorKind(e);
      if (kind === 'cancelled') return;
      return setError(kind === 'wrong-password' ? t('email.wrongPassword') : kind === 'too-many-requests' ? t('email.tooMany') : t('info.deleteFailed'));
    }
    try {
      await support.deleteAccount();
      await auth.deleteAccount((uid) => cloud.remove(uid));
    } catch {
      setStep('confirm');
      return setError(t('info.deleteFailed'));
    }
    signOut();
    router.replace('/welcome');
  };

  return (
    <Screen>
      <Close />
      <Title>{t('info.deleteTitle')}</Title>
      <Body>{t('info.deleteBody')}</Body>
      <Card style={{ backgroundColor: c.nativeSoft }}>
        <Body small>{t('info.deleteSubscription')}</Body>
      </Card>
      <Body small muted>{t('info.deleteReason')}</Body>
      <SmallChips label={t('info.deleteReason')} value={reason} onChange={setReason}
        options={['none', 'noPartners', 'notUseful', 'safety', 'other'].map((k) => ({ key: k, label: t(`info.reasons.${k}`) }))} />
      {step === 'explain' ? (
        <Button variant="danger" label={t('info.deleteContinue')} onPress={() => setStep('confirm')} />
      ) : (
        <>
          <Body>{t('info.deleteConfirm')}</Body>
          {usesPassword ? (
            <Field label={t('info.deletePassword')} value={password} onChangeText={(v) => { setPassword(v); setError(''); }}
              secureTextEntry autoCapitalize="none" autoComplete="current-password" textContentType="password" onSubmitEditing={remove} />
          ) : null}
          <Button variant="danger" label={t('info.deleteNow')} loading={step === 'deleting'} onPress={remove} />
          <ErrorText>{error}</ErrorText>
          <Button label={t('common.cancel')} onPress={() => router.back()} />
        </>
      )}
    </Screen>
  );
}
