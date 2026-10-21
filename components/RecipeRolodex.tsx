import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '@/components/AppText';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { getCategoryInfo } from '@/constants/categories';
import { getAuthorLabel } from '@/constants/authors';
import { useAppearance } from '@/contexts/AppearanceContext';
import type { Recipe } from '@/types/recipe';
import type { Category } from '@/types/recipe';
import type { ThemePalette } from '@/constants/themes';
import { themeCardStyle } from '@/constants/themes';
import { ThemeCardPattern, type ThemeCardPatternKind } from '@/components/ThemeCardPattern';

interface RecipeRolodexProps {
  recipes: Recipe[];
  onOpen: (recipe: Recipe) => void;
  onToggleFavorite: (recipe: Recipe) => void;
}

/**
 * A rolodex-style deck: one recipe card per page, flipped through horizontally.
 * Cards behind the active one peek out as a physical stack.
 */
export function RecipeRolodex({ recipes, onOpen, onToggleFavorite }: RecipeRolodexProps) {
  const { theme, design, displayFamily } = useAppearance();
  const cardTokens = themeCardStyle(design, theme);
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<Recipe>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);

  const cardWidth = Math.min(width - Spacing.xl * 2, 430);
  const cardHeight = Math.min(Math.max(Math.round(height * 0.46), 300), 470);
  const deckHeight = cardHeight + Spacing.xxl;
  const stackLeft = (width - cardWidth) / 2;

  // Reset to the first card whenever the filtering changes the visible set.
  const idsKey = useMemo(() => recipes.map((recipe) => recipe.id).join(','), [recipes]);

  useEffect(() => {
    setIndex(0);
    scrollX.setValue(0);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [idsKey, width, scrollX]);

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= recipes.length) {
        return;
      }
      setIndex(next);
      listRef.current?.scrollToOffset({ offset: next * width, animated: true });
    },
    [recipes.length, width]
  );

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(event.nativeEvent.contentOffset.x / width);
      setIndex(Math.max(0, Math.min(recipes.length - 1, next)));
    },
    [recipes.length, width]
  );

  const progressWidth = `${Math.round(
    ((index + 1) / Math.max(recipes.length, 1)) * 100
  )}%` as `${number}%`;

  const renderItem = ({ item, index: itemIndex }: { item: Recipe; index: number }) => {
    const inputRange = [(itemIndex - 1) * width, itemIndex * width, (itemIndex + 1) * width];

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.35, 1, 0.35],
      extrapolate: 'clamp',
    });
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });
    const rotateY = scrollX.interpolate({
      inputRange,
      outputRange: ['10deg', '0deg', '-10deg'],
      extrapolate: 'clamp',
    });
    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [18, 0, 18],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.page, { width, height: deckHeight }]}>
        <Animated.View
          style={[
            {
              width: cardWidth,
              height: cardHeight,
              ...cardTokens,
              backgroundColor: theme.card,
              opacity,
              transform: [{ perspective: 1100 }, { translateY }, { rotateY }, { scale }],
            },
          ]}
        >
          <RolodexCard
            recipe={item}
            theme={theme}
            compact={cardHeight < 380}
            displayFamily={displayFamily}
            pattern={design.cardPattern}
            cardRadius={Math.max(cardTokens.borderRadius - cardTokens.borderWidth, 0)}
            onOpen={() => onOpen(item)}
            onToggleFavorite={() => onToggleFavorite(item)}
          />
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.deckArea, { height: deckHeight }]}>
        {/* Card stack behind the deck, so the active card sits on top of a pile. */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View
            style={[
              styles.stackCard,
              {
                left: stackLeft,
                top: Spacing.xxl / 2 + 18,
                width: cardWidth,
                height: cardHeight,
                backgroundColor: theme.card,
                borderColor: cardTokens.borderColor,
                borderRadius: cardTokens.borderRadius,
                borderWidth: cardTokens.borderWidth,
                opacity: 0.35,
                transform: [{ scaleX: 0.9 }],
              },
            ]}
          />
          <View
            style={[
              styles.stackCard,
              {
                left: stackLeft,
                top: Spacing.xxl / 2 + 9,
                width: cardWidth,
                height: cardHeight,
                backgroundColor: theme.card,
                borderColor: cardTokens.borderColor,
                borderRadius: cardTokens.borderRadius,
                borderWidth: cardTokens.borderWidth,
                opacity: 0.65,
                transform: [{ scaleX: 0.95 }],
              },
            ]}
          />
        </View>

        <Animated.FlatList
          ref={listRef}
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          bounces={false}
          initialNumToRender={2}
          windowSize={3}
          getItemLayout={(_, itemIndex) => ({
            length: width,
            offset: width * itemIndex,
            index: itemIndex,
          })}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleMomentumEnd}
          style={styles.deckList}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.arrow,
            { borderColor: cardTokens.borderColor, borderWidth: Math.max(cardTokens.borderWidth, 1), backgroundColor: theme.card },
            index === 0 && styles.arrowDisabled,
          ]}
          onPress={() => goTo(index - 1)}
          disabled={index === 0}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Previous recipe"
        >
          <Ionicons name="chevron-back" size={18} color={theme.primary} />
        </TouchableOpacity>

        <View style={styles.counterWrap}>
          <Text style={[styles.counter, { color: theme.textSecondary }]}>
            {index + 1} <Text style={{ color: theme.textMuted }}>of</Text> {recipes.length}
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: theme.borderLight }]}>
            <View
              style={[styles.progressFill, { backgroundColor: theme.primary, width: progressWidth }]}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.arrow,
            { borderColor: cardTokens.borderColor, borderWidth: Math.max(cardTokens.borderWidth, 1), backgroundColor: theme.card },
            index >= recipes.length - 1 && styles.arrowDisabled,
          ]}
          onPress={() => goTo(index + 1)}
          disabled={index >= recipes.length - 1}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Next recipe"
        >
          <Ionicons name="chevron-forward" size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface RolodexCardProps {
  recipe: Recipe;
  theme: ThemePalette;
  compact: boolean;
  displayFamily?: string;
  pattern?: ThemeCardPatternKind;
  cardRadius: number;
  onOpen: () => void;
  onToggleFavorite: () => void;
}

