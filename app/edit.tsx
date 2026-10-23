import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as db from '@/db';
import { AppText as Text, AppTextInput as TextInput } from '@/components/AppText';
import { useRecipes } from '@/hooks/useRecipes';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { Ingredient, Instruction } from '@/types/recipe';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { InstructionEditor } from '@/components/InstructionEditor';
import { useAppearance } from '@/contexts/AppearanceContext';
import { captureException } from '@/services/crashTracker';

export default function EditRecipeScreen() {
  const { theme } = useAppearance();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const idStr = Array.isArray(id) ? id[0] : id;
  const parsedId = idStr && !isNaN(parseInt(idStr, 10)) ? parseInt(idStr, 10) : null;
  const { updateRecipe } = useRecipes();
  const themedInput = [
    styles.input,
    { backgroundColor: theme.inputBackground, borderColor: theme.borderLight },
  ];

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [prepTime, setPrepTime] = useState('15');
  const [cookTime, setCookTime] = useState('30');
  const [servings, setServings] = useState('4');
  const [ingredients, setIngredients] = useState<(Omit<Ingredient, 'id'> & { id: string })[]>([]);
  const [instructions, setInstructions] = useState<(Omit<Instruction, 'id' | 'step'> & { id: string })[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [cropAspect, setCropAspect] = useState<[number, number]>([16, 9]);
  const [saving, setSaving] = useState(false);
  const category = 'Dinner';

  useEffect(() => {
    if (parsedId !== null) loadRecipe();
  }, [parsedId]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      const recipe = await db.getRecipeById(parsedId!);
      if (recipe) {
        setTitle(recipe.title);
        setDescription(recipe.description);
        setTags(recipe.tags.length > 0 ? recipe.tags : []);
        setPrepTime(recipe.prepTime.toString());
        setCookTime(recipe.cookTime.toString());
        setServings(recipe.servings.toString());
        setIngredients(recipe.ingredients.map(({ id, name, amount, unit, notes }) => ({ id, name, amount, unit, notes })));
        setInstructions(recipe.instructions.map(({ id, text, tip }) => ({ id, text, tip })));
        setImageUri(recipe.imageUri);
      }
    } catch (e) {
      captureException(e, { source: 'editRecipe.loadRecipe', extra: { recipeId: parsedId } });
      Alert.alert('Error', 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (aspect: [number, number] = cropAspect) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async (aspect: [number, number] = cropAspect) => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const chooseAspect = (source: 'camera' | 'library') => {
    Alert.alert('Crop shape', 'Choose how the photo is cropped', [
      { text: 'Wide (16:9)', onPress: () => { setCropAspect([16, 9]); source === 'camera' ? takePhoto([16, 9]) : pickImage([16, 9]); } },
      { text: 'Standard (4:3)', onPress: () => { setCropAspect([4, 3]); source === 'camera' ? takePhoto([4, 3]) : pickImage([4, 3]); } },
      { text: 'Square (1:1)', onPress: () => { setCropAspect([1, 1]); source === 'camera' ? takePhoto([1, 1]) : pickImage([1, 1]); } },
      { text: 'Portrait (3:4)', onPress: () => { setCropAspect([3, 4]); source === 'camera' ? takePhoto([3, 4]) : pickImage([3, 4]); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const showImagePicker = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Camera', onPress: () => chooseAspect('camera') },
      { text: 'Photo Library', onPress: () => chooseAspect('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { id: `ing-${Date.now()}-${ingredients.length}`, name: '', amount: '', unit: '' }]);
  };

  const updateIngredient = (index: number, field: keyof Omit<Ingredient, 'id'>, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    setInstructions([...instructions, { id: `inst-${Date.now()}-${instructions.length}`, text: '' }]);
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = { ...updated[index], text: value };
    setInstructions(updated);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((current) => [...current, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags((current) => current.filter((item) => item !== tag));
  };

  const validate = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a recipe title');
      return false;
    }
    if (ingredients.filter(i => i.name.trim()).length === 0) {
      Alert.alert('Error', 'Please add at least one ingredient');
      return false;
    }
    if (instructions.filter(i => i.text.trim()).length === 0) {
      Alert.alert('Error', 'Please add at least one instruction');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await updateRecipe(parsedId!, {
        title: title.trim(),
        description: description.trim(),
        category,
        tags,
        prepTime: parseInt(prepTime) || 0,
        cookTime: parseInt(cookTime) || 0,
        servings: parseInt(servings) || 1,
        ingredients: ingredients.filter(i => i.name.trim()),
        instructions: instructions.filter(i => i.text.trim()),
        imageUri,
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to update recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ErrorBoundary>
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: 'transparent' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={[styles.imageSection, { backgroundColor: theme.inputBackground }]}
          onPress={showImagePicker}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <View style={[styles.imagePlaceholder, { borderColor: theme.borderLight }]}>
              <Ionicons name="camera" size={32} color={theme.textMuted} />
              <Text style={styles.imagePlaceholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Title *</Text>
          <TextInput
            style={themedInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Recipe title"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <TextInput
            style={[themedInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Brief description..."
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tags</Text>
          <View style={styles.tagInputRow}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.inputBackground, borderColor: theme.borderLight, flex: 1 },
              ]}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Type a tag and press +"
              placeholderTextColor={theme.textMuted}
              returnKeyType="done"
              onSubmitEditing={addTag}
            />
            <TouchableOpacity
              style={[styles.addTagButton, { backgroundColor: theme.primary }]}
              onPress={addTag}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={22} color={theme.white} />
            </TouchableOpacity>
          </View>
          {tags.length > 0 && (
            <View style={styles.tagChipRow}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagChip, { backgroundColor: theme.inputBackground, borderColor: theme.borderLight }]}
                  onPress={() => removeTag(tag)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tagChipText, { color: theme.text }]}>{tag}</Text>
                  <Ionicons name="close-circle" size={14} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.row}>
          <View style={[styles.section, styles.flex1]}>
            <Text style={styles.sectionLabel}>Prep (min)</Text>
            <TextInput
              style={themedInput}
              value={prepTime}
              onChangeText={setPrepTime}
              keyboardType="numeric"
              placeholder="15"
              placeholderTextColor={theme.textMuted}
            />
          </View>
          <View style={[styles.section, styles.flex1]}>
            <Text style={styles.sectionLabel}>Cook (min)</Text>
            <TextInput
              style={themedInput}
              value={cookTime}
              onChangeText={setCookTime}
              keyboardType="numeric"
              placeholder="30"
              placeholderTextColor={theme.textMuted}
            />
          </View>
          <View style={[styles.section, styles.flex1]}>
            <Text style={styles.sectionLabel}>Servings</Text>
            <TextInput
              style={themedInput}
              value={servings}
              onChangeText={setServings}
              keyboardType="numeric"
              placeholder="4"
              placeholderTextColor={theme.textMuted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Ingredients *</Text>
            <TouchableOpacity onPress={addIngredient} style={styles.addButton}>
              <Ionicons name="add-circle" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
          {ingredients.map((ing, index) => (
            <View key={ing.id} style={styles.ingredientRow}>
              <TextInput
                style={[themedInput, styles.ingredientName]}
                value={ing.name}
                onChangeText={v => updateIngredient(index, 'name', v)}
                placeholder="Ingredient"
                placeholderTextColor={theme.textMuted}
              />
              <TextInput
                style={[themedInput, styles.ingredientAmount]}
                value={ing.amount}
                onChangeText={v => updateIngredient(index, 'amount', v)}
                placeholder="Amt"
                placeholderTextColor={theme.textMuted}
              />
              <TextInput
                style={[themedInput, styles.ingredientUnit]}
                value={ing.unit}
                onChangeText={v => updateIngredient(index, 'unit', v)}
                placeholder="Unit"
                placeholderTextColor={theme.textMuted}
              />
              <TouchableOpacity onPress={() => removeIngredient(index)} style={styles.removeButton}>
                <Ionicons name="close-circle" size={20} color={theme.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Instructions *</Text>
            <TouchableOpacity onPress={addInstruction} style={styles.addButton}>
              <Ionicons name="add-circle" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
          {instructions.map((inst, index) => (
            <InstructionEditor
              key={inst.id}
              index={index}
              value={inst.text}
              onChangeText={v => updateInstruction(index, v)}
              onRemove={() => removeInstruction(index)}
              placeholder={`Step ${index + 1}...`}
            />
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View
        style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.borderLight }]}
      >
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary, shadowColor: theme.shadow }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={[styles.saveButtonText, { color: theme.white }]}>
            {saving ? 'Updating...' : 'Update Recipe'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageSection: {
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.inputBackground,
    height: 200,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
  },
  imagePlaceholderText: {
    ...Typography.bodySmall,
    marginTop: Spacing.sm,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.label,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tagChipText: {
    ...Typography.label,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  flex1: {
    flex: 1,
    marginHorizontal: 0,
    marginBottom: 0,
  },
  addButton: {
    padding: Spacing.xs,
  },
  ingredientRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  ingredientName: {
    flex: 2,
  },
  ingredientAmount: {
    flex: 0.8,
  },
  ingredientUnit: {
    flex: 0.8,
  },
  instructionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'flex-start',
  },
  stepNumber: {
    ...Typography.label,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 24,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  instructionInput: {
    flex: 1,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  removeButton: {
    padding: Spacing.xs,
    marginTop: Spacing.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.button,
  },
  saveButtonText: {
    ...Typography.label,
    color: Colors.white,
    fontSize: 16,
  },
  bottomPadding: {
    height: Spacing.xxxl,
  },
});
