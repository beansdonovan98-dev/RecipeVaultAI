import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
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
import { Colors, Spacing, Typography } from '@/constants/theme';
import { getCategoryInfo } from '@/constants/categories';
import { useAppearance } from '@/contexts/AppearanceContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TagGroup {
  tag: string;
  recipes: Recipe[];
}

export default function CategoriesScreen() {
  const { theme, displayFamily } = useAppearance();
  const router = useRouter();
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());

  const loadCategories = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoading(true);
      }
      const all = await db.getAllRecipes();
      const tagMap = new Map<string, Recipe[]>();
      for (const recipe of all) {
        const tags = new Set<string>();
        if (recipe.category) tags.add(recipe.category);
        for (const tag of recipe.tags) tags.add(tag);
        for (const tag of tags) {
          const list = tagMap.get(tag);
          if (list) {
            list.push(recipe);
          } else {
            tagMap.set(tag, [recipe]);
          }
        }
      }
      const groups: TagGroup[] = Array.from(tagMap.entries())
        .map(([tag, recipes]) => ({ tag, recipes }))
        .sort((a, b) => a.tag.localeCompare(b.tag));
      setTagGroups(groups);
    } catch (e) {
      captureException(e, { source: 'categories.loadCategories' });
      setTagGroups([]);
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadCategories(true);
    return subscribeToDataChanges(() => loadCategories(false));
  }, [loadCategories]);

  const toggleTag = (tag: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const expandAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedTags(new Set(tagGroups.map((g) => g.tag)));
  };

  const collapseAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedTags(new Set());
  };

  if (loading) return <LoadingSpinner />;

  if (tagGroups.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        <EmptyState
          icon="grid-outline"
          title="No categories yet"
          message="Add recipes to see them organized by category"
        />
      </View>
    );
  }

  const allExpanded = expandedTags.size === tagGroups.length;

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <FlatList
        data={tagGroups}
        keyExtractor={(item) => item.tag}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.toolbar}>
            <Text style={[styles.toolbarCount, { color: theme.textMuted }]}>
              {tagGroups.length} {tagGroups.length === 1 ? 'category' : 'categories'}
            </Text>
            <TouchableOpacity
              style={[styles.expandButton, { backgroundColor: theme.tipBackground }]}
              onPress={allExpanded ? collapseAll : expandAll}
              activeOpacity={0.7}
            >
              <Text style={[styles.expandButtonText, { color: theme.primary }]}>
                {allExpanded ? 'Collapse all' : 'Expand all'}
              </Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: group }) => {
          const info = getCategoryInfo(group.tag as any);
          const expanded = expandedTags.has(group.tag);
          return (
            <View style={styles.categorySection}>
              <TouchableOpacity
                style={[styles.categoryHeader, { borderBottomColor: theme.borderLight }]}
                onPress={() => toggleTag(group.tag)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                accessibilityLabel={`${group.tag}, ${group.recipes.length} recipes`}
              >
                <View style={styles.categoryTitleRow}>
                  <Ionicons name={info.icon as any} size={20} color={info.color} />
                  <Text style={[styles.categoryTitle, { fontFamily: displayFamily }]}>{group.tag}</Text>
                  <Text style={[styles.categoryCount, { color: theme.textMuted }]}>({group.recipes.length})</Text>
                </View>
                <Ionicons
                  name={expanded ? 'chevron-down' : 'chevron-forward'}
                  size={18}
                  color={theme.textMuted}
                />
              </TouchableOpacity>
              {expanded &&
                group.recipes.map((recipe) => (
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  toolbarCount: {
    ...Typography.bodySmall,
  },
  expandButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
  },
  expandButtonText: {
    ...Typography.label,
    fontSize: 12,
  },
  categorySection: {
    marginBottom: Spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
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
