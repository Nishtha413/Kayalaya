import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import Icon from '../components/Icon';
import { s, v, f } from '../utils/responsive';

import HomeScreen from '../screens/HomeScreen';
import JourneyScreen from '../screens/JourneyScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ROUTES: { name: keyof MainTabParamList; icon: string; label: string }[] = [
  { name: 'Home', icon: 'home-outline', label: 'Home' },
  { name: 'Journey', icon: 'compass-outline', label: 'Journey' },
  { name: 'Profile', icon: 'account-circle-outline', label: 'Profile' },
];

export default function MainTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: f(10), fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderRadius: s(22),
          marginHorizontal: s(14),
          marginBottom: v(14),
          height: v(62),
          paddingTop: v(6),
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 6,
        },
      }}
    >
      {TAB_ROUTES.map((r) => (
        <Tab.Screen
          key={r.name}
          name={r.name}
          component={
            r.name === 'Home'
              ? HomeScreen
              : r.name === 'Journey'
                ? JourneyScreen
                : ProfileScreen
          }
          options={{
            tabBarLabel: r.label,
            tabBarIcon: ({ color, size }) => (
              <Icon name={r.icon as any} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
