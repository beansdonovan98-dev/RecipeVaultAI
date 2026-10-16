import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

export default function AIToolsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Tools</Text>
        <Text style={styles.headerSubtitle}>Powered by smart recipe intelligence</Text>
      </View>

      <View style={styles.toolsContainer}>
        <TouchableOpacity
          style={styles.toolCard}
          onPress={() => router.push('/ai/generate')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="sparkles" size={28} color="#38A169" />
          </View>
          <Text style={styles.toolTitle}>Recipe Generator</Text>
          <Text style={styles.toolDescription}>
            Enter your available ingredients and AI will create a custom recipe for you
          </Text>
          <View style={styles.toolAction}>
            <Text style={styles.toolActionText}>Generate Recipe</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolCard}
          onPress={() => router.push('/ai/substitute')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="swap-horizontal" size={28} color="#DD6B20" />
          </View>
          <Text style={styles.toolTitle}>Ingredient Substitutions</Text>
          <Text style={styles.toolDescription}>
            Find smart alternatives for ingredients you don't have or can't eat
          </Text>
          <View style={styles.toolAction}>
            <Text style={styles.toolActionText}>Find Substitutes</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
