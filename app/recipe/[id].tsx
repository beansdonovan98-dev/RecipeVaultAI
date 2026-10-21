import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '@/components/AppText';
import { useRecipe } from '@/hooks/useRecipes';
import { deleteRecipe } from '@/db';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RichText } from '@/components/RichText';
import { captureException, recordBreadcrumb } from '@/services/crashTracker';
import { notifyDataChanged } from '@/services/dataEvents';
import { syncRecipes } from '@/services/recipeSync';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { navigateSafely } from '@/utils/safeNavigation';
import { getCategoryInfo } from '@/constants/categories';
import { useAppearance } from '@/contexts/AppearanceContext';

export default function RecipeDetailScreen() {
  const { theme } = useAppearance();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const idStr = Array.isArray(id) ? id[0] : id;
  const parsedId = idStr && !isNaN(parseInt(idStr, 10)) ? parseInt(idStr, 10) : null;
  const { recipe, loading, error, toggleFavorite } = useRecipe(parsedId);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Recipe',
      'This deletes the recipe from your collection. If you share a room, it will be removed from both phones. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (parsedId !== null) await deleteRecipe(parsedId);
              notifyDataChanged();
              syncRecipes().catch((syncError) => {
                console.warn('[SYNC] delete sync failed', syncError);
                recordBreadcrumb('sync:delete-failed');
              });
              router.back();
            } catch (e) {
              captureException(e, {
                source: 'recipeDetail.deleteRecipe',
                extra: { recipeId: parsedId },
              });
              Alert.alert('Error', 'Failed to delete recipe. Please try again.');
            }
          },
        },
      ]
    );
  }, [parsedId, router]);

  const handleShare = useCallback(async () => {
    if (!recipe) return;
    try {
      await Share.share({
        message: `Check out this recipe: ${recipe.title}\n\n${recipe.description}`,
        title: recipe.title,
      });
    } catch (e) {
      captureException(e, { source: 'recipeDetail.shareRecipe' });
    }
  }, [recipe]);

  if (loading) return <LoadingSpinner />;

  if (parsedId === null) {
    return <EmptyState icon="alert-circle-outline" title="Invalid recipe ID" message="The recipe ID is missing or invalid." />;
  }

  if (error || !recipe) {
    return <EmptyState icon="alert-circle-outline" title="Recipe not found" message={error || undefined} />;
  }

  const tags = recipe.tags.length > 0 ? recipe.tags : [recipe.category];

  return (
    <ErrorBoundary>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {recipe.imageUri ? (
            <Image source={{ uri: recipe.imageUri }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholderImage, { backgroundColor: theme.inputBackground }]}>
              <Ionicons name="restaurant" size={48} color={theme.textMuted} />
            </View>
          )}

          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.tagRow}>
                {tags.map((tag) => {
                  const info = getCategoryInfo(tag as any);
                  return (
                    <View key={tag} style={[styles.categoryBadge, { backgroundColor: theme.inputBackground }]}>
                      <Ionicons name={info.icon as any} size={14} color={info.color} />
                      <Text style={styles.categoryText}>{tag}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => toggleFavorite(!recipe.isFavorite)} style={styles.actionButton}>
                  <Ionicons
                    name={recipe.isFavorite ? 'heart' : 'heart-outline'}
                    size={24}
                    color={recipe.isFavorite ? theme.heart : theme.textMuted}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                  <Ionicons name="share-outline" size={22} color={theme.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigateSafely(`/edit?id=${recipe.id}`, 'tap:edit-recipe')} style={styles.actionButton}>
                  <Ionicons name="create-outline" size={22} color={theme.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                  <Ionicons name="trash-outline" size={22} color={theme.error} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.title}>{recipe.title}</Text>
            {recipe.description ? (
              <Text style={[styles.description, { color: theme.textSecondary }]}>{recipe.description}</Text>
            ) : null}

            <View
              style={[
                styles.metaRow,
                { backgroundColor: theme.card, borderColor: theme.borderLight, shadowColor: theme.shadow },
              ]}
            >
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={theme.accent} />
                <Text style={styles.metaLabel}>Prep Time</Text>
                <Text style={styles.metaValue}>{String(recipe.prepTime ?? '')} min</Text>
              </View>
              <View style={[styles.metaDivider, { backgroundColor: theme.borderLight }]} />
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={16} color={theme.accent} />
                <Text style={styles.metaLabel}>Cook Time</Text>
                <Text style={styles.metaValue}>{String(recipe.cookTime ?? '')} min</Text>
              </View>
              <View style={[styles.metaDivider, { backgroundColor: theme.borderLight }]} />
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={16} color={theme.accent} />
                <Text style={styles.metaLabel}>Servings</Text>
                <Text style={styles.metaValue}>{String(recipe.servings ?? '')}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { borderBottomColor: theme.borderLight }]}>Ingredients</Text>
              <View style={styles.ingredientsList}>
                {recipe.ingredients.map((ing, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <View style={[styles.bullet, { backgroundColor: theme.accent }]} />
                    <Text style={styles.ingredientText}>
                      <Text style={styles.ingredientAmount}>{String(ing.amount ?? '')} {String(ing.unit ?? '')}</Text>
                      {' '}
                      <Text style={styles.ingredientName}>{String(ing.name ?? '')}</Text>
                      {ing.notes ? (
                        <Text style={[styles.ingredientNotes, { color: theme.textMuted }]}>
                          {' '}({String(ing.notes ?? '')})
                        </Text>
                      ) : null}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { borderBottomColor: theme.borderLight }]}>Instructions</Text>
              <View style={styles.instructionsList}>
                {recipe.instructions.map((inst, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                      <Text style={[styles.stepNumberText, { color: theme.white }]}>
                        {String(inst.step ?? '')}
                      </Text>
                    </View>
                    <View style={styles.instructionContent}>
                      <RichText text={inst.text} style={styles.instructionText} />
                      {inst.tip ? (
                        <View style={[styles.tipBox, { backgroundColor: theme.tipBackground }]}>
                          <Ionicons name="bulb-outline" size={14} color={theme.accent} />
                          <Text style={styles.tipText}>{String(inst.tip ?? '')}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  image: {
    width: '100%',
    height: 280,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
  },
  content: {
    padding: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tagRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  categoryText: {
    ...Typography.label,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.xs,
  },
  title: {
    ...Typography.title,
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  metaItem: {
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    ...Typography.caption,
  },
  metaValue: {
    ...Typography.label,
    fontSize: 14,
  },
  metaDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.sectionLabel,
    fontSize: 14,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  ingredientsList: {
    gap: Spacing.sm,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginTop: 7,
  },
  ingredientText: {
    ...Typography.body,
    flex: 1,
    lineHeight: 22,
  },
  ingredientAmount: {
    fontWeight: '700',
    color: Colors.primary,
  },
  ingredientName: {
    color: Colors.text,
  },
  ingredientNotes: {
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  instructionsList: {
    gap: Spacing.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    ...Typography.label,
    color: Colors.white,
    fontSize: 13,
  },
  instructionContent: {
    flex: 1,
  },
  instructionText: {
    ...Typography.body,
    lineHeight: 24,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.tipBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  tipText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    flex: 1,
    fontStyle: 'italic',
  },
});
