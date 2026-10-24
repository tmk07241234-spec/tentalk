import { useTranslation } from 'react-i18next';

import { Body, Screen, Title } from '@/components/ui';

/** Tabs that are planned for the next milestone. */
export function Placeholder({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  return (
    <Screen>
      <Title>{t(titleKey)}</Title>
      <Body muted>{t('placeholder.body')}</Body>
    </Screen>
  );
}
