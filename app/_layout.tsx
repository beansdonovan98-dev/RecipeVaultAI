import { Stack } from 'expo-router';
import { useEffect } from 'react';
import '@/utils/errorHandler';
import { initializeDatabase } from '@/db/schema';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  useEffect(() => {
    initializeDatabase().catch((err) => {
      console.error('[DB INIT] Database initialization failed:', err);
    });
  }, []);

  return (
    <ErrorBoundary>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add" options={{ presentation: 'modal', title: 'Add Recipe' }} />
        <Stack.Screen name="edit" options={{ presentation: 'modal', title: 'Edit Recipe' }} />
        <Stack.Screen name="recipe/[id]" options={{ title: 'Recipe Details' }} />
        <Stack.Screen name="ai/generate" options={{ presentation: 'modal', title: 'AI Recipe Generator' }} />
        <Stack.Screen name="ai/substitute" options={{ presentation: 'modal', title: 'Ingredient Substitutions' }} />
      </Stack>
    </ErrorBoundary>
  );
}
