import { Stack, usePathname } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  BackHandler,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { initializeDatabase } from '@/db/schema';
import AddRecipeScreen from '@/app/add';
import AIRecipeLookupScreen from '@/app/ai/lookup';
import AICreatorScreen from '@/app/ai/creator';
import AISubstituteScreen from '@/app/ai/substitute';
import { AppText as Text } from '@/components/AppText';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StartupErrorScreen } from '@/components/StartupErrorScreen';
import { ThemePagePattern } from '@/components/ThemePagePattern';
import { CrashReportsView } from '@/components/CrashReportsView';
import { RoomSetupView } from '@/components/RoomSetupView';
import { SyncStatusView } from '@/components/SyncStatusView';
import { AppearanceProvider, useAppearance } from '@/contexts/AppearanceContext';
import { AssistantProvider } from '@/contexts/AssistantContext';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { readableTextColor } from '@/constants/appearance';
import {
  acknowledgeCrash,
  captureException,
  getLatestUnacknowledgedFatalCrash,
  initializeCrashTracker,
  recordBreadcrumb,
  setCurrentRoute,
} from '@/services/crashTracker';
import { subscribeToCrashViewer } from '@/services/crashViewer';
import { syncRecipes } from '@/services/recipeSync';
import {
  closeScreenOverlay,
  getScreenOverlay,
  subscribeToScreenOverlay,
  type OverlayScreen,
} from '@/services/screenOverlay';

initializeCrashTracker();

console.log('[STARTUP] JS startup');

const OVERLAY_TITLES: Record<OverlayScreen, string> = {
  add: 'Add Recipe',
  'ai-lookup': 'Recipe Name Lookup',
  'ai-creator': 'Recipe Creator',
  'ai-substitute': 'Ingredient Substitutions',
  settings: 'Shared Room',
  'sync-status': 'Connection Status',
};

function syncInBackground(source: string): void {
  syncRecipes().catch((error) => {
    console.warn(`[SYNC] ${source} failed`, error);
    recordBreadcrumb(`sync:${source}-failed`);
  });
}

export default function RootLayout() {
  return (
    <AppearanceProvider>
      <AssistantProvider>
        <RootLayoutContent />
      </AssistantProvider>
    </AppearanceProvider>
  );
}

function RootLayoutContent() {
  const { fontFamily, fontColor, theme } = useAppearance();
  const headerTextColor = readableTextColor(fontColor, theme.background, theme.text);
  const [dbError, setDbError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showCrashViewer, setShowCrashViewer] = useState(false);
  const [overlayScreen, setOverlayScreen] = useState<OverlayScreen | null>(() =>
    getScreenOverlay()
  );
  const pathname = usePathname();

  useEffect(() => {
    setCurrentRoute(pathname);
  }, [pathname]);

  useEffect(() => subscribeToCrashViewer(() => setShowCrashViewer(true)), []);

  useEffect(() => subscribeToScreenOverlay(setOverlayScreen), []);

  useEffect(() => {
    if (!overlayScreen && !showCrashViewer) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showCrashViewer) {
        setShowCrashViewer(false);
      } else {
        closeScreenOverlay();
      }
      return true;
    });

    return () => subscription.remove();
  }, [overlayScreen, showCrashViewer]);

  const bootstrapDatabase = useCallback(() => {
    setIsRetrying(true);
    initializeDatabase()
      .then(() => {
        console.log('[STARTUP] database ready');
        recordBreadcrumb('database:ready');
        setDbError(null);
        syncInBackground('startup');
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

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        syncInBackground('active');
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;

    getLatestUnacknowledgedFatalCrash().then((report) => {
      if (cancelled || !report) {
        return;
      }

      Alert.alert(
        'Recipe Vault AI closed unexpectedly',
        `${report.name}: ${report.message}`,
        [
          {
            text: 'View reports',
            onPress: () => {
              setShowCrashViewer(true);
            },
          },
          {
            text: 'Dismiss',
            style: 'cancel',
            onPress: () => acknowledgeCrash(report.fingerprint),
          },
        ]
      );
    });

    return () => {
      cancelled = true;
    };
  }, [dbError]);

  const failed = dbError;
  const screenOverlay = overlayScreen;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ThemePagePattern />
      <ErrorBoundary onViewCrashReports={() => setShowCrashViewer(true)}>
        {failed ? (
          <StartupErrorScreen
            error={failed}
            onRetry={bootstrapDatabase}
            isRetrying={isRetrying}
            onViewCrashReports={() => setShowCrashViewer(true)}
          />
        ) : (
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.background,
              },
              headerTintColor: headerTextColor,
              headerTitleStyle: {
                fontWeight: '600',
                fontFamily,
                color: headerTextColor,
              },
              headerShadowVisible: false,
              contentStyle: {
                backgroundColor: 'transparent',
              },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="add" options={{ title: 'Add Recipe' }} />
            <Stack.Screen name="edit" options={{ title: 'Edit Recipe' }} />
            <Stack.Screen name="recipe/[id]" options={{ title: 'Recipe Details' }} />
            <Stack.Screen name="ai/substitute" options={{ title: 'Ingredient Substitutions' }} />
            <Stack.Screen name="crashes" options={{ title: 'Crash Reports' }} />
          </Stack>
        )}
      </ErrorBoundary>
      {screenOverlay ? (
        <View style={[styles.overlay, styles.transparentOverlay]}>
          <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
            <View
              style={[
                styles.overlayHeader,
                { backgroundColor: theme.background, borderBottomColor: theme.borderLight },
              ]}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeScreenOverlay}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={26} color={theme.primary} />
              </TouchableOpacity>
              <Text style={styles.overlayTitle}>{OVERLAY_TITLES[screenOverlay]}</Text>
              <View style={styles.headerSpacer} />
            </View>
            <View style={styles.overlayContent}>
              {screenOverlay === 'add' ? (
                <AddRecipeScreen onClose={closeScreenOverlay} />
              ) : screenOverlay === 'ai-lookup' ? (
                <AIRecipeLookupScreen onClose={closeScreenOverlay} />
              ) : screenOverlay === 'ai-creator' ? (
                <AICreatorScreen onClose={closeScreenOverlay} />
              ) : screenOverlay === 'settings' ? (
                <ErrorBoundary>
                  <RoomSetupView onClose={closeScreenOverlay} />
                </ErrorBoundary>
              ) : screenOverlay === 'sync-status' ? (
                <ErrorBoundary>
                  <SyncStatusView onClose={closeScreenOverlay} />
                </ErrorBoundary>
              ) : (
                <AISubstituteScreen />
              )}
            </View>
          </SafeAreaView>
        </View>
      ) : null}
      {showCrashViewer ? (
        <View style={[styles.overlay, styles.transparentOverlay]}>
          <ErrorBoundary
            fallback={
              <View style={[styles.fallback, { backgroundColor: theme.background }]}>
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
                  <Text style={{ ...Typography.label, color: theme.primary }}>Close</Text>
                </TouchableOpacity>
              </View>
            }
          >
            <CrashReportsView onClose={() => setShowCrashViewer(false)} />
          </ErrorBoundary>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
  },
  transparentOverlay: {
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  overlayTitle: {
    ...Typography.subtitle,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 34,
  },
  overlayContent: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    backgroundColor: Colors.background,
  },
});
