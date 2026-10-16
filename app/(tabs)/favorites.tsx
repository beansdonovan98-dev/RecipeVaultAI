import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import * as db from '@/db';
import { Recipe } from '@/types/recipe';
import { RecipeCard } from '@/components/RecipeCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await db.getFavoriteRecipes();
      setFavorites(data);
    } catch (e) {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
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
                await db.toggleFavorite(item.id, false);
                loadFavorites();
              }}
            />
          )}
        />
      )}
    </View>
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
