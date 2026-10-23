import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '@/components/AppText';
import { useRecipes } from '@/hooks/useRecipes';
import { useRoomConfig } from '@/hooks/useRoomConfig';
import { RecipeRolodex } from '@/components/RecipeRolodex';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAppearance } from '@/contexts/AppearanceContext';
import { navigateSafely } from '@/utils/safeNavigation';
import { requestCrashViewer } from '@/services/crashViewer';
import { openScreenOverlay } from '@/services/screenOverlay';
import { recordBreadcrumb } from '@/services/crashTracker';

export default function HomeScreen() {
  const { theme, displayFamily } = useAppearance();
  const { recipes, loading, error, toggleFavorite, refresh } = useRecipes();
  const { config: roomConfig } = useRoomConfig();

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Something went wrong"
        message={error}
      />
    );
  }

  return (
    <ErrorBoundary>
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandBlock}>
              <Text style={[styles.brandTitle, { fontFamily: displayFamily }]}>Recipe Vault</Text>
              <View style={[styles.brandRule, { backgroundColor: theme.accent }]} />
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: theme.tipBackground }]}
                onPress={() => void refresh()}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Refresh recipes"
              >
                <Ionicons name="refresh-outline" size={18} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: theme.tipBackground }]}
                onPress={() => requestCrashViewer()}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Open crash reports"
              >
                <Ionicons name="bug-outline" size={18} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerMetaRow}>
            <Text style={styles.headerSubtitle}>
              {`${recipes.length} recipes`}
            </Text>
            <TouchableOpacity
              style={[styles.roomChip, { backgroundColor: theme.tipBackground }]}
              onPress={() => {
                recordBreadcrumb('tap:room-settings');
                openScreenOverlay('settings');
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Open shared room settings"
            >
              <Ionicons
                name={roomConfig ? 'people' : 'people-outline'}
                size={14}
                color={theme.primary}
              />
              <Text style={styles.roomChipText} numberOfLines={1}>
                {roomConfig ? roomConfig.code : 'Set up sharing'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {recipes.length === 0 ? (
          <EmptyState
            icon="restaurant-outline"
            title="No recipes yet"
            message="Tap the + button to add your first recipe"
          />
        ) : (
          <View style={styles.deck}>
            <RecipeRolodex
              recipes={recipes}
              onOpen={(recipe) =>
                navigateSafely(`/recipe/${recipe.id}`, 'tap:recipe-detail')
              }
              onToggleFavorite={(recipe) => toggleFavorite(recipe.id, !recipe.isFavorite)}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
          onPress={() => {
            recordBreadcrumb('tap:add-recipe');
            openScreenOverlay('add');
          }}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add recipe"
        >
          <Ionicons name="add" size={28} color={theme.white} />
        </TouchableOpacity>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  brandBlock: {
    flexShrink: 1,
  },
  brandTitle: {
    ...Typography.title,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  brandRule: {
    height: 3,
    width: 38,
    borderRadius: 2,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  roomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 150,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    backgroundColor: Colors.tipBackground,
  },
  roomChipText: {
    ...Typography.label,
    fontSize: 11,
    flexShrink: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.tipBackground,
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    letterSpacing: 0.3,
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  deck: {
    flex: 1,
    paddingBottom: 88,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xxl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
