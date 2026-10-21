import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '@/components/AppText';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useAppearance } from '@/contexts/AppearanceContext';

interface ConversionRow {
  label: string;
  value: string;
}

interface MeatCut {
  cut: string;
  temp: string;
  note: string;
}

interface MeatCategory {
  name: string;
  cuts: MeatCut[];
}

const US_VOLUME: ConversionRow[] = [
  { label: '1 teaspoon', value: '5 ml' },
  { label: '1 tablespoon', value: '3 teaspoons · 15 ml' },
  { label: '1 fluid ounce', value: '2 tablespoons · 30 ml' },
  { label: '1 cup', value: '8 fl oz · 16 tbsp · 240 ml' },
  { label: '1 pint', value: '2 cups · 480 ml' },
  { label: '1 quart', value: '4 cups · 960 ml' },
  { label: '1 gallon', value: '4 quarts · 3.79 L' },
];

const CUP_FRACTIONS: ConversionRow[] = [
  { label: '1/4 cup', value: '59 ml' },
  { label: '1/3 cup', value: '79 ml' },
  { label: '1/2 cup', value: '118 ml' },
  { label: '2/3 cup', value: '158 ml' },
  { label: '3/4 cup', value: '177 ml' },
];

const METRIC_TO_US: ConversionRow[] = [
  { label: '1 liter', value: '4.23 cups · 33.8 fl oz' },
  { label: '100 ml', value: '0.42 cups' },
  { label: '250 ml', value: '1.06 cups' },
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

const MEAT_CATEGORIES: MeatCategory[] = [
  {
    name: 'Beef',
    cuts: [
      { cut: 'Steak / roast — rare', temp: '125°F · 52°C', note: 'Rest 3-5 minutes' },
      { cut: 'Steak / roast — medium rare', temp: '135°F · 57°C', note: 'Rest 3-5 minutes' },
      { cut: 'Steak / roast — medium', temp: '145°F · 63°C', note: 'Rest 3-5 minutes' },
      { cut: 'Steak / roast — medium well', temp: '150°F · 66°C', note: 'Rest 3-5 minutes' },
      { cut: 'Steak / roast — well done', temp: '160°F · 71°C', note: 'Rest 3-5 minutes' },
      { cut: 'Ground beef', temp: '160°F · 71°C', note: 'No pink remains' },
      { cut: 'Roast beef', temp: '145°F · 63°C', note: 'Rest 3-5 minutes' },
    ],
  },
  {
    name: 'Pork',
    cuts: [
      { cut: 'Pork chops', temp: '145°F · 63°C', note: 'Rest 3 minutes' },
      { cut: 'Pork roast', temp: '145°F · 63°C', note: 'Rest 3 minutes' },
      { cut: 'Fresh ham', temp: '145°F · 63°C', note: 'Rest 3 minutes' },
      { cut: 'Ground pork', temp: '160°F · 71°C', note: 'No pink remains' },
      { cut: 'Pre-cooked ham, reheating', temp: '140°F · 60°C', note: 'Until steaming hot' },
      { cut: 'Bacon', temp: 'Visual', note: 'Cook until crisp and browned' },
      { cut: 'Sausage', temp: '160°F · 71°C', note: 'No pink remains' },
    ],
  },
  {
    name: 'Poultry',
    cuts: [
      { cut: 'Chicken breast', temp: '165°F · 74°C', note: 'Thickest part, no bone' },
      { cut: 'Chicken thighs', temp: '165°F · 74°C', note: 'Thickest part, no bone' },
      { cut: 'Whole chicken', temp: '165°F · 74°C', note: 'Thigh, away from bone' },
      { cut: 'Turkey breast', temp: '165°F · 74°C', note: 'Thickest part' },
      { cut: 'Whole turkey', temp: '165°F · 74°C', note: 'Thigh, away from bone' },
      { cut: 'Ground poultry', temp: '165°F · 74°C', note: 'No pink remains' },
      { cut: 'Duck breast', temp: '165°F · 74°C', note: 'Thickest part' },
    ],
  },
  {
    name: 'Lamb',
    cuts: [
      { cut: 'Lamb chops', temp: '145°F · 63°C', note: 'Rest 3 minutes' },
      { cut: 'Leg roast', temp: '145°F · 63°C', note: 'Rest 3 minutes' },
      { cut: 'Ground lamb', temp: '160°F · 71°C', note: 'No pink remains' },
      { cut: 'Rack of lamb', temp: '145°F · 63°C', note: 'Rest 3 minutes' },
    ],
  },
  {
    name: 'Fish & Seafood',
    cuts: [
      { cut: 'Fish fillets', temp: '145°F · 63°C', note: 'Flesh opaque and flakes' },
      { cut: 'Shrimp', temp: 'Visual', note: 'Opaque and curled' },
      { cut: 'Scallops', temp: 'Visual', note: 'Opaque and firm' },
      { cut: 'Shellfish', temp: 'Visual', note: 'Shells open when done' },
    ],
  },
  {
    name: 'Eggs & Leftovers',
    cuts: [
      { cut: 'Eggs and egg dishes', temp: '160°F · 71°C', note: 'Yolks and whites firm' },
      { cut: 'Casseroles', temp: '165°F · 74°C', note: 'Until steaming hot' },
      { cut: 'Leftovers', temp: '165°F · 74°C', note: 'Until steaming hot' },
      { cut: 'Game meats', temp: '160°F · 71°C', note: 'Steaks may be 145°F if preferred' },
    ],
  },
];

function ConversionList({ rows }: { rows: ConversionRow[] }) {
  const { theme } = useAppearance();

  return (
    <View style={styles.table}>
      {rows.map((row) => (
        <View
          key={row.label}
          style={[styles.conversionRow, { borderBottomColor: theme.borderLight }]}
        >
          <Text style={[styles.conversionLabel, { color: theme.text }]}>{row.label}</Text>
          <Text style={[styles.conversionValue, { color: theme.textSecondary }]}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

function VolumeSection() {
  const { theme } = useAppearance();

  return (
    <>
      <View style={[styles.subsectionHeader, { borderBottomColor: theme.borderLight }]}>
        <Text style={styles.subsectionTitle}>US Volume</Text>
      </View>
      <ConversionList rows={US_VOLUME} />
      <View style={[styles.subsectionHeader, { borderBottomColor: theme.borderLight }]}>
        <Text style={styles.subsectionTitle}>Common Cup Fractions</Text>
      </View>
      <ConversionList rows={CUP_FRACTIONS} />
      <View style={[styles.subsectionHeader, { borderBottomColor: theme.borderLight }]}>
        <Text style={styles.subsectionTitle}>Metric to US</Text>
      </View>
      <ConversionList rows={METRIC_TO_US} />
    </>
  );
}

function MeatTemperatureSection() {
  const { theme } = useAppearance();
  const [selectedMeat, setSelectedMeat] = useState<string>(MEAT_CATEGORIES[0].name);
  const [selectedCut, setSelectedCut] = useState<string | null>(null);

  const activeCategory = MEAT_CATEGORIES.find((category) => category.name === selectedMeat);
  const activeCuts = activeCategory ? activeCategory.cuts : [];
  const selectedCutData = activeCuts.find((cut) => cut.cut === selectedCut) ?? null;

  return (
    <>
      <View style={styles.chipWrap}>
        {MEAT_CATEGORIES.map((category) => {
          const selected = category.name === selectedMeat;
          return (
            <TouchableOpacity
              key={category.name}
              style={[
                styles.chip,
                { backgroundColor: theme.tipBackground, borderColor: theme.borderLight },
                selected && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
              onPress={() => {
                setSelectedMeat(category.name);
                setSelectedCut(null);
              }}
            >
              <Text
                style={[
                  styles.chipLabel,
                  { color: selected ? theme.white : theme.textSecondary },
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.table}>
        {activeCuts.map((cut) => {
          const selected = cut.cut === selectedCut;
          return (
            <TouchableOpacity
              key={cut.cut}
              style={[
                styles.meatRow,
                { borderBottomColor: theme.borderLight },
                selected && { backgroundColor: theme.tipBackground },
              ]}
              onPress={() => setSelectedCut(selected ? null : cut.cut)}
            >
              <View style={styles.meatTextBlock}>
                <Text style={[styles.meatFood, { color: theme.text }]}>{cut.cut}</Text>
              </View>
              <Ionicons
                name={selected ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={18}
                color={theme.primary}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      {selectedCutData && (
        <View
          style={[
            styles.detailCard,
            { backgroundColor: theme.tipBackground, borderColor: theme.borderLight },
          ]}
        >
          <View style={styles.detailHeader}>
            <Ionicons name="thermometer-outline" size={18} color={theme.primary} />
            <Text style={styles.detailTitle}>{selectedCutData.cut}</Text>
          </View>
          <Text style={[styles.detailTemp, { color: theme.primary }]}>{selectedCutData.temp}</Text>
          <Text style={[styles.detailNote, { color: theme.textSecondary }]}>
            {selectedCutData.note}
          </Text>
        </View>
      )}
    </>
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
  const { theme } = useAppearance();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.borderLight, shadowColor: theme.shadow },
      ]}
    >
      <View style={[styles.cardHeader, { borderBottomColor: theme.borderLight }]}>
        <View style={[styles.iconWrap, { backgroundColor: theme.tipBackground }]}>
          <Ionicons name={icon as any} size={22} color={theme.primary} />
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
  const { theme } = useAppearance();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cooking Cheat Sheet</Text>
        <Text style={styles.headerSubtitle}>
          Common conversions and safe meat temperatures.
        </Text>
      </View>

      <SectionCard
        title="Volume"
        subtitle="US measurements, cup fractions, and metric"
        icon="beaker-outline"
      >
        <VolumeSection />
      </SectionCard>

      <SectionCard title="Weight" subtitle="Ounces, pounds, grams, and kilograms" icon="scale-outline">
        <ConversionList rows={WEIGHT_CONVERSIONS} />
      </SectionCard>

      <SectionCard title="Cup to Grams" subtitle="Common baking and cooking ingredients" icon="nutrition-outline">
        <ConversionList rows={INGREDIENT_WEIGHTS} />
      </SectionCard>

      <SectionCard
        title="Meat Temperatures"
        subtitle="Use a thermometer in the thickest part"
        icon="thermometer-outline"
      >
        <MeatTemperatureSection />
      </SectionCard>

      <View
        style={[
          styles.tipsCard,
          { backgroundColor: theme.card, borderColor: theme.borderLight, shadowColor: theme.shadow },
        ]}
      >
        <Ionicons name="checkmark-circle-outline" size={20} color={theme.success} />
        <View style={styles.tipTextBlock}>
          <Text style={[styles.tipTitle, { color: theme.success }]}>Thermometer tips</Text>
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
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
  subsectionHeader: {
    marginTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  subsectionTitle: {
    ...Typography.sectionLabel,
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
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.tipBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  chipLabelSelected: {
    color: Colors.white,
  },
  meatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  meatRowSelected: {
    backgroundColor: Colors.tipBackground,
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
  detailCard: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.tipBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailTitle: {
    ...Typography.label,
    flex: 1,
  },
  detailTemp: {
    ...Typography.subtitle,
    color: Colors.primary,
    fontWeight: '700',
  },
  detailNote: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
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
