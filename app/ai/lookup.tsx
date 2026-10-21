import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { generateRecipeFromName } from '@/services/recipeLookup';
import { searchRecipes, getRecipeById, type RecipeSearchResult } from '@/services/recipeSearch';
import { addRecipe, getMember, setMember } from '@/db';
import { AppText as Text, AppTextInput as TextInput } from '@/components/AppText';
import { AUTHORS, type AuthorId } from '@/constants/authors';
import { RecipeInput } from '@/types/recipe';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { captureException, recordBreadcrumb } from '@/services/crashTracker';
import { notifyDataChanged } from '@/services/dataEvents';
import { syncRecipes } from '@/services/recipeSync';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { useAppearance } from '@/contexts/AppearanceContext';

const SEARCH_DEBOUNCE_MS = 320;

function isValidRecipe(obj: any): obj is RecipeInput {
  return (
    obj &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.prepTime === 'number' &&
    typeof obj.cookTime === 'number' &&
    typeof obj.servings === 'number' &&
    Array.isArray(obj.ingredients) &&
    obj.ingredients.every(
      (ing: any) =>
        ing && typeof ing.name === 'string' && typeof ing.amount === 'string' && typeof ing.unit === 'string'
    ) &&
    Array.isArray(obj.instructions) &&
    obj.instructions.every((inst: any) => inst && typeof inst.text === 'string')
  );
}

interface AIRecipeLookupScreenProps {
  onClose?: () => void;
}

