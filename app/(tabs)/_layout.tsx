import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '@/components/AppText';
import { AUTHORS } from '@/constants/authors';
import { Colors, Spacing } from '@/constants/theme';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useMember } from '@/hooks/useMember';
import { usePartnerPresence } from '@/hooks/usePartnerPresence';
import { useRoomConfig } from '@/hooks/useRoomConfig';

const styles = StyleSheet.create({
  headerName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});

export default function TabLayout() {
  const { fontFamily, theme, design, displayFamily } = useAppearance();
  const member = useMember();
  const { config } = useRoomConfig();
  const partner = usePartnerPresence(config, member);
  const partnerLabel = partner ? AUTHORS[partner].label : null;
  const showPartnerOnLeft = member === 'princess' && partnerLabel !== null;
  const showPartnerOnRight = member === 'daddy' && partnerLabel !== null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: design.cardShadow === 'hard' ? theme.border : theme.borderLight,
          borderTopWidth: Math.max(design.cardBorderWidth, 1),
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '500',
          fontFamily,
        },
        sceneStyle: {
          backgroundColor: 'transparent',
        },
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.primary,
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          fontFamily: displayFamily ?? fontFamily,
          color: theme.text,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Recipes',
          headerLeft:
            showPartnerOnLeft && partnerLabel
              ? () => (
                  <Text style={[styles.headerName, { color: theme.textSecondary }]} numberOfLines={1}>
                    {partnerLabel}
                  </Text>
                )
              : undefined,
          headerLeftContainerStyle: {
            paddingLeft: Spacing.md,
          },
          headerRight:
            showPartnerOnRight && partnerLabel
              ? () => (
                  <Text style={[styles.headerName, { color: theme.textSecondary }]} numberOfLines={1}>
                    {partnerLabel}
                  </Text>
                )
              : undefined,
          headerRightContainerStyle: {
            paddingRight: Spacing.md,
          },
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI Tools',
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="customize"
        options={{
          title: 'Customize',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="color-palette-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cheat-sheet"
        options={{
          title: 'Cheat Sheet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
