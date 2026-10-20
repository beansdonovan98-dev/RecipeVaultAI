import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '@/components/AppText';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';

interface ConversionRow {
  label: string;
  value: string;
}

interface MeatTempRow {
  food: string;
  temp: string;
  note: string;
}

const VOLUME_CONVERSIONS: ConversionRow[] = [
  { label: '1 teaspoon', value: '5 ml' },
  { label: '1 tablespoon', value: '3 teaspoons · 15 ml' },
  { label: '1 fluid ounce', value: '2 tablespoons · 30 ml' },
  { label: '1 cup', value: '16 tablespoons · 240 ml' },
  { label: '1 pint', value: '2 cups · 480 ml' },
  { label: '1 quart', value: '4 cups · 960 ml' },
  { label: '1 gallon', value: '4 quarts · 3.79 L' },
  { label: '1 liter', value: '4.23 cups · 33.8 fl oz' },
];

const WEIGHT_CONVERSIONS: ConversionRow[] = [
  { label: '1 ounce', value: '28.35 g' },
  { label: '1 pound', value: '16 ounces · 454 g' },
  { label: '1 kilogram', value: '2.2 pounds · 35.3 oz' },
];

const INGREDIENT_WEIGHTS: ConversionRow[] = [
  { label: 'All-purpose flour, 1 cup', value: '120 g' },
  { label: 'Granulated sugar, 1 cup', value: '200 g' },
  { label: 'Brown sugar, packed 1 cup', value: '220 g' },
  { label: 'Butter, 1 cup', value: '227 g' },
  { label: 'Rolled oats, 1 cup', value: '90 g' },
  { label: 'Dry white rice, 1 cup', value: '185 g' },
  { label: 'Cocoa powder, 1 cup', value: '85 g' },
  { label: 'Honey, 1 cup', value: '340 g' },
  { label: 'Grated parmesan, 1 cup', value: '100 g' },
  { label: 'Milk, 1 cup', value: '245 g' },
];

const OVEN_TEMPERATURES: ConversionRow[] = [
  { label: '275°F', value: '135°C · very low' },
  { label: '300°F', value: '150°C · low' },
  { label: '325°F', value: '165°C · low-medium' },
  { label: '350°F', value: '175°C · moderate' },
  { label: '375°F', value: '190°C · medium' },
  { label: '400°F', value: '200°C · moderately hot' },
  { label: '425°F', value: '220°C · hot' },
  { label: '450°F', value: '230°C · very hot' },
  { label: '500°F', value: '260°C · extremely hot' },
];

const MEAT_TEMPERATURES: MeatTempRow[] = [
  { food: 'Beef, lamb, or veal steak/roast — rare', temp: '125°F · 52°C', note: 'Rest 3-5 minutes' },
  { food: 'Beef, lamb, or veal steak/roast — medium rare', temp: '135°F · 57°C', note: 'Rest 3-5 minutes' },
  { food: 'Beef, lamb, or veal steak/roast — medium', temp: '145°F · 63°C', note: 'Rest 3-5 minutes' },
  { food: 'Beef, lamb, or veal steak/roast — medium well', temp: '150°F · 66°C', note: 'Rest 3-5 minutes' },
  { food: 'Beef, lamb, or veal steak/roast — well done', temp: '160°F · 71°C', note: 'Rest 3-5 minutes' },
  { food: 'Ground beef, pork, lamb, or veal', temp: '160°F · 71°C', note: 'No pink remains' },
  { food: 'Pork chops, roasts, and fresh ham', temp: '145°F · 63°C', note: 'Rest 3 minutes' },
  { food: 'Pre-cooked ham, reheating', temp: '140°F · 60°C', note: 'Until steaming hot' },
  { food: 'Chicken and turkey, all cuts', temp: '165°F · 74°C', note: 'Thickest part, no bone' },
  { food: 'Fish and seafood', temp: '145°F · 63°C', note: 'Flesh opaque and flakes' },
  { food: 'Shrimp, scallops, and shellfish', temp: 'Visual doneness', note: 'Opaque and shells open' },
  { food: 'Eggs and egg dishes', temp: '160°F · 71°C', note: 'Yolks and whites firm' },
  { food: 'Leftovers and casseroles', temp: '165°F · 74°C', note: 'Until steaming hot' },
  { food: 'Game meats', temp: '160°F · 71°C', note: 'Steaks may be 145°F if preferred' },
];

