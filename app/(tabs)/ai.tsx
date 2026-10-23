import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '@/components/AppText';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { useAppearance } from '@/contexts/AppearanceContext';
import { openScreenOverlay } from '@/services/screenOverlay';
import { recordBreadcrumb } from '@/services/crashTracker';
import { AssistantBackdrop } from '@/components/AssistantBackdrop';
import { ThemePagePattern } from '@/components/ThemePagePattern';
import { themeCardStyle } from '@/constants/themes';

export default function AIToolsScreen() {
  const { theme, design, displayFamily } = useAppearance();
  const cardTokens = themeCardStyle(design, theme);

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
    <AssistantBackdrop />
    <ThemePagePattern opacity={0.32} />
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontFamily: displayFamily }]}>AI Tools</Text>
        <Text style={styles.headerSubtitle}>Powered by smart recipe intelligence</Text>
      </View>

      <View style={styles.toolsContainer}>
        <TouchableOpacity
          style={[styles.toolCard, cardTokens, { backgroundColor: theme.card }]}
          onPress={() => {
            recordBreadcrumb('tap:ai-creator');
            openScreenOverlay('ai-creator');
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="chatbubbles" size={28} color="#9333EA" />
          </View>
          <Text style={[styles.toolTitle, { fontFamily: displayFamily }]}>Recipe Creator</Text>
          <Text style={styles.toolDescription}>
            Describe any recipe in plain words and ask for changes like “make it without curry”
          </Text>
          <View style={styles.toolAction}>
            <Text style={[styles.toolActionText, { color: theme.primary }]}>Start Creating</Text>
            <Ionicons name="arrow-forward" size={16} color={theme.primary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolCard, cardTokens, { backgroundColor: theme.card }]}
          onPress={() => {
            recordBreadcrumb('tap:ai-substitute');
            openScreenOverlay('ai-substitute');
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="swap-horizontal" size={28} color="#DD6B20" />
          </View>
          <Text style={[styles.toolTitle, { fontFamily: displayFamily }]}>Ingredient Substitutions</Text>
          <Text style={styles.toolDescription}>
            Find smart alternatives for ingredients you don't have or can't eat
          </Text>
          <View style={styles.toolAction}>
            <Text style={[styles.toolActionText, { color: theme.primary }]}>Find Substitutes</Text>
            <Ionicons name="arrow-forward" size={16} color={theme.primary} />
          </View>
        </TouchableOpacity>
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.xxxl,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    ...Typography.title,
    fontSize: 32,
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  toolsContainer: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  toolCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  toolTitle: {
    ...Typography.subtitle,
    marginBottom: Spacing.sm,
  },
  toolDescription: {
    ...Typography.bodySmall,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  toolAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  toolActionText: {
    ...Typography.label,
    color: Colors.primary,
  },
});
