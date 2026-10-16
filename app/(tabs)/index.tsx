import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRecipes } from '@/hooks/useRecipes';
import { RecipeCard } from '@/components/RecipeCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { CategoryBadge } from '@/components/CategoryBadge';
import { ALL_CATEGORIES, Category } from '@/types/recipe';

export default function HomeScreen() {
  const router = useRouter();
  const { recipes, loading, error, toggleFavorite, refresh } = useRecipes();
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recipe Vault</Text>
        <Text style={styles.headerSubtitle}>{recipes.length} recipes</Text>
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
              onPress={() => router.push(`/recipe/${item.id}`)}
              onToggleFavorite={() => toggleFavorite(item.id, !item.isFavorite)}
            />
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
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
