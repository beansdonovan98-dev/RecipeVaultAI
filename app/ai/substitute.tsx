import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text, AppTextInput as TextInput } from '@/components/AppText';
import { getIngredientSubstitution, getAllSubstitutions } from '@/services/ai';
import { useAssistant } from '@/contexts/AssistantContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AssistantBackdrop } from '@/components/AssistantBackdrop';
import { ThemePagePattern } from '@/components/ThemePagePattern';
import { captureException, recordBreadcrumb } from '@/services/crashTracker';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { useAppearance } from '@/contexts/AppearanceContext';
import { themeCardStyle } from '@/constants/themes';
import { ThemeCardPattern } from '@/components/ThemeCardPattern';

export default function AISubstituteScreen() {
  const { theme, design, displayFamily } = useAppearance();
  const { name: assistantName } = useAssistant();
  const cardTokens = themeCardStyle(design, theme);
  const [ingredient, setIngredient] = useState('');
  const [substitutions, setSubstitutions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [allSubs, setAllSubs] = useState<Record<string, string[]>>({});
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    recordBreadcrumb('screen-mount:ai-substitute');
    loadAllSubstitutions();
  }, []);

  const loadAllSubstitutions = async () => {
    try {
      const data = await getAllSubstitutions();
      setAllSubs(data);
    } catch (e) {
      captureException(e, { source: 'aiSubstitute.loadAllSubstitutions' });
    }
  };

  const handleSearch = async () => {
    if (!ingredient.trim()) return;
    setLoading(true);
    try {
      const results = await getIngredientSubstitution(ingredient, assistantName);
      setSubstitutions(results);
    } catch (e) {
      captureException(e, { source: 'aiSubstitute.getIngredientSubstitution', extra: { ingredient } });
      setSubstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
    <AssistantBackdrop />
    <ThemePagePattern opacity={0.32} />
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Find Substitutions</Text>
        <Text style={styles.sectionSubtitle}>
          Enter an ingredient to find smart alternatives
        </Text>
        <View style={styles.searchRow}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.inputBackground, borderColor: theme.borderLight },
            ]}
            value={ingredient}
            onChangeText={setIngredient}
            placeholder="e.g., butter, milk, eggs..."
            placeholderTextColor={theme.textMuted}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: theme.primary }]}
            onPress={handleSearch}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={theme.white} size="small" />
            ) : (
              <Ionicons name="search" size={20} color={theme.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {substitutions.length > 0 && (
        <View style={styles.resultSection}>
          <View style={styles.resultHeader}>
            <Ionicons name="swap-horizontal" size={24} color={theme.accent} />
            <Text style={[styles.resultTitle, { fontFamily: displayFamily }]}>
              Substitutes for "{ingredient}"
            </Text>
          </View>
          <View
            style={[
              styles.substitutionsList,
              cardTokens,
              { backgroundColor: theme.card },
            ]}
          >
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { borderRadius: design.cardRadius, overflow: 'hidden', opacity: 0.55 },
              ]}
            >
              <ThemeCardPattern pattern={design.cardPattern} palette={theme} />
            </View>
            {substitutions.map((sub, index) => (
              <View
                key={index}
                style={[styles.substitutionItem, { borderBottomColor: theme.borderLight }]}
              >
                <View style={[styles.substitutionIcon, { backgroundColor: theme.inputBackground }]}>
                  <Ionicons name="arrow-forward" size={14} color={theme.primary} />
                </View>
                <Text style={styles.substitutionText}>{sub}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.browseSection}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowAll(!showAll)}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleButtonText, { color: theme.primary }]}>
            {showAll ? 'Hide' : 'Browse'} All Substitutions
          </Text>
          <Ionicons
            name={showAll ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={theme.primary}
          />
        </TouchableOpacity>

        {showAll && (
          <View style={styles.allSubsList}>
            {Object.entries(allSubs).map(([key, values]) => (
              <View
                key={key}
                style={[
                  styles.allSubsItem,
                  { backgroundColor: theme.card, borderColor: theme.borderLight },
                ]}
              >
                <Text style={styles.allSubsIngredient}>{key}</Text>
                <View style={styles.allSubsValues}>
                  {values.map((v, i) => (
                    <View
                      key={i}
                      style={[styles.allSubsValue, { backgroundColor: theme.inputBackground }]}
                    >
                      <Text style={[styles.allSubsValueText, { color: theme.primary }]}>{v}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  searchSection: {
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
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultSection: {
    marginBottom: Spacing.xl,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  resultTitle: {
    ...Typography.subtitle,
    flex: 1,
  },
  substitutionsList: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  substitutionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  substitutionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  substitutionText: {
    ...Typography.body,
    flex: 1,
  },
  browseSection: {
    marginTop: Spacing.lg,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  toggleButtonText: {
    ...Typography.label,
    color: Colors.primary,
  },
  allSubsList: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  allSubsItem: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  allSubsIngredient: {
    ...Typography.label,
    marginBottom: Spacing.sm,
    textTransform: 'capitalize',
  },
  allSubsValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  allSubsValue: {
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  allSubsValueText: {
    ...Typography.caption,
    color: Colors.primary,
  },
});
