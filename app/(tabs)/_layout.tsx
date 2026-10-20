import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';

const styles = StyleSheet.create({
  headerName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.borderLight,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.primary,
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Recipes',
          headerLeft: () => (
            <Text style={styles.headerName} numberOfLines={1}>
              daddy 🍆
            </Text>
          ),
          headerLeftContainerStyle: {
            paddingLeft: Spacing.md,
          },
          headerRight: () => (
            <Text style={styles.headerName} numberOfLines={1}>
              princess 🍑
            </Text>
          ),
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
    </Tabs>
  );
}
