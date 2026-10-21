import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText as Text } from '@/components/AppText';
import * as db from '@/db';
import { Recipe } from '@/types/recipe';
import { RecipeCard } from '@/components/RecipeCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { captureException, recordBreadcrumb } from '@/services/crashTracker';
import { notifyDataChanged, subscribeToDataChanges } from '@/services/dataEvents';
import { syncRecipes } from '@/services/recipeSync';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAppearance } from '@/contexts/AppearanceContext';

export default function FavoritesScreen() {
  const { theme } = useAppearance();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoading(true);
      }
      const data = await db.getFavoriteRecipes();
      setFavorites(data);
    } catch (e) {
      captureException(e, { source: 'favorites.loadFavorites' });
      setFavorites([]);
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadFavorites(true);
    return subscribeToDataChanges(() => loadFavorites(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <ErrorBoundary>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favorites</Text>
          <Text style={styles.headerSubtitle}>{favorites.length} saved</Text>
        </View>

        {favorites.length === 0 ? (
          <EmptyState
            icon="heart-outline"
            title="No favorites yet"
            message="Tap the heart icon on any recipe to save it here"
          />
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <RecipeCard
                recipe={item}
                onPress={() => router.push(`/recipe/${item.id}`)}
                onToggleFavorite={async () => {
                  try {
                    await db.toggleFavorite(item.id, false);
                    notifyDataChanged();
                    syncRecipes().catch((syncError) => {
                      console.warn('[SYNC] favorite sync failed', syncError);
                      recordBreadcrumb('sync:favorite-failed');
                    });
                  } catch (e) {
                    captureException(e, {
                      source: 'favorites.removeFavorite',
                      extra: { recipeId: item.id },
                    });
                  }
                }}
              />
            )}
          />
        )}
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
  headerTitle: {
    ...Typography.title,
    fontSize: 32,
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
});
