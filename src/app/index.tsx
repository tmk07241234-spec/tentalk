import { Redirect } from 'expo-router';

import { useApp } from '@/state/store';

export default function Index() {
  const { account, profile, onboarded } = useApp();
  if (onboarded) return <Redirect href="/home" />;
  // Signed up but closed the app during the guide: resume there.
  if (account && profile) return <Redirect href="/guide" />;
  return <Redirect href="/welcome" />;
}
