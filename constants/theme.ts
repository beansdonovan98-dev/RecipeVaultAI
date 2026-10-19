export const Colors = {
  background: '#FAF7F2',
  card: '#FFFFFF',
  primary: '#1B2A4A',
  primaryLight: '#2D4A7A',
  secondary: '#4A5568',
  accent: '#8B6F47',
  accentLight: '#A68B6B',
  tipBackground: '#E8EDF2',
  tipBorder: '#1B2A4A',
  border: '#1B2A4A',
  borderLight: '#E2E8F0',
  text: '#1B2A4A',
  textSecondary: '#4A5568',
  textMuted: '#718096',
  white: '#FFFFFF',
  error: '#E53E3E',
  success: '#38A169',
  warning: '#D69E2E',
  heart: '#E53E3E',
  heartEmpty: '#CBD5E0',
  inputBackground: '#F7FAFC',
  shadow: 'rgba(27, 42, 74, 0.08)',
  overlay: 'rgba(27, 42, 74, 0.5)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
} as const;

export const Typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.primary,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary,
    lineHeight: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.accent,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primary,
    lineHeight: 26,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: 11,
    fontWeight: '400' as const,
    color: Colors.textMuted,
    lineHeight: 16,
  },
} as const;

export const Shadows = {
  card: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;
