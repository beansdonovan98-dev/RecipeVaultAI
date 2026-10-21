import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text, AppTextInput as TextInput } from '@/components/AppText';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import type { ThemePalette } from '@/constants/themes';
import { useAppearance } from '@/contexts/AppearanceContext';
import { themeCardStyle } from '@/constants/themes';
import { useAssistant } from '@/contexts/AssistantContext';
import { createRecipeFromChat, type CreatorMessage } from '@/services/recipeCreator';
import { isGeminiConfigured } from '@/services/gemini';
import { addRecipe, getMember, setMember } from '@/db';
import { AUTHORS, type AuthorId } from '@/constants/authors';
import { notifyDataChanged } from '@/services/dataEvents';
import { syncRecipes } from '@/services/recipeSync';
import { captureException, recordBreadcrumb } from '@/services/crashTracker';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AssistantBackdrop } from '@/components/AssistantBackdrop';
import { ThemePagePattern } from '@/components/ThemePagePattern';
import { ThemeCardPattern } from '@/components/ThemeCardPattern';
import type { RecipeInput } from '@/types/recipe';

interface CreatorTurn {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  reply?: string;
  recipe?: RecipeInput;
  /** The request that produced this turn, kept so a failure can be retried. */
  prompt?: string;
  error?: string;
  loading?: boolean;
}

function describeCreatorError(error: unknown, name: string): string {
  if (error instanceof Error) {
    if (error.name === 'GeminiTimeoutError') {
      return `${name} took too long to answer. Please try again.`;
    }
    if (error.name === 'AbortError') {
      return 'That request was cancelled. Please try again.';
    }
    return error.message;
  }
  return 'Could not create that recipe. Please try again.';
}

/**
 * The waiting bubble. A recipe can take a while on a busy model, so after a
 * few seconds it admits that it is still working instead of spinning silently.
 */