export default function AIRecipeLookupScreen({ onClose }: AIRecipeLookupScreenProps) {
  const { theme } = useAppearance();
  const router = useRouter();
  const [recipeName, setRecipeName] = useState('');
  const [results, setResults] = useState<RecipeSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeInput | null>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    recordBreadcrumb('screen-mount:ai-lookup');
  }, []);

  useEffect(() => {
    const query = recipeName.trim();
    setGeneratedRecipe(null);
    setSelectedId(null);
    setSearchError(null);

    if (!query) {
      setResults([]);
      setSearching(false);
      return undefined;
    }

    const requestId = ++requestRef.current;
    const controller = new AbortController();
    setSearching(true);

    const timer = setTimeout(async () => {
      try {
        const matches = await searchRecipes(query, controller.signal);
        if (requestId !== requestRef.current) {
          return;
        }
        setResults(matches);
        setSearchError(matches.length === 0 ? 'No recipes matched that name.' : null);
      } catch (error) {
        if (controller.signal.aborted || requestId !== requestRef.current) {
          return;
        }
        setResults([]);
        setSearchError(null);
        recordBreadcrumb('ai-lookup:search-failed');
      } finally {
        if (requestId === requestRef.current) {
          setSearching(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [recipeName]);

  const handleSelectResult = async (result: RecipeSearchResult) => {
    if (selectedId === result.id) {
      return;
    }
    setSelectedId(result.id);
    setGeneratedRecipe(null);
    setSearchError(null);

    try {
      const recipe = await getRecipeById(result.id);
      if (recipe && isValidRecipe(recipe)) {
        setGeneratedRecipe(recipe);
      } else {
        throw new Error('invalid recipe shape');
      }
    } catch (error) {
      captureException(error, { source: 'aiLookup.selectResult' });
      setSelectedId(null);
      try {
        const fallback = await generateRecipeFromName(result.title);
        if (isValidRecipe(fallback)) {
          setGeneratedRecipe(fallback);
        } else {
          setSearchError('Could not load that recipe. Please try another.');
        }
      } catch (fallbackError) {
        captureException(fallbackError, { source: 'aiLookup.selectFallback' });
        setSearchError('Could not load that recipe. Please try another.');
      }
    }
  };

  const saveGeneratedRecipe = async (author: AuthorId) => {
    if (!generatedRecipe || !isValidRecipe(generatedRecipe)) {
      Alert.alert('Error', 'Invalid recipe data. Please look up a new recipe.');
      return;
    }

    setSaving(true);
    try {
      await addRecipe(generatedRecipe, author);
      notifyDataChanged();
      syncRecipes().catch((syncError) => {
        console.warn('[SYNC] AI lookup recipe sync failed', syncError);
        recordBreadcrumb('sync:ai-lookup-recipe-failed');
      });
      Alert.alert('Success', 'Recipe saved to your collection!', [
        {
          text: 'OK',
          onPress: () => {
            if (onClose) {
              onClose();
            } else {
              router.back();
            }
          },
        },
      ]);
    } catch (e) {
      captureException(e, { source: 'aiLookup.saveRecipe' });
      Alert.alert('Error', 'Failed to save recipe.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (saving || !generatedRecipe) {
      return;
    }

    void (async () => {
      try {
        const member = await getMember();
        if (member) {
          await saveGeneratedRecipe(member);
          return;
        }
      } catch (e) {
        captureException(e, { source: 'aiLookup.getMember' });
      }

      Alert.alert(
        'Who is posting?',
        'Choose which person is using this phone so the recipe is labeled correctly.',
        [
          {
            text: AUTHORS.daddy.label,
            onPress: () => {
              void setMember('daddy')
                .catch((error) => captureException(error, { source: 'aiLookup.setMember' }))
                .then(() => notifyDataChanged())
                .then(() => saveGeneratedRecipe('daddy'));
            },
          },
          {
            text: AUTHORS.princess.label,
            onPress: () => {
              void setMember('princess')
                .catch((error) => captureException(error, { source: 'aiLookup.setMember' }))
                .then(() => notifyDataChanged())
                .then(() => saveGeneratedRecipe('princess'));
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    })();
  };

  return (
    <ErrorBoundary>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.introCard,
            { backgroundColor: theme.card, borderColor: theme.borderLight, shadowColor: theme.shadow },
          ]}
        >
          <Ionicons name="search" size={28} color={theme.primary} />
          <Text style={styles.introTitle}>Recipe Name Lookup</Text>
          <Text style={[styles.introText, { color: theme.textSecondary }]}>
            Start typing a recipe name and real matches appear as you go. Tap one to see its
            ingredients and steps, then save it.
          </Text>
        </View>

        <View
          style={[
            styles.formCard,
            { backgroundColor: theme.card, borderColor: theme.borderLight, shadowColor: theme.shadow },
          ]}
        >
          <Text style={styles.sectionLabel}>Recipe name</Text>
          <View
            style={[
              styles.searchRow,
              { backgroundColor: theme.inputBackground, borderColor: theme.borderLight },
            ]}
          >
            <Ionicons name="search" size={18} color={theme.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={recipeName}
              onChangeText={setRecipeName}
              placeholder="Start typing a recipe name…"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searching ? <ActivityIndicator size="small" color={theme.primary} /> : null}
          </View>

          {searchError ? (
            <Text style={[styles.searchNote, { color: theme.textMuted }]}>{searchError}</Text>
          ) : null}

          {results.length > 0 ? (
            <View style={styles.resultsList}>
              {results.slice(0, 12).map((result) => {
                const active = result.id === selectedId;
                return (
                  <TouchableOpacity
                    key={result.id}
                    style={[
                      styles.resultRow,
                      {
                        backgroundColor: active ? theme.tipBackground : theme.inputBackground,
                        borderColor: active ? theme.primary : theme.borderLight,
                      },
                    ]}
                    onPress={() => void handleSelectResult(result)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${result.title}`}
                  >
                    {result.thumbnail ? (
                      <Image source={{ uri: result.thumbnail }} style={styles.resultThumb} />
                    ) : (
                      <View
                        style={[styles.resultThumb, styles.resultThumbFallback, { backgroundColor: theme.tipBackground }]}
                      >
                        <Ionicons name="restaurant-outline" size={18} color={theme.primary} />
                      </View>
                    )}
                    <View style={styles.resultText}>
                      <Text style={styles.resultTitle} numberOfLines={1}>
                        {result.title}
                      </Text>
                      <Text style={[styles.resultMeta, { color: theme.textMuted }]} numberOfLines={1}>
                        {[result.category, result.area].filter(Boolean).join(' · ') || 'Recipe'}
                      </Text>
                    </View>
                    {active && selectedId === result.id ? (
                      <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </View>

        {generatedRecipe ? (
          <View
            style={[
              styles.previewCard,
              { backgroundColor: theme.card, borderColor: theme.borderLight, shadowColor: theme.shadow },
            ]}
          >
            <Text style={styles.recipeName}>{generatedRecipe.title}</Text>
            <Text style={[styles.recipeDescription, { color: theme.textSecondary }]}>
              {generatedRecipe.description}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={theme.accent} />
                <Text style={styles.metaText}>{generatedRecipe.prepTime} min</Text>
              </View>
              <View style={[styles.metaDivider, { backgroundColor: theme.borderLight }]} />
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={14} color={theme.accent} />
                <Text style={styles.metaText}>{generatedRecipe.cookTime} min</Text>
              </View>
              <View style={[styles.metaDivider, { backgroundColor: theme.borderLight }]} />
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={14} color={theme.accent} />
                <Text style={styles.metaText}>{generatedRecipe.servings} servings</Text>
              </View>
            </View>

            <View style={[styles.previewSection, { borderTopColor: theme.borderLight }]}>
              <Text style={styles.previewLabel}>Ingredients:</Text>
              {generatedRecipe.ingredients.map((ingredient, index) => (
                <Text key={`${ingredient.name}-${index}`} style={styles.previewIngredient}>
                  {`${ingredient.amount}${ingredient.unit ? ` ${ingredient.unit}` : ''} ${ingredient.name}`.trim()}
                </Text>
              ))}
            </View>

            <View style={[styles.previewSection, { borderTopColor: theme.borderLight }]}>
              <Text style={styles.previewLabel}>Instructions:</Text>
              {generatedRecipe.instructions.map((instruction, index) => (
                <View key={`step-${index}`} style={styles.instructionRow}>
                  <View style={[styles.stepBadge, { backgroundColor: theme.tipBackground }]}>
                    <Text style={styles.stepBadgeText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction.text}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: theme.primary },
                saving && styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color={theme.white} />
              ) : (
                <>
                  <Ionicons name="bookmark-outline" size={18} color={theme.white} />
                  <Text style={[styles.saveButtonText, { color: theme.white }]}>Save Recipe</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  introCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.card,
  },
  introTitle: {
    ...Typography.subtitle,
  },
  introText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.card,
  },
  sectionLabel: {
    ...Typography.sectionLabel,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  searchNote: {
    ...Typography.caption,
  },
  resultsList: {
    gap: Spacing.sm,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
  },
  resultThumb: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
  },
  resultThumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    flex: 1,
    gap: 2,
  },
  resultTitle: {
    ...Typography.label,
    fontSize: 14,
    color: Colors.text,
  },
  resultMeta: {
    ...Typography.caption,
  },
  disabledButton: {
    opacity: 0.55,
  },
  previewCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.card,
  },
  recipeName: {
    ...Typography.cardTitle,
  },
  recipeDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.primary,
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.borderLight,
  },
  previewSection: {
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  previewLabel: {
    ...Typography.label,
    color: Colors.accent,
  },
  previewIngredient: {
    ...Typography.body,
    color: Colors.text,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.tipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },
  instructionText: {
    ...Typography.body,
    flex: 1,
    color: Colors.text,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 50,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  saveButtonText: {
    ...Typography.label,
    color: Colors.white,
    fontSize: 16,
  },
});