function ConversionList({ rows }: { rows: ConversionRow[] }) {
  return (
    <View style={styles.table}>
      {rows.map((row) => (
        <View key={row.label} style={styles.conversionRow}>
          <Text style={styles.conversionLabel}>{row.label}</Text>
          <Text style={styles.conversionValue}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

function MeatTempList({ rows }: { rows: MeatTempRow[] }) {
  return (
    <View style={styles.table}>
      {rows.map((row) => (
        <View key={`${row.food}-${row.temp}`} style={styles.meatRow}>
          <View style={styles.meatTextBlock}>
            <Text style={styles.meatFood}>{row.food}</Text>
            <Text style={styles.meatNote}>{row.note}</Text>
          </View>
          <Text style={styles.meatTemp}>{row.temp}</Text>
        </View>
      ))}
    </View>
  );
}

function SectionCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon as any} size={22} color={Colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

export default function CheatSheetScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cooking Cheat Sheet</Text>
        <Text style={styles.headerSubtitle}>
          Common conversions, oven temperatures, and safe meat temperatures.
        </Text>
      </View>

      <SectionCard
        title="Volume"
        subtitle="Teaspoons, cups, and metric"
        icon="beaker-outline"
      >
        <ConversionList rows={VOLUME_CONVERSIONS} />
      </SectionCard>

      <SectionCard title="Weight" subtitle="Ounces, pounds, grams, and kilograms" icon="scale-outline">
        <ConversionList rows={WEIGHT_CONVERSIONS} />
      </SectionCard>

      <SectionCard title="Cup to Grams" subtitle="Common baking and cooking ingredients" icon="nutrition-outline">
        <ConversionList rows={INGREDIENT_WEIGHTS} />
      </SectionCard>

      <SectionCard title="Oven Temperatures" subtitle="Fahrenheit and Celsius" icon="flame-outline">
        <ConversionList rows={OVEN_TEMPERATURES} />
      </SectionCard>

      <SectionCard
        title="Meat Temperatures"
        subtitle="Use a thermometer in the thickest part"
        icon="thermometer-outline"
      >
        <MeatTempList rows={MEAT_TEMPERATURES} />
      </SectionCard>

      <View style={styles.tipsCard}>
        <Ionicons name="checkmark-circle-outline" size={20} color={Colors.success} />
        <View style={styles.tipTextBlock}>
          <Text style={styles.tipTitle}>Thermometer tips</Text>
          <Text style={styles.tipText}>
            Avoid bone and fat, rest roasts before slicing, and remember carryover heat can raise
            the final temperature by 5-10°F.
          </Text>
        </View>
      </View>
    </ScrollView>
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
  header: {
    paddingBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  headerTitle: {
    ...Typography.title,
    fontSize: 30,
  },
  headerSubtitle: {
    ...Typography.bodySmall,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.tipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    ...Typography.subtitle,
  },
  cardSubtitle: {
    ...Typography.caption,
  },
  table: {
    gap: 2,
  },
  conversionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  conversionLabel: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  conversionValue: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
  },
  meatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  meatTextBlock: {
    flex: 1,
    gap: 2,
  },
  meatFood: {
    ...Typography.body,
    color: Colors.text,
  },
  meatNote: {
    ...Typography.caption,
  },
  meatTemp: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '700',
    textAlign: 'right',
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: '#C6F6D5',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  tipTextBlock: {
    flex: 1,
    gap: 2,
  },
  tipTitle: {
    ...Typography.label,
    color: Colors.success,
  },
  tipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
});
