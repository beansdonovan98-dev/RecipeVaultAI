import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import '@/utils/errorHandler';
import { initializeDatabase } from '@/db/schema';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StartupErrorScreen } from '@/components/StartupErrorScreen';
import { Colors } from '@/constants/theme';

console.log('[STARTUP] JS startup');

export default function RootLayout() {
  const [dbError, setDbError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const bootstrapDatabase = useCallback(() => {
    setIsRetrying(true);
    initializeDatabase()
      .then(() => {
        console.log('[STARTUP] database ready');
        setDbError(null);
      })
      .catch((error: unknown) => {
        setDbError(error instanceof Error ? error : new Error(String(error)));
      })
      .finally(() => {
        setIsRetrying(false);
      });
  }, []);

  useEffect(() => {
    bootstrapDatabase();
  }, [bootstrapDatabase]);

  return (
    <ErrorBoundary>
      {dbError ? (
        <StartupErrorScreen error={dbError} onRetry={bootstrapDatabase} isRetrying={isRetrying} />
      ) : (
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
          <Stack.Screen name="add" options={{ title: 'Add Recipe', presentation: 'modal' }} />
          <Stack.Screen name="edit" options={{ title: 'Edit Recipe', presentation: 'modal' }} />
          <Stack.Screen name="recipe/[id]" options={{ title: 'Recipe Details' }} />
          <Stack.Screen name="ai/generate" options={{ title: 'AI Recipe Generator', presentation: 'modal' }} />
          <Stack.Screen name="ai/substitute" options={{ title: 'Ingredient Substitutions', presentation: 'modal' }} />
        </Stack>
      )}
    </ErrorBoundary>
  );
}
