import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { generateRecipeFromName } from '@/services/recipeLookup';
import { addRecipe, getMember, setMember } from '@/db';
import { AppText as Text, AppTextInput as TextInput } from '@/components/AppText';
import { AUTHORS, type AuthorId } from '@/constants/authors';
import { RecipeInput } from '@/types/recipe';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { captureException, recordBreadcrumb } from '@/services/crashTracker';
import { notifyDataChanged } from '@/services/dataEvents';
import { syncRecipes } from '@/services/recipeSync';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';

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
  const router = useRouter();
  const [recipeName, setRecipeName] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeInput | null>(null);

  useEffect(() => {
    recordBreadcrumb('screen-mount:ai-lookup');
  }, []);

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

  const handleLookup = async () => {
    const name = recipeName.trim();
    if (!name) {
      Alert.alert('Error', 'Please enter a recipe name.');
      return;
    }

    setLookingUp(true);
    try {
      const recipe = await generateRecipeFromName(name);
      if (!isValidRecipe(recipe)) {
        Alert.alert('Error', 'AI returned an invalid recipe format. Please try again.');
        return;
      }
      setGeneratedRecipe(recipe);
    } catch (e) {
      captureException(e, { source: 'aiLookup.lookup' });
      Alert.alert('Error', 'Failed to look up that recipe. Please try again.');
    } finally {
      setLookingUp(false);
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
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.introCard}>
          <Ionicons name="search" size={28} color={Colors.primary} />
          <Text style={styles.introTitle}>Recipe Name Lookup</Text>
          <Text style={styles.introText}>
            Type the name of a recipe, like “Chicken stir fry” or “Pancakes,” and get a method with
            ingredients and steps you can save.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>Recipe name</Text>
          <TextInput
            style={styles.input}
            value={recipeName}
            onChangeText={setRecipeName}
            placeholder="e.g. Chicken stir fry"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleLookup}
            editable={!lookingUp}
          />
          <TouchableOpacity
            style={[styles.lookupButton, lookingUp && styles.disabledButton]}
            onPress={handleLookup}
            disabled={lookingUp}
            activeOpacity={0.8}
          >
            {lookingUp ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color={Colors.white} />
                <Text style={styles.lookupButtonText}>Look Up Recipe</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {generatedRecipe ? (
          <View style={styles.previewCard}>
            <Text style={styles.recipeName}>{generatedRecipe.title}</Text>
            <Text style={styles.recipeDescription}>{generatedRecipe.description}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={Colors.accent} />
                <Text style={styles.metaText}>{generatedRecipe.prepTime} min</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={14} color={Colors.accent} />
                <Text style={styles.metaText}>{generatedRecipe.cookTime} min</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={14} color={Colors.accent} />
                <Text style={styles.metaText}>{generatedRecipe.servings} servings</Text>
              </View>
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Ingredients:</Text>
              {generatedRecipe.ingredients.map((ingredient, index) => (
                <Text key={`${ingredient.name}-${index}`} style={styles.previewIngredient}>
                  {`${ingredient.amount}${ingredient.unit ? ` ${ingredient.unit}` : ''} ${ingredient.name}`.trim()}
                </Text>
              ))}
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Instructions:</Text>
              {generatedRecipe.instructions.map((instruction, index) => (
                <View key={`step-${index}`} style={styles.instructionRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction.text}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.disabledButton]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="bookmark-outline" size={18} color={Colors.white} />
                  <Text style={styles.saveButtonText}>Save Recipe</Text>
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
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.text,
  },
  lookupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 50,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  lookupButtonText: {
    ...Typography.label,
    color: Colors.white,
    fontSize: 16,
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
