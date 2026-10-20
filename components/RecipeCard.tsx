import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '@/types/recipe';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { getCategoryInfo } from '@/constants/categories';
import { getAuthorLabel } from '@/constants/authors';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  onToggleFavorite?: () => void;
  variant?: 'full' | 'compact';
}

export function RecipeCard({ recipe, onPress, onToggleFavorite, variant = 'full' }: RecipeCardProps) {
  const categoryInfo = getCategoryInfo(recipe.category as any);
  const authorLabel = getAuthorLabel(recipe.author);

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.8}>
        {recipe.imageUri ? (
          <Image source={{ uri: recipe.imageUri }} style={styles.compactImage} />
        ) : (
          <View style={[styles.compactImage, styles.placeholderImage]}>
            <Ionicons name="restaurant" size={24} color={Colors.textMuted} />
          </View>
        )}
        <View style={styles.compactContent}>
          <Text style={styles.compactCategory} numberOfLines={1}>
            {recipe.category}
            {authorLabel ? ` · ${authorLabel}` : ''}
          </Text>
          <Text style={styles.compactTitle} numberOfLines={2}>{recipe.title}</Text>
          <View style={styles.compactMeta}>
            <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.compactMetaText}>{(Number(recipe.prepTime ?? 0) + Number(recipe.cookTime ?? 0))} min</Text>
          </View>
        </View>
        {onToggleFavorite && (
          <TouchableOpacity style={styles.favoriteButton} onPress={onToggleFavorite}>
            <Ionicons
              name={recipe.isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={recipe.isFavorite ? Colors.heart : Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      {recipe.imageUri ? (
        <Image source={{ uri: recipe.imageUri }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholderImage]}>
          <Ionicons name="restaurant" size={40} color={Colors.textMuted} />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.categoryBadge}>
            <Ionicons name={categoryInfo.icon as any} size={12} color={categoryInfo.color} />
            <Text style={styles.categoryText}>{recipe.category}</Text>
          </View>
          {onToggleFavorite && (
            <TouchableOpacity onPress={onToggleFavorite} style={styles.heartButton}>
              <Ionicons
                name={recipe.isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={recipe.isFavorite ? Colors.heart : Colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>{recipe.title}</Text>

        {recipe.description ? (
          <Text style={styles.description} numberOfLines={2}>{recipe.description}</Text>
        ) : null}

        {authorLabel ? (
          <View style={styles.authorRow}>
            <Ionicons name="person-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.authorText}>Added by {authorLabel}</Text>
          </View>
        ) : null}

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.accent} />
            <Text style={styles.metaLabel}>Prep</Text>
            <Text style={styles.metaValue}>{String(recipe.prepTime ?? '')}m</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="flame-outline" size={14} color={Colors.accent} />
            <Text style={styles.metaLabel}>Cook</Text>
            <Text style={styles.metaValue}>{String(recipe.cookTime ?? '')}m</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={Colors.accent} />
            <Text style={styles.metaLabel}>Serves</Text>
            <Text style={styles.metaValue}>{String(recipe.servings ?? '')}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.inputBackground,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  categoryText: {
    ...Typography.label,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heartButton: {
    padding: Spacing.xs,
  },
  title: {
    ...Typography.cardTitle,
    marginBottom: Spacing.xs,
  },
  description: {
    ...Typography.bodySmall,
    marginBottom: Spacing.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  authorText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    ...Typography.caption,
    marginLeft: 2,
  },
  metaValue: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.primary,
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.md,
  },
  compactCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  compactImage: {
    width: 80,
    height: 80,
    backgroundColor: Colors.inputBackground,
  },
  compactContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  compactCategory: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: Colors.accent,
    marginBottom: 2,
  },
  compactTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactMetaText: {
    ...Typography.caption,
  },
  favoriteButton: {
    padding: Spacing.sm,
    justifyContent: 'center',
  },
});