function CookingBubble({ name, theme }: { name: string; theme: ThemePalette }) {
  const [patient, setPatient] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPatient(true), 12000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.assistantBubble, { backgroundColor: theme.inputBackground }]}>
      <ActivityIndicator size="small" color={theme.primary} />
      <View style={styles.thinkingCopy}>
        <Text style={[styles.thinkingText, { color: theme.textMuted }]}>{name} is cooking…</Text>
        {patient ? (
          <Text style={[styles.thinkingText, { color: theme.textMuted }]}>
            Still cooking — a full recipe can take a minute.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

interface CreatorScreenProps {
  onClose?: () => void;
}

let turnCounter = 0;
function nextTurnId(): string {
  turnCounter += 1;
  return `turn-${turnCounter}`;
}

export default function AICreatorScreen(_props: CreatorScreenProps) {
  const { theme, design, displayFamily } = useAppearance();
  const cardTokens = themeCardStyle(design, theme);
  const { name: assistantName, persona } = useAssistant();
  const [turns, setTurns] = useState<CreatorTurn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const configured = isGeminiConfigured();

  useEffect(() => {
    recordBreadcrumb('screen-mount:ai-creator');
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [turns]);

  const buildHistory = useCallback((current: CreatorTurn[]): CreatorMessage[] => {
    const history: CreatorMessage[] = [];
    for (const turn of current) {
      if (turn.role === 'user' && turn.text) {
        history.push({ role: 'user', content: turn.text });
      } else if (turn.role === 'assistant' && turn.recipe) {
        history.push({ role: 'model', content: JSON.stringify(turn.recipe) });
      }
    }
    return history;
  }, []);

  const sendPrompt = useCallback(
    async (prompt: string, replaceTurnId?: string) => {
      if (!prompt || busy) {
        return;
      }

      const assistantTurn: CreatorTurn = {
        id: nextTurnId(),
        role: 'assistant',
        loading: true,
        prompt,
      };
      const history: CreatorMessage[] = replaceTurnId
        ? buildHistory(turns.filter((turn) => turn.id !== replaceTurnId))
        : [...buildHistory(turns), { role: 'user', content: prompt }];

      setTurns((prev) => {
        if (replaceTurnId) {
          return [...prev.filter((turn) => turn.id !== replaceTurnId), assistantTurn];
        }
        return [
          ...prev,
          { id: nextTurnId(), role: 'user', text: prompt },
          assistantTurn,
        ];
      });
      setBusy(true);

      try {
        const { reply, recipe } = await createRecipeFromChat(history, {
          name: assistantName,
          instructions: persona.instructions,
        });
        setTurns((prev) =>
          prev.map((turn) =>
            turn.id === assistantTurn.id ? { ...turn, loading: false, reply, recipe } : turn
          )
        );
      } catch (error) {
        const aborted = error instanceof Error && error.name === 'AbortError';
        if (!aborted) {
          captureException(error, { source: 'aiCreator.generate' });
        }
        setTurns((prev) =>
          prev.map((turn) =>
            turn.id === assistantTurn.id
              ? { ...turn, loading: false, error: describeCreatorError(error, assistantName) }
              : turn
          )
        );
      } finally {
        setBusy(false);
      }
    },
    [assistantName, buildHistory, busy, persona, turns]
  );

  const handleSend = useCallback(() => {
    const prompt = input.trim();
    if (!prompt || busy) {
      return;
    }
    setInput('');
    void sendPrompt(prompt);
  }, [busy, input, sendPrompt]);

  const saveAs = useCallback(async (turnId: string, recipe: RecipeInput, author: AuthorId) => {
    try {
      await addRecipe(recipe, author);
      notifyDataChanged();
      syncRecipes().catch((syncError) => {
        console.warn('[SYNC] AI creator recipe sync failed', syncError);
        recordBreadcrumb('sync:ai-creator-recipe-failed');
      });
      Alert.alert('Saved', 'Recipe saved to your collection!');
    } catch (error) {
      captureException(error, { source: 'aiCreator.saveAs' });
      Alert.alert('Error', 'Failed to save recipe.');
    } finally {
      setSavingId(null);
    }
  }, []);

  const saveRecipe = useCallback(
    async (turnId: string, recipe: RecipeInput) => {
      setSavingId(turnId);
      try {
        const member = await getMember();
        if (member) {
          await saveAs(turnId, recipe, member);
          return;
        }

        Alert.alert(
          'Who is posting?',
          'Choose which person is using this phone so the recipe is labeled correctly.',
          [
            {
              text: AUTHORS.daddy.label,
              onPress: () => {
                void setMember('daddy')
                  .catch((error) => captureException(error, { source: 'aiCreator.setMember' }))
                  .then(() => notifyDataChanged())
                  .then(() => void saveAs(turnId, recipe, 'daddy'));
              },
            },
            {
              text: AUTHORS.princess.label,
              onPress: () => {
                void setMember('princess')
                  .catch((error) => captureException(error, { source: 'aiCreator.setMember' }))
                  .then(() => notifyDataChanged())
                  .then(() => void saveAs(turnId, recipe, 'princess'));
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } catch (error) {
        captureException(error, { source: 'aiCreator.saveRecipe' });
        Alert.alert('Error', 'Failed to save recipe.');
      } finally {
        setSavingId(null);
      }
    },
    [saveAs]
  );

  const renderTurn = (turn: CreatorTurn) => {
    if (turn.role === 'user') {
      return (
        <View key={turn.id} style={styles.userRow}>
          <View style={[styles.userBubble, { backgroundColor: theme.primary }]}>
            <Text style={[styles.userBubbleText, { color: theme.white }]}>{turn.text}</Text>
          </View>
        </View>
      );
    }

    if (turn.loading) {
      return (
        <View key={turn.id} style={styles.assistantRow}>
          <CookingBubble name={assistantName} theme={theme} />
        </View>
      );
    }

    if (turn.error) {
      const retryPrompt = turn.prompt;
      return (
        <View key={turn.id} style={styles.assistantGroup}>
          <View style={[styles.errorBubble, { backgroundColor: theme.tipBackground }]}>
            <Ionicons name="alert-circle-outline" size={16} color={theme.error} />
            <Text style={[styles.errorText, { color: theme.error }]}>{turn.error}</Text>
          </View>
          {retryPrompt ? (
            <TouchableOpacity
              style={[styles.retryButton, { borderColor: theme.borderLight }]}
              onPress={() => void sendPrompt(retryPrompt, turn.id)}
              disabled={busy}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Try again"
            >
              <Ionicons name="refresh" size={14} color={theme.primary} />
              <Text style={[styles.retryText, { color: theme.primary }]}>Try again</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }

    if (turn.recipe) {
      const recipe = turn.recipe;
      return (
        <View key={turn.id} style={styles.assistantGroup}>
          {turn.reply ? (
            <View style={[styles.replyBubble, { backgroundColor: theme.inputBackground }]}>
              <Text style={[styles.replyText, { color: theme.text }]}>{turn.reply}</Text>
            </View>
          ) : null}
          <View
            style={[
              styles.recipeCard,
              cardTokens,
              { backgroundColor: theme.card },
            ]}
          >
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { borderRadius: design.cardRadius, overflow: 'hidden', opacity: 0.45 },
              ]}
            >
              <ThemeCardPattern pattern={design.cardPattern} palette={theme} />
            </View>
            <View style={styles.recipeHeader}>
              <Ionicons name="sparkles" size={16} color={theme.accent} />
              <Text style={[styles.recipeTitle, { fontFamily: displayFamily }]}>{recipe.title}</Text>
            </View>
            <Text style={[styles.recipeDescription, { color: theme.textSecondary }]}>{recipe.description}</Text>

            <View style={[styles.metaRow, { borderColor: theme.borderLight }]}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={13} color={theme.accent} />
                <Text style={styles.metaText}>{recipe.prepTime} min</Text>
              </View>
              <View style={[styles.metaDivider, { backgroundColor: theme.borderLight }]} />
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={13} color={theme.accent} />
                <Text style={styles.metaText}>{recipe.cookTime} min</Text>
              </View>
              <View style={[styles.metaDivider, { backgroundColor: theme.borderLight }]} />
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={13} color={theme.accent} />
                <Text style={styles.metaText}>{recipe.servings} servings</Text>
              </View>
            </View>

            <Text style={[styles.sectionLabel, { color: theme.accent }]}>Ingredients</Text>
            {recipe.ingredients.map((ingredient, index) => (
              <Text key={`${ingredient.name}-${index}`} style={[styles.ingredientLine, { color: theme.text }]}>
                {`• ${ingredient.amount}${ingredient.unit ? ` ${ingredient.unit}` : ''} ${ingredient.name}`.trim()}
              </Text>
            ))}

            <Text style={[styles.sectionLabel, { color: theme.accent }]}>Instructions</Text>
            {recipe.instructions.map((instruction, index) => (
              <View key={`step-${index}`} style={styles.stepRow}>
                <View style={[styles.stepBadge, { backgroundColor: theme.primary }]}>
                  <Text style={[styles.stepBadgeText, { color: theme.white }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: theme.text }]}>{instruction.text}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: theme.success },
                savingId === turn.id && styles.disabledButton,
              ]}
              onPress={() => void saveRecipe(turn.id, recipe)}
              disabled={savingId !== null}
              activeOpacity={0.8}
            >
              {savingId === turn.id ? (
                <ActivityIndicator color={theme.white} />
              ) : (
                <>
                  <Ionicons name="bookmark-outline" size={18} color={theme.white} />
                  <Text style={[styles.saveButtonText, { color: theme.white }]}>Save Recipe</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <ErrorBoundary>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: 'transparent' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AssistantBackdrop />
        <ThemePagePattern opacity={0.32} />
        <ScrollView
          ref={scrollRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
        >
          {turns.length === 0 ? (
            <View
              style={[
                styles.introCard,
                cardTokens,
                { backgroundColor: theme.card },
              ]}
            >
              <Ionicons name="sparkles" size={28} color={theme.accent} />
              <Text style={[styles.introTitle, { fontFamily: displayFamily }]}>{assistantName}</Text>
              <Text style={[styles.introText, { color: theme.textSecondary }]}>
                Tell me what you want to make in plain words — “baked chicken over rice recipe”, “chicken
                marsala recipe”, “healthy milkshake recipe”. Then ask me to change it: “make it without
                curry”, “make it vegan”, “spicier”. You can rename me in the Customize tab.
              </Text>
            </View>
          ) : null}
          {turns.map(renderTurn)}
        </ScrollView>

        <View
          style={[
            styles.inputBar,
            { backgroundColor: theme.card, borderTopColor: theme.borderLight },
          ]}
        >
          {configured ? (
            <>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.inputBackground, borderColor: theme.borderLight, color: theme.text },
                ]}
                value={input}
                onChangeText={setInput}
                placeholder={`Ask ${assistantName} for a recipe…`}
                placeholderTextColor={theme.textMuted}
                multiline
                editable={!busy}
              />
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: theme.primary }, busy && styles.disabledButton]}
                onPress={() => void handleSend()}
                disabled={busy || input.trim().length === 0}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Send"
              >
                {busy ? (
                  <ActivityIndicator size="small" color={theme.white} />
                ) : (
                  <Ionicons name="send" size={18} color={theme.white} />
                )}
              </TouchableOpacity>
            </>
          ) : (
            <Text style={[styles.notConfigured, { color: theme.textMuted }]}>
              Add a Gemini API key (EXPO_PUBLIC_GEMINI_API_KEY) to enable the Recipe Creator.
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesScroll: {
    flex: 1,
  },
  messages: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  introCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.card,
  },
  introTitle: {
    ...Typography.subtitle,
  },
  introText: {
    ...Typography.body,
    lineHeight: 21,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  userBubble: {
    maxWidth: '82%',
    borderRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  userBubbleText: {
    ...Typography.body,
    lineHeight: 20,
  },
  assistantRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  assistantGroup: {
    gap: Spacing.sm,
  },
  replyBubble: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    borderRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  replyText: {
    ...Typography.body,
    lineHeight: 20,
  },
  assistantBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    maxWidth: '82%',
    borderRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  thinkingCopy: {
    flexShrink: 1,
  },
  thinkingText: {
    ...Typography.body,
  },
  errorText: {
    ...Typography.bodySmall,
    flexShrink: 1,
  },
  errorBubble: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  retryButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  retryText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  recipeCard: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.card,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  recipeTitle: {
    ...Typography.cardTitle,
    flex: 1,
    fontSize: 20,
  },
  recipeDescription: {
    ...Typography.bodySmall,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.bodySmall,
  },
  metaDivider: {
    width: 1,
    height: 14,
  },
  sectionLabel: {
    ...Typography.label,
    textTransform: 'uppercase',
    marginTop: Spacing.xs,
  },
  ingredientLine: {
    ...Typography.bodySmall,
    lineHeight: 19,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    ...Typography.bodySmall,
    flex: 1,
    lineHeight: 19,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
    ...Shadows.button,
  },
  saveButtonText: {
    ...Typography.label,
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notConfigured: {
    ...Typography.bodySmall,
    flex: 1,
  },
});
