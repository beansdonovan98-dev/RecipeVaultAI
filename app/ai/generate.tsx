import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { generateRecipeFromIngredients } from '@/services/ai';
import { addRecipe } from '@/db';
import { Ingredient } from '@/types/recipe';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';

export default function AIGenerateScreen() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);

  const handleGenerate = async () => {
    const lines = ingredients
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) {
      Alert.alert('Error', 'Please enter at least one ingredient');
      return;
    }

    const parsedIngredients: Ingredient[] = lines.map((line, i) => {
      const parts = line.split(' ');
      const amount = parts[0] || '1';
      const unit = parts[1] || '';
      const name = parts.slice(2).join(' ') || line;
      return {
        id: `ing-${i}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        amount,
        unit,
      };
    });

    setGenerating(true);
    try {
      const recipe = await generateRecipeFromIngredients(parsedIngredients);
      setGeneratedRecipe(recipe);
    } catch (e) {
      Alert.alert('Error', 'Failed to generate recipe. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;
    try {
      await addRecipe(generatedRecipe);
      Alert.alert('Success', 'Recipe saved to your collection!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to save recipe.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enter Your Ingredients</Text>
        <Text style={styles.sectionSubtitle}>
          List the ingredients you have, one per line. Include amounts if possible.
        </Text>
        <TextInput
          style={styles.input}
          value={ingredients}
          onChangeText={setIngredients}
          placeholder="e.g.,&#10;2 cups flour&#10;3 eggs&#10;1 cup sugar&#10;1/2 cup butter"
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={styles.generateButton}
        onPress={handleGenerate}
        disabled={generating}
        activeOpacity={0.8}
      >
        {generating ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <>
            <Ionicons name="sparkles" size={20} color={Colors.white} />
            <Text style={styles.generateButtonText}>Generate Recipe</Text>
          </>
        )}
      </TouchableOpacity>

      {generatedRecipe && (
        <View style={styles.resultSection}>
          <View style={styles.resultHeader}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <Text style={styles.resultTitle}>Recipe Generated!</Text>
          </View>

          <View style={styles.recipePreview}>
            <Text style={styles.recipeName}>{generatedRecipe.title}</Text>
            <Text style={styles.recipeDescription}>{generatedRecipe.description}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={Colors.accent} />
                <Text style={styles.metaText}>{generatedRecipe.prepTime} min</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={14} color={Colors.accent} />
                <Text style={styles.metaText}>{generatedRecipe.cookTime} min</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={14} color={Colors.accent} />
                <Text style={styles.metaText}>{generatedRecipe.servings} servings</Text>
              </View>
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Ingredients:</Text>
              {generatedRecipe.ingredients.slice(0, 5).map((ing: any, i: number) => (
                <Text key={i} style={styles.previewIngredient}>
                  • {ing.amount} {ing.unit} {ing.name}
                </Text>
              ))}
              {generatedRecipe.ingredients.length > 5 && (
                <Text style={styles.previewMore}>
                  +{generatedRecipe.ingredients.length - 5} more...
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveRecipe}
            activeOpacity={0.8}
          >
            <Ionicons name="save-outline" size={20} color={Colors.white} />
            <Text style={styles.saveButtonText}>Save to Collection</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.subtitle,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    minHeight: 120,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.button,
  },
  generateButtonText: {
    ...Typography.label,
    color: Colors.white,
    fontSize: 16,
  },
  resultSection: {
    marginTop: Spacing.xl,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  resultTitle: {
    ...Typography.subtitle,
    color: Colors.success,
  },
  recipePreview: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  recipeName: {
    ...Typography.cardTitle,
    fontSize: 22,
    marginBottom: Spacing.sm,
  },
  recipeDescription: {
    ...Typography.bodySmall,
    marginBottom: Spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.bodySmall,
  },
  previewSection: {
    marginTop: Spacing.sm,
  },
  previewLabel: {
    ...Typography.label,
    marginBottom: Spacing.sm,
  },
  previewIngredient: {
    ...Typography.bodySmall,
    marginBottom: 4,
  },
  previewMore: {
    ...Typography.caption,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    ...Shadows.button,
  },
  saveButtonText: {
    ...Typography.label,
    color: Colors.white,
    fontSize: 16,
  },
});