function RolodexCard({
  recipe,
  theme,
  compact,
  displayFamily,
  pattern,
  cardRadius,
  onOpen,
  onToggleFavorite,
}: RolodexCardProps) {
  const category = getCategoryInfo(recipe.category as Category);
  const authorLabel = getAuthorLabel(recipe.author);
  const tags = (recipe.tags.length > 0 ? recipe.tags : [recipe.category]).slice(0, 2);

  return (
    <TouchableOpacity
      activeOpacity={0.94}
      onPress={onOpen}
      style={[
        styles.card,
        { backgroundColor: theme.card, borderRadius: cardRadius },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${recipe.title}. Open recipe`}
    >
      <View style={[styles.photoWrap, { backgroundColor: theme.inputBackground }]}>
        {recipe.imageUri ? (
          <Image source={{ uri: recipe.imageUri }} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: `${category.color}16` }]}>
            <Ionicons
              name={category.icon as never}
              size={56}
              color={category.color}
              style={styles.placeholderIcon}
            />
          </View>
        )}

        <View style={[styles.categoryPill, { backgroundColor: theme.card }]}>
          <Ionicons name={category.icon as never} size={12} color={category.color} />
          <Text style={[styles.categoryText, { color: category.color }]}>
            {recipe.category.toUpperCase()}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.heart, { backgroundColor: theme.card }]}
          onPress={onToggleFavorite}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Ionicons
            name={recipe.isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={recipe.isFavorite ? theme.heart : theme.textMuted}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <ThemeCardPattern pattern={pattern} palette={theme} />
        <View style={[styles.accentStrip, { backgroundColor: category.color }]} />
        <View style={styles.tagRow}>
          {tags.map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: theme.inputBackground }]}>
              <Text style={[styles.tagText, { color: theme.textSecondary }]} numberOfLines={1}>
                {tag}
              </Text>
            </View>
          ))}
          {authorLabel ? (
            <Text style={[styles.author, { color: theme.textMuted }]} numberOfLines={1}>
              {authorLabel}
            </Text>
          ) : null}
        </View>

        <Text style={[styles.title, { color: theme.text, fontFamily: displayFamily }]} numberOfLines={2}>
          {recipe.title}
        </Text>

        {recipe.description ? (
          <Text
            style={[styles.description, { color: theme.textSecondary }]}
            numberOfLines={compact ? 1 : 2}
          >
            {recipe.description}
          </Text>
        ) : null}

        <View style={[styles.footer, { borderTopColor: theme.borderLight }]}>
          <View style={styles.chips}>
            <View style={[styles.chip, { backgroundColor: theme.inputBackground }]}>
              <Ionicons name="time-outline" size={12} color={theme.accent} />
              <Text style={[styles.chipText, { color: theme.text }]}>{recipe.prepTime}m</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: theme.inputBackground }]}>
              <Ionicons name="flame-outline" size={12} color={theme.accent} />
              <Text style={[styles.chipText, { color: theme.text }]}>{recipe.cookTime}m</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: theme.inputBackground }]}>
              <Ionicons name="people-outline" size={12} color={theme.accent} />
              <Text style={[styles.chipText, { color: theme.text }]}>{recipe.servings}</Text>
            </View>
          </View>
          <View style={[styles.openButton, { backgroundColor: theme.primary }]}>
            <Ionicons name="arrow-forward" size={15} color={theme.white} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  deckArea: {
    justifyContent: 'center',
  },
  deckList: {
    flex: 1,
  },
  page: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackCard: {
    position: 'absolute',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  card: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  photoWrap: {
    flex: 1,
    minHeight: 120,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    opacity: 0.35,
  },
  categoryPill: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    ...Typography.label,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  heart: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  accentStrip: {
    width: 34,
    height: 3,
    borderRadius: 2,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    maxWidth: 96,
  },
  tagText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    ...Typography.cardTitle,
    fontSize: 21,
    lineHeight: 26,
  },
  description: {
    ...Typography.bodySmall,
    lineHeight: 17,
  },
  author: {
    ...Typography.caption,
    flex: 1,
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  chips: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  chipText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },
  openButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
  },
  arrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: {
    opacity: 0.35,
  },
  counterWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  counter: {
    ...Typography.label,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  progressTrack: {
    width: '100%',
    height: 3,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
