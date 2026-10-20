import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecipes } from '@/hooks/useRecipes';
import { useRoomConfig } from '@/hooks/useRoomConfig';
import { RecipeCard } from '@/components/RecipeCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { CategoryBadge } from '@/components/CategoryBadge';
import { ALL_CATEGORIES, Category } from '@/types/recipe';
import { navigateSafely } from '@/utils/safeNavigation';
import { requestCrashViewer } from '@/services/crashViewer';
import { openScreenOverlay } from '@/services/screenOverlay';
import { recordBreadcrumb } from '@/services/crashTracker';

export default function HomeScreen() {
  const { recipes, loading, error, toggleFavorite, refresh } = useRecipes();
  const { config: roomConfig } = useRoomConfig();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const filteredRecipes = useMemo(() => {
    if (!selectedCategory) return recipes;
    return recipes.filter(r => r.category === selectedCategory);
  }, [recipes, selectedCategory]);

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
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <Text style={styles.headerSubtitle}>{recipes.length} recipes</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.roomChip}
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
                  color={Colors.primary}
                />
                <Text style={styles.roomChipText} numberOfLines={1}>
                  {roomConfig ? roomConfig.code : 'Set up sharing'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.crashButton}
                onPress={() => requestCrashViewer()}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Open crash reports"
              >
                <Ionicons name="bug-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.filterSection}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={ALL_CATEGORIES}
            keyExtractor={item => item}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => (
              <CategoryBadge
                category={item}
                selected={selectedCategory === item}
                onPress={() => setSelectedCategory(selectedCategory === item ? null : item)}
              />
            )}
          />
        </View>

        {filteredRecipes.length === 0 ? (
          <EmptyState
            icon="restaurant-outline"
            title={selectedCategory ? `No ${selectedCategory} recipes` : 'No recipes yet'}
            message={selectedCategory ? 'Try a different category' : 'Tap the + button to add your first recipe'}
          />
        ) : (
          <FlatList
            data={filteredRecipes}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.primary} />
            }
            renderItem={({ item }) => (
              <RecipeCard
                recipe={item}
                onPress={() => navigateSafely(`/recipe/${item.id}`, 'tap:recipe-detail')}
                onToggleFavorite={() => toggleFavorite(item.id, !item.isFavorite)}
              />
            )}
          />
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            recordBreadcrumb('tap:add-recipe');
            openScreenOverlay('add');
          }}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add recipe"
        >
          <Ionicons name="add" size={28} color={Colors.white} />
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
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
  crashButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.tipBackground,
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  filterSection: {
    marginBottom: Spacing.sm,
  },
  filterList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
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
