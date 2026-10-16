import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRecipes } from '@/hooks/useRecipes';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { ALL_CATEGORIES, Category, Ingredient, Instruction } from '@/types/recipe';
import { CategoryBadge } from '@/components/CategoryBadge';

export default function AddRecipeScreen() {
  const router = useRouter();
  const { addRecipe } = useRecipes();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Dinner');
  const [prepTime, setPrepTime] = useState('15');
  const [cookTime, setCookTime] = useState('30');
  const [servings, setServings] = useState('4');
  const [ingredients, setIngredients] = useState<Omit<Ingredient, 'id'>[]>([
    { name: '', amount: '', unit: '' },
  ]);
  const [instructions, setInstructions] = useState<Omit<Instruction, 'id' | 'step'>[]>([
    { text: '' },
  ]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const showImagePicker = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }]);
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
    setInstructions([...instructions, { text: '' }]);
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = { ...updated[index], text: value };
    setInstructions(updated);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
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
      await addRecipe({
        title: title.trim(),
        description: description.trim(),
        category,
        prepTime: parseInt(prepTime) || 0,
        cookTime: parseInt(cookTime) || 0,
        servings: parseInt(servings) || 1,
        ingredients: ingredients.filter(i => i.name.trim()),
        instructions: instructions.filter(i => i.text.trim()),
        imageUri,
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.imageSection} onPress={showImagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={32} color={Colors.textMuted} />
              <Text style={styles.imagePlaceholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Grandma's Apple Pie"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Brief description of the recipe..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {ALL_CATEGORIES.map(cat => (
              <CategoryBadge
                key={cat}
                category={cat}
                selected={category === cat}
                onPress={() => setCategory(cat)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.row}>
          <View style={[styles.section, styles.flex1]}>
            <Text style={styles.sectionLabel}>Prep Time (min)</Text>
            <TextInput
              style={styles.input}
              value={prepTime}
              onChangeText={setPrepTime}
              keyboardType="numeric"
              placeholder="15"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          <View style={[styles.section, styles.flex1]}>
            <Text style={styles.sectionLabel}>Cook Time (min)</Text>
            <TextInput
              style={styles.input}
              value={cookTime}
              onChangeText={setCookTime}
              keyboardType="numeric"
              placeholder="30"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          <View style={[styles.section, styles.flex1]}>
            <Text style={styles.sectionLabel}>Servings</Text>
            <TextInput
              style={styles.input}
              value={servings}
              onChangeText={setServings}
              keyboardType="numeric"
              placeholder="4"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Ingredients *</Text>
            <TouchableOpacity onPress={addIngredient} style={styles.addButton}>
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {ingredients.map((ing, index) => (
            <View key={index} style={styles.ingredientRow}>
              <TextInput
                style={[styles.input, styles.ingredientName]}
                value={ing.name}
                onChangeText={v => updateIngredient(index, 'name', v)}
                placeholder="Ingredient"
                placeholderTextColor={Colors.textMuted}
              />
              <TextInput
                style={[styles.input, styles.ingredientAmount]}
                value={ing.amount}
                onChangeText={v => updateIngredient(index, 'amount', v)}
                placeholder="Amt"
                placeholderTextColor={Colors.textMuted}
              />
              <TextInput
                style={[styles.input, styles.ingredientUnit]}
                value={ing.unit}
                onChangeText={v => updateIngredient(index, 'unit', v)}
                placeholder="Unit"
                placeholderTextColor={Colors.textMuted}
              />
              <TouchableOpacity onPress={() => removeIngredient(index)} style={styles.removeButton}>
                <Ionicons name="close-circle" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Instructions *</Text>
            <TouchableOpacity onPress={addInstruction} style={styles.addButton}>
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {instructions.map((inst, index) => (
            <View key={index} style={styles.instructionRow}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <TextInput
                style={[styles.input, styles.instructionInput]}
                value={inst.text}
                onChangeText={v => updateInstruction(index, v)}
                placeholder={`Step ${index + 1}...`}
                placeholderTextColor={Colors.textMuted}
                multiline
              />
              <TouchableOpacity onPress={() => removeInstruction(index)} style={styles.removeButton}>
                <Ionicons name="close-circle" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Recipe'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  categoryList: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
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
