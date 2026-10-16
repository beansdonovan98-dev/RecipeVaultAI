import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRecipe } from '@/hooks/useRecipes';
import { deleteRecipe } from '@/db';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { getCategoryInfo } from '@/constants/categories';

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recipe, loading, error, toggleFavorite } = useRecipe(id ? parseInt(id) : null);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteRecipe(parseInt(id));
            router.back();
          },
        },
      ]
    );
  }, [id, router]);

  const handleShare = useCallback(async () => {
    if (!recipe) return;
    try {
      await Share.share({
        message: `Check out this recipe: ${recipe.title}\n\n${recipe.description}`,
        title: recipe.title,
      });
    } catch (e) {}
  }, [recipe]);

  if (loading) return <LoadingSpinner />;

  if (error || !recipe) {
    return <EmptyState icon="alert-circle-outline" title="Recipe not found" message={error || undefined} />;
  }

  const categoryInfo = getCategoryInfo(recipe.category as any);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {recipe.imageUri ? (
          <Image source={{ uri: recipe.imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="restaurant" size={48} color={Colors.textMuted} />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.categoryBadge}>
              <Ionicons name={categoryInfo.icon as any} size={14} color={categoryInfo.color} />
              <Text style={styles.categoryText}>{recipe.category}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => toggleFavorite(!recipe.isFavorite)} style={styles.actionButton}>
                <Ionicons
                  name={recipe.isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={recipe.isFavorite ? Colors.heart : Colors.textMuted}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                <Ionicons name="share-outline" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push(`/edit?id=${recipe.id}`)} style={styles.actionButton}>
                <Ionicons name="create-outline" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={22} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.title}>{recipe.title}</Text>
          {recipe.description ? <Text style={styles.description}>{recipe.description}</Text> : null}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={Colors.accent} />
              <Text style={styles.metaLabel}>Prep Time</Text>
              <Text style={styles.metaValue}>{recipe.prepTime} min</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="flame-outline" size={16} color={Colors.accent} />
              <Text style={styles.metaLabel}>Cook Time</Text>
              <Text style={styles.metaValue}>{recipe.cookTime} min</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={16} color={Colors.accent} />
              <Text style={styles.metaLabel}>Servings</Text>
              <Text style={styles.metaValue}>{recipe.servings}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ing, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.ingredientText}>
                    <Text style={styles.ingredientAmount}>{ing.amount} {ing.unit}</Text>
                    {' '}
                    <Text style={styles.ingredientName}>{ing.name}</Text>
                    {ing.notes ? <Text style={styles.ingredientNotes}> ({ing.notes})</Text> : null}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.instructionsList}>
              {recipe.instructions.map((inst, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{inst.step}</Text>
                  </View>
                  <View style={styles.instructionContent}>
                    <Text style={styles.instructionText}>{inst.text}</Text>
                    {inst.tip ? (
                      <View style={styles.tipBox}>
                        <Ionicons name="bulb-outline" size={14} color={Colors.accent} />
                        <Text style={styles.tipText}>{inst.tip}</Text>
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
