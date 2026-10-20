import { Stack, router, usePathname } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { initializeDatabase } from '@/db/schema';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StartupErrorScreen } from '@/components/StartupErrorScreen';
import { CrashReportsView } from '@/components/CrashReportsView';
import { Colors, Spacing, Typography } from '@/constants/theme';
import {
  captureException,
  initializeCrashTracker,
  recordBreadcrumb,
  setCurrentRoute,
} from '@/services/crashTracker';

initializeCrashTracker();

console.log('[STARTUP] JS startup');

export default function RootLayout() {
  const [dbError, setDbError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showCrashViewer, setShowCrashViewer] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setCurrentRoute(pathname);
  }, [pathname]);

  const bootstrapDatabase = useCallback(() => {
    setIsRetrying(true);
    initializeDatabase()
      .then(() => {
        console.log('[STARTUP] database ready');
        recordBreadcrumb('database:ready');
        setDbError(null);
      })
      .catch((error: unknown) => {
        const dbFailure = error instanceof Error ? error : new Error(String(error));
        recordBreadcrumb('database:failed');
        captureException(dbFailure, { source: 'database-init', isFatal: true });
        setDbError(dbFailure);
      })
      .finally(() => {
        setIsRetrying(false);
      });
  }, []);

  useEffect(() => {
    bootstrapDatabase();
  }, [bootstrapDatabase]);

  return (
    <>
      <ErrorBoundary onViewCrashReports={() => setShowCrashViewer(true)}>
        {dbError ? (
          <StartupErrorScreen
            error={dbError}
            onRetry={bootstrapDatabase}
            isRetrying={isRetrying}
            onViewCrashReports={() => setShowCrashViewer(true)}
          />
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
            <Stack.Screen
              name="ai/generate"
              options={{ title: 'AI Recipe Generator', presentation: 'modal' }}
            />
            <Stack.Screen
              name="ai/substitute"
              options={{ title: 'Ingredient Substitutions', presentation: 'modal' }}
            />
            <Stack.Screen name="crashes" options={{ title: 'Crash Reports' }} />
          </Stack>
        )}
      </ErrorBoundary>
      {showCrashViewer ? (
        <Modal
          visible
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowCrashViewer(false)}
        >
          <ErrorBoundary
            fallback={
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: Spacing.xxl,
                  backgroundColor: Colors.background,
                }}
              >
                <Text style={{ ...Typography.subtitle, textAlign: 'center' }}>
                  Crash reports could not be displayed
                </Text>
                <Text
                  style={{
                    ...Typography.bodySmall,
                    textAlign: 'center',
                    marginTop: Spacing.sm,
                    marginBottom: Spacing.lg,
                  }}
                >
                  The failure was recorded. Close this screen and try again.
                </Text>
                <TouchableOpacity onPress={() => setShowCrashViewer(false)} activeOpacity={0.8}>
                  <Text style={{ ...Typography.label, color: Colors.primary }}>Close</Text>
                </TouchableOpacity>
              </View>
            }
          >
            <CrashReportsView onClose={() => setShowCrashViewer(false)} />
          </ErrorBoundary>
        </Modal>
      ) : null}
    </>
  );
}
