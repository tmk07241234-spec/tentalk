import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router/tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useApp } from '@/state/store';
import { useColors } from '@/theme/colors';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; label: string; icon: IconName }[] = [
  { name: 'home', label: 'tabs.home', icon: 'call-outline' },
  { name: 'find', label: 'tabs.find', icon: 'search' },
  { name: 'connections', label: 'tabs.connections', icon: 'people-outline' },
  { name: 'notifications', label: 'tabs.notifications', icon: 'notifications-outline' },
  { name: 'history', label: 'tabs.history', icon: 'time-outline' },
  { name: 'me', label: 'tabs.me', icon: 'person-outline' },
];

export default function TabsLayout() {
  const { t } = useTranslation();
  const c = useColors();
  const unread = useApp((s) => s.notifications.filter((n) => !n.read).length);
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: c.learn,
      tabBarInactiveTintColor: c.muted,
      tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.line },
      sceneStyle: { backgroundColor: c.bg },
    }}>
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{
          title: t(tab.label),
          tabBarIcon: ({ color, size }) => <Ionicons name={tab.icon} size={size} color={color as string} />,
          tabBarBadge: tab.name === 'notifications' && unread > 0 ? unread : undefined,
        }} />
      ))}
    </Tabs>
  );
}
