export const Colors = {
  background: '#F3E7D3',
  card: '#FFFBF2',
  primary: '#3A2A1F',
  primaryLight: '#5A4334',
  secondary: '#6E5A48',
  accent: '#C2542C',
  accentLight: '#E0703F',
  tipBackground: '#EFE0C8',
  tipBorder: '#3A2A1F',
  border: '#3A2A1F',
  borderLight: '#DFCBB0',
  text: '#2E211A',
  textSecondary: '#6E5A48',
  textMuted: '#9A8573',
  white: '#FFFFFF',
  error: '#B3261E',
  success: '#3F6B3B',
  warning: '#B7791F',
  heart: '#B3261E',
  heartEmpty: '#C9B49A',
  inputBackground: '#F7EDDD',
  shadow: 'rgba(58, 42, 31, 0.16)',
  overlay: 'rgba(46, 33, 26, 0.55)',
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
