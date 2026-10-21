import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '@/components/AppText';
import * as db from '@/db';
import { Recipe } from '@/types/recipe';
import { RecipeCard } from '@/components/RecipeCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { captureException } from '@/services/crashTracker';
import { subscribeToDataChanges } from '@/services/dataEvents';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { getCategoryInfo } from '@/constants/categories';
import { ALL_CATEGORIES, Category } from '@/types/recipe';
import { useAppearance } from '@/contexts/AppearanceContext';

export default function CategoriesScreen() {
  const { theme, displayFamily } = useAppearance();
  const router = useRouter();
  const [recipesByCategory, setRecipesByCategory] = useState<Record<string, Recipe[]>>({});
  const [loading, setLoading] = useState(true);

  const loadCategories = async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoading(true);
      }
      const result: Record<string, Recipe[]> = {};
      for (const cat of ALL_CATEGORIES) {
        const recipes = await db.getRecipesByCategory(cat);
        if (recipes.length > 0) {
          result[cat] = recipes;
        }
      }
      setRecipesByCategory(result);
    } catch (e) {
      captureException(e, { source: 'categories.loadCategories' });
      setRecipesByCategory({});
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadCategories(true);
    return subscribeToDataChanges(() => loadCategories(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const categoriesWithRecipes = ALL_CATEGORIES.filter(cat => recipesByCategory[cat]?.length);

  if (categoriesWithRecipes.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <EmptyState
          icon="grid-outline"
          title="No categories yet"
          message="Add recipes to see them organized by category"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={categoriesWithRecipes}
        keyExtractor={item => item}
        contentContainerStyle={styles.list}
        renderItem={({ item: category }) => {
          const info = getCategoryInfo(category);
          const recipes = recipesByCategory[category] || [];
          return (
            <View style={styles.categorySection}>
              <View style={[styles.categoryHeader, { borderBottomColor: theme.borderLight }]}>
                <View style={styles.categoryTitleRow}>
                  <Ionicons name={info.icon as any} size={20} color={info.color} />
                  <Text style={[styles.categoryTitle, { fontFamily: displayFamily }]}>{category}</Text>
                  <Text style={[styles.categoryCount, { color: theme.textMuted }]}>({recipes.length})</Text>
                </View>
              </View>
              {recipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  variant="compact"
                  onPress={() => router.push(`/recipe/${recipe.id}`)}
                />
              ))}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  categorySection: {
    marginBottom: Spacing.xl,
  },
  categoryHeader: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryTitle: {
    ...Typography.subtitle,
    fontSize: 18,
  },
  categoryCount: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
});
