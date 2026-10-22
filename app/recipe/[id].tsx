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
import type { ThemePalette } from '@/constants/themes';
import { navigateSafely } from '@/utils/safeNavigation';
import { getCategoryInfo } from '@/constants/categories';
import { useAppearance } from '@/contexts/AppearanceContext';
import { themeCardStyle } from '@/constants/themes';
import { ThemeCardPattern } from '@/components/ThemeCardPattern';

function SectionHeader({
  icon,
  title,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  theme: ThemePalette;
}) {
  const { displayFamily } = useAppearance();
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconWrap, { backgroundColor: theme.tipBackground }]}>
        <Ionicons name={icon} size={14} color={theme.accent} />
      </View>
      <Text style={[styles.sectionTitle, { color: theme.accent, fontFamily: displayFamily }]}>
        {title}
      </Text>
      <View style={[styles.sectionRule, { backgroundColor: theme.borderLight }]} />
    </View>
  );
}

export default function RecipeDetailScreen() {
  const { theme, design, displayFamily } = useAppearance();
  const cardTokens = themeCardStyle(design, theme);
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
  const categoryInfo = getCategoryInfo(recipe.category as any);

  return (
    <ErrorBoundary>
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {recipe.imageUri ? (
            <Image source={{ uri: recipe.imageUri }} style={styles.image} />
          ) : (
            <View
              style={[
                styles.image,
                styles.placeholderImage,
                { backgroundColor: `${categoryInfo.color}16` },
              ]}
            >
              <Ionicons
                name={categoryInfo.icon as any}
                size={72}
                color={categoryInfo.color}
                style={styles.placeholderIcon}
              />
            </View>
          )}

          <View
            style={[
              styles.content,
              {
                backgroundColor: 'transparent',
                borderTopLeftRadius: Math.max(design.cardRadius + 10, 22),
                borderTopRightRadius: Math.max(design.cardRadius + 10, 22),
              },
            ]}
          >
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
                <TouchableOpacity
                  onPress={() => toggleFavorite(!recipe.isFavorite)}
                  style={[styles.actionButton, { backgroundColor: theme.tipBackground }]}
                  accessibilityRole="button"
                  accessibilityLabel={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Ionicons
                    name={recipe.isFavorite ? 'heart' : 'heart-outline'}
                    size={19}
                    color={recipe.isFavorite ? theme.heart : theme.textMuted}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleShare}
                  style={[styles.actionButton, { backgroundColor: theme.tipBackground }]}
                  accessibilityRole="button"
                  accessibilityLabel="Share recipe"
                >
                  <Ionicons name="share-outline" size={18} color={theme.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigateSafely(`/edit?id=${recipe.id}`, 'tap:edit-recipe')}
                  style={[styles.actionButton, { backgroundColor: theme.tipBackground }]}
                  accessibilityRole="button"
                  accessibilityLabel="Edit recipe"
                >
                  <Ionicons name="create-outline" size={18} color={theme.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  style={[styles.actionButton, { backgroundColor: theme.tipBackground }]}
                  accessibilityRole="button"
                  accessibilityLabel="Delete recipe"
                >
                  <Ionicons name="trash-outline" size={18} color={theme.error} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.title, { fontFamily: displayFamily }]}>{recipe.title}</Text>
            {recipe.description ? (
              <Text style={[styles.description, { color: theme.textSecondary }]}>{recipe.description}</Text>
            ) : null}

            <View
              style={[
                styles.metaRow,
                cardTokens,
                { backgroundColor: 'transparent' },
              ]}
            >
              {[
                { icon: 'time-outline' as const, label: 'Prep', value: `${String(recipe.prepTime ?? '')} min` },
                { icon: 'flame-outline' as const, label: 'Cook', value: `${String(recipe.cookTime ?? '')} min` },
                { icon: 'people-outline' as const, label: 'Serves', value: String(recipe.servings ?? '') },
              ].map((stat, statIndex) => (
                <React.Fragment key={stat.label}>
                  {statIndex > 0 ? (
                    <View style={[styles.metaDivider, { backgroundColor: theme.borderLight }]} />
                  ) : null}
                  <View style={styles.metaItem}>
                    <View style={[styles.metaIcon, { backgroundColor: theme.tipBackground }]}>
                      <Ionicons name={stat.icon} size={15} color={theme.accent} />
                    </View>
                    <Text style={[styles.metaValue, { color: theme.text }]}>{stat.value}</Text>
                    <Text style={[styles.metaLabel, { color: theme.textMuted }]}>
                      {stat.label.toUpperCase()}
                    </Text>
                  </View>
                </React.Fragment>
              ))}
            </View>

            <View style={styles.section}>
              <SectionHeader icon="basket-outline" title="Ingredients" theme={theme} />
              <View
                style={[
                  styles.ingredientsCard,
                  cardTokens,
                  { backgroundColor: 'transparent' },
                ]}
              >
                <View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFill,
                    { borderRadius: design.cardRadius, overflow: 'hidden', opacity: 0.85 },
                  ]}
                >
                  <ThemeCardPattern pattern={design.cardPattern} palette={theme} />
                </View>
                {recipe.ingredients.map((ing, index) => (
                  <View
                    key={index}
                    style={[
                      styles.ingredientRow,
                      index < recipe.ingredients.length - 1
                        ? [styles.ingredientRowDivider, { borderBottomColor: theme.borderLight }]
                        : null,
                    ]}
                  >
                    <View style={[styles.ingredientDot, { backgroundColor: theme.accent }]} />
                    <Text style={[styles.ingredientAmount, { color: theme.primary }]}>
                      {String(ing.amount ?? '')}
                      {ing.unit ? ` ${String(ing.unit)}` : ''}
                    </Text>
                    <Text style={[styles.ingredientName, { color: theme.text }]}>{String(ing.name ?? '')}</Text>
                    {ing.notes ? (
                      <Text style={[styles.ingredientNotes, { color: theme.textMuted }]}>
                        {` (${String(ing.notes ?? '')})`}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <SectionHeader icon="list-outline" title="Instructions" theme={theme} />
              <View
                style={[
                  styles.instructionsCard,
                  cardTokens,
                  { backgroundColor: 'transparent' },
                ]}
              >
                {recipe.instructions.map((inst, index) => {
                  const isLast = index === recipe.instructions.length - 1;
                  return (
                    <View key={index} style={styles.instructionRow}>
                      <View style={styles.stepGutter}>
                        <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                          <Text style={[styles.stepNumberText, { color: theme.white }]}>
                            {String(inst.step ?? index + 1)}
                          </Text>
                        </View>
                        {!isLast ? (
                          <View style={[styles.stepLine, { backgroundColor: theme.borderLight }]} />
                        ) : null}
                      </View>
                      <View style={[styles.instructionContent, isLast && styles.instructionContentLast]}>
                        <RichText text={inst.text} style={styles.instructionText} />
                        {inst.tip ? (
                          <View
                            style={[
                              styles.tipBox,
                              { backgroundColor: theme.tipBackground, borderLeftColor: theme.accent },
                            ]}
                          >
                            <Ionicons name="bulb-outline" size={14} color={theme.accent} />
                            <Text style={[styles.tipText, { color: theme.text }]}>
                              {String(inst.tip ?? '')}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
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
    height: 300,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
  },
  placeholderIcon: {
    opacity: 0.35,
  },
  content: {
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.title,
    fontSize: 30,
    lineHeight: 36,
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
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  metaIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metaLabel: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  metaValue: {
    ...Typography.label,
    fontSize: 15,
    fontWeight: '700',
  },
  metaDivider: {
    width: 1,
    height: 44,
    backgroundColor: Colors.borderLight,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...Typography.sectionLabel,
    fontSize: 13,
  },
  sectionRule: {
    flex: 1,
    height: 1,
    marginLeft: Spacing.xs,
    opacity: 0.7,
  },
  ingredientsCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingVertical: Spacing.xs,
    ...Shadows.card,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  ingredientRowDivider: {
    borderBottomWidth: 1,
  },
  ingredientDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  ingredientAmount: {
    ...Typography.body,
    width: 72,
    textAlign: 'right',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  ingredientName: {
    ...Typography.body,
    flex: 1,
    flexShrink: 1,
  },
  ingredientNotes: {
    ...Typography.bodySmall,
    fontStyle: 'italic',
    flexShrink: 0,
    maxWidth: 110,
  },
  instructionsCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
    ...Shadows.card,
  },
  instructionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  stepGutter: {
    width: 30,
    alignItems: 'center',
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    ...Typography.label,
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
    borderRadius: 1,
  },
  instructionContent: {
    flex: 1,
    paddingTop: 3,
    paddingBottom: Spacing.lg,
  },
  instructionContentLast: {
    paddingBottom: Spacing.sm,
  },
  instructionText: {
    ...Typography.body,
    fontSize: 15,
    lineHeight: 24,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.tipBackground,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
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
