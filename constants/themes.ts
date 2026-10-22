export type ThemeKey =
  | 'shinobi'
  | 'southpark'
  | 'halloween'
  | 'sakura'
  | 'ocean'
  | 'forest'
  | 'space'
  | 'candy';

export interface ThemePalette {
  background: string;
  card: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  accentLight: string;
  tipBackground: string;
  tipBorder: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  white: string;
  error: string;
  success: string;
  warning: string;
  heart: string;
  heartEmpty: string;
  inputBackground: string;
  shadow: string;
  overlay: string;
}

/** How a theme treats corners, edges, and shadows. */
export type CardShadowStyle = 'soft' | 'hard' | 'none';

/** Display face used for titles and section labels, separate from the body font. */
export type DisplayFontKey = 'sans' | 'serif' | 'mono' | 'rounded' | 'condensed' | 'comic';

/** Optional decorative wallpaper drawn inside recipe cards. */
export type CardPattern =
  | 'clouds'
  | 'mountains'
  | 'halloween'
  | 'petals'
  | 'ocean'
  | 'forest'
  | 'space'
  | 'candy';

export interface ThemeDesign {
  cardRadius: number;
  cardBorderWidth: number;
  cardShadow: CardShadowStyle;
  displayFont: DisplayFontKey;
  cardPattern?: CardPattern;
}

export interface ThemeOption {
  id: ThemeKey;
  label: string;
  description: string;
  colors: ThemePalette;
  design: ThemeDesign;
}

export const DISPLAY_FONTS: Record<
  DisplayFontKey,
  { ios?: string; android?: string; default?: string }
> = {
  // No family means "use the platform default", which also lets the body font
  // setting win when the user has picked one.
  sans: {},
  serif: { ios: 'Georgia', android: 'serif', default: 'serif' },
  mono: { ios: 'Courier New', android: 'monospace', default: 'monospace' },
  rounded: { ios: 'Arial Rounded MT Bold', android: 'sans-serif-medium' },
  condensed: {
    ios: 'HelveticaNeue-CondensedBold',
    android: 'sans-serif-condensed',
    default: 'sans-serif-condensed',
  },
  comic: {
    ios: 'Chalkboard SE',
    android: 'casual',
    default: 'cursive',
  },
};

export const DEFAULT_THEME_KEY: ThemeKey = 'shinobi';

const TAVERNA: ThemePalette = {
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
};

const RISO: ThemePalette = {
  background: '#F3EFE6',
  card: '#FFFDF7',
  primary: '#1D3FBF',
  primaryLight: '#3A5BE0',
  secondary: '#5A5F7A',
  accent: '#FF4D9D',
  accentLight: '#FF7DB8',
  tipBackground: '#FFE45C',
  tipBorder: '#1D3FBF',
  border: '#1D3FBF',
  borderLight: '#DAD3C5',
  text: '#131A3A',
  textSecondary: '#4B5170',
  textMuted: '#8A8FA8',
  white: '#FFFFFF',
  error: '#D92D20',
  success: '#1F7A45',
  warning: '#C77700',
  heart: '#FF4D9D',
  heartEmpty: '#D9D2C3',
  inputBackground: '#FAF6EC',
  shadow: 'rgba(29, 63, 191, 0.22)',
  overlay: 'rgba(19, 26, 58, 0.55)',
};

const DINER: ThemePalette = {
  background: '#101014',
  card: '#191922',
  primary: '#FF3D8B',
  primaryLight: '#FF6FA9',
  secondary: '#C9C9D6',
  accent: '#22E6C8',
  accentLight: '#6FF5DE',
  tipBackground: '#23232F',
  tipBorder: '#22E6C8',
  border: '#3A3A4C',
  borderLight: '#2C2C3A',
  text: '#F7F5FF',
  textSecondary: '#C9C9D6',
  textMuted: '#8E8EA3',
  white: '#FFFFFF',
  error: '#FF6B6B',
  success: '#3DDC97',
  warning: '#FFC93C',
  heart: '#FF3D8B',
  heartEmpty: '#4A4A5C',
  inputBackground: '#20202B',
  shadow: 'rgba(0, 0, 0, 0.6)',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

const MIDNIGHT: ThemePalette = {
  background: '#0A0F1C',
  card: '#131B2E',
  primary: '#4E7CF0',
  primaryLight: '#7A9DFF',
  secondary: '#B8C4DC',
  accent: '#E8B44A',
  accentLight: '#F5D07E',
  tipBackground: '#1B2540',
  tipBorder: '#E8B44A',
  border: '#2B3A57',
  borderLight: '#24314A',
  text: '#EEF3FF',
  textSecondary: '#B8C4DC',
  textMuted: '#7E8DA8',
  white: '#FFFFFF',
  error: '#FF7B7B',
  success: '#4ADE80',
  warning: '#F5C26B',
  heart: '#FF7B7B',
  heartEmpty: '#3B4A66',
  inputBackground: '#1A2440',
  shadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

const SEAGLASS: ThemePalette = {
  background: '#E6F5F0',
  card: '#FFFFFF',
  primary: '#0F5C52',
  primaryLight: '#1B7A6D',
  secondary: '#4A6B66',
  accent: '#FF7A5C',
  accentLight: '#FF9B84',
  tipBackground: '#D3EDE6',
  tipBorder: '#0F5C52',
  border: '#0F5C52',
  borderLight: '#BFDDD5',
  text: '#0B3B36',
  textSecondary: '#4A6B66',
  textMuted: '#7C9993',
  white: '#FFFFFF',
  error: '#C0392B',
  success: '#14805E',
  warning: '#C77D00',
  heart: '#E05A45',
  heartEmpty: '#A8C9C1',
  inputBackground: '#F0FAF7',
  shadow: 'rgba(15, 92, 82, 0.14)',
  overlay: 'rgba(11, 59, 54, 0.55)',
};

const BUTTER: ThemePalette = {
  background: '#FFF2CC',
  card: '#FFFDF6',
  primary: '#3F2417',
  primaryLight: '#5C3825',
  secondary: '#8A6A55',
  accent: '#D6336C',
  accentLight: '#F06292',
  tipBackground: '#FFE1EA',
  tipBorder: '#3F2417',
  border: '#3F2417',
  borderLight: '#EAD6A8',
  text: '#2E1A10',
  textSecondary: '#6B4C3A',
  textMuted: '#A08674',
  white: '#FFFFFF',
  error: '#B3261E',
  success: '#2F7A46',
  warning: '#B26B00',
  heart: '#D6336C',
  heartEmpty: '#DCC49B',
  inputBackground: '#FFF8E3',
  shadow: 'rgba(63, 36, 23, 0.18)',
  overlay: 'rgba(46, 26, 16, 0.55)',
};

const NEWSPRINT: ThemePalette = {
  background: '#F4EFE3',
  card: '#FFFDF6',
  primary: '#1A1A18',
  primaryLight: '#3D3D38',
  secondary: '#57534E',
  accent: '#B3261E',
  accentLight: '#D4483C',
  tipBackground: '#EAE3D2',
  tipBorder: '#1A1A18',
  border: '#1A1A18',
  borderLight: '#D9D2C2',
  text: '#141412',
  textSecondary: '#57534E',
  textMuted: '#8A8378',
  white: '#FFFFFF',
  error: '#B3261E',
  success: '#2F6B3F',
  warning: '#A15C00',
  heart: '#B3261E',
  heartEmpty: '#C9C1B0',
  inputBackground: '#F7F3E9',
  shadow: 'rgba(20, 20, 18, 0.14)',
  overlay: 'rgba(20, 20, 18, 0.6)',
};

const CITRUS: ThemePalette = {
  background: '#FFF7D6',
  card: '#FFFFFF',
  primary: '#365314',
  primaryLight: '#4D7C0F',
  secondary: '#5F6B4F',
  accent: '#F59E0B',
  accentLight: '#FBBF24',
  tipBackground: '#FDF3C4',
  tipBorder: '#365314',
  border: '#365314',
  borderLight: '#EBDFA8',
  text: '#27300F',
  textSecondary: '#5F6B4F',
  textMuted: '#8F9779',
  white: '#FFFFFF',
  error: '#B42318',
  success: '#3F6212',
  warning: '#B45309',
  heart: '#E11D48',
  heartEmpty: '#D9D2A8',
  inputBackground: '#FFFBE7',
  shadow: 'rgba(54, 83, 20, 0.15)',
  overlay: 'rgba(39, 48, 15, 0.55)',
};

const LAVENDER: ThemePalette = {
  background: '#F4EEFF',
  card: '#FFFFFF',
  primary: '#5B21B6',
  primaryLight: '#7C3AED',
  secondary: '#6B5B95',
  accent: '#A855F7',
  accentLight: '#C084FC',
  tipBackground: '#EBDDFF',
  tipBorder: '#5B21B6',
  border: '#5B21B6',
  borderLight: '#DDD0F5',
  text: '#2E1065',
  textSecondary: '#6B5B95',
  textMuted: '#9585B8',
  white: '#FFFFFF',
  error: '#BE123C',
  success: '#15803D',
  warning: '#B45309',
  heart: '#DB2777',
  heartEmpty: '#CBB8E8',
  inputBackground: '#F8F3FF',
  shadow: 'rgba(91, 33, 182, 0.16)',
  overlay: 'rgba(46, 16, 101, 0.55)',
};

const SAKURA: ThemePalette = {
  background: '#FFF0F5',
  card: '#FFFFFF',
  primary: '#9D174D',
  primaryLight: '#BE185D',
  secondary: '#9F6B7E',
  accent: '#F472B6',
  accentLight: '#F9A8D4',
  tipBackground: '#FFE0EC',
  tipBorder: '#9D174D',
  border: '#9D174D',
  borderLight: '#F5CFDD',
  text: '#4C0519',
  textSecondary: '#9F6B7E',
  textMuted: '#BC93A3',
  white: '#FFFFFF',
  error: '#B91C1C',
  success: '#15803D',
  warning: '#B45309',
  heart: '#DB2777',
  heartEmpty: '#E9C3D3',
  inputBackground: '#FFF6F9',
  shadow: 'rgba(157, 23, 77, 0.14)',
  overlay: 'rgba(76, 5, 25, 0.55)',
};

const EMBER: ThemePalette = {
  background: '#160D0A',
  card: '#221410',
  primary: '#EA580C',
  primaryLight: '#FB923C',
  secondary: '#D6C3B8',
  accent: '#FBBF24',
  accentLight: '#FCD34D',
  tipBackground: '#2C1A13',
  tipBorder: '#FBBF24',
  border: '#4A2C20',
  borderLight: '#38211A',
  text: '#FFF3EA',
  textSecondary: '#D6C3B8',
  textMuted: '#9C8072',
  white: '#FFFFFF',
  error: '#FF7A6B',
  success: '#4ADE80',
  warning: '#FBBF24',
  heart: '#FF6B6B',
  heartEmpty: '#553229',
  inputBackground: '#2A1912',
  shadow: 'rgba(0, 0, 0, 0.55)',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

const BLUEPRINT: ThemePalette = {
  background: '#0A1F38',
  card: '#0F2C4C',
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  secondary: '#B6D4F0',
  accent: '#7DD3FC',
  accentLight: '#BAE6FD',
  tipBackground: '#14395F',
  tipBorder: '#7DD3FC',
  border: '#2C5A86',
  borderLight: '#1D4368',
  text: '#E8F4FF',
  textSecondary: '#B6D4F0',
  textMuted: '#7EA3C4',
  white: '#FFFFFF',
  error: '#FF7B7B',
  success: '#4ADE80',
  warning: '#FCD34D',
  heart: '#FF8FA3',
  heartEmpty: '#33536F',
  inputBackground: '#123454',
  shadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(4, 14, 26, 0.7)',
};

const SOUTHPARK: ThemePalette = {
  background: '#B8D8F0',
  card: '#F5F0E1',
  primary: '#1F4E79',
  primaryLight: '#4A7BA7',
  secondary: '#2C5F8A',
  accent: '#E63946',
  accentLight: '#FF6B6B',
  tipBackground: '#FFF176',
  tipBorder: '#1F4E79',
  border: '#1F4E79',
  borderLight: '#B0C9DD',
  text: '#1A2A3A',
  textSecondary: '#3A5A7A',
  textMuted: '#7A9AB8',
  white: '#FFFFFF',
  error: '#D92D20',
  success: '#2D7A3E',
  warning: '#C77700',
  heart: '#E63946',
  heartEmpty: '#B0C9DD',
  inputBackground: '#EAF4FB',
  shadow: 'rgba(31, 78, 121, 0.2)',
  overlay: 'rgba(10, 30, 50, 0.55)',
};

const HALLOWEEN: ThemePalette = {
  background: '#2D1B3D',
  card: '#FFFFFF',
  primary: '#E65100',
  primaryLight: '#FF8A50',
  secondary: '#AB47BC',
  accent: '#AB47BC',
  accentLight: '#CE93D8',
  tipBackground: '#FFF9C4',
  tipBorder: '#E65100',
  border: '#E65100',
  borderLight: '#FFCC80',
  text: '#F3E5F5',
  textSecondary: '#CE93D8',
  textMuted: '#AB47BC',
  white: '#FFFFFF',
  error: '#D92D20',
  success: '#2E7D32',
  warning: '#F57C00',
  heart: '#E65100',
  heartEmpty: '#FFCC80',
  inputBackground: '#FFF3E0',
  shadow: 'rgba(230, 81, 0, 0.2)',
  overlay: 'rgba(62, 39, 35, 0.55)',
};

const SHINOBI: ThemePalette = {
  background: '#F6E6C8',
  card: '#FFFBF2',
  primary: '#D94F00',
  primaryLight: '#F97316',
  secondary: '#1E2A44',
  accent: '#C1121F',
  accentLight: '#E63946',
  tipBackground: '#FCE7C0',
  tipBorder: '#1E2A44',
  border: '#14181F',
  borderLight: '#E4D2AC',
  text: '#1B1B1F',
  textSecondary: '#4A4E5A',
  textMuted: '#8A8172',
  white: '#FFFFFF',
  error: '#B3261E',
  success: '#2F6B3F',
  warning: '#B45309',
  heart: '#C1121F',
  heartEmpty: '#D9C7A4',
  inputBackground: '#FFF7E8',
  shadow: 'rgba(20, 24, 31, 0.9)',
  overlay: 'rgba(20, 24, 31, 0.6)',
};
const OCEAN: ThemePalette = {
  background: '#E0F7FA',
  card: '#FFFFFF',
  primary: '#006064',
  primaryLight: '#00838F',
  secondary: '#004D40',
  accent: '#00BCD4',
  accentLight: '#4DD0E1',
  tipBackground: '#B2EBF2',
  tipBorder: '#006064',
  border: '#006064',
  borderLight: '#B2DFDB',
  text: '#00363A',
  textSecondary: '#004D40',
  textMuted: '#4DB6AC',
  white: '#FFFFFF',
  error: '#D32F2F',
  success: '#2E7D32',
  warning: '#F57C00',
  heart: '#00BCD4',
  heartEmpty: '#B2DFDB',
  inputBackground: '#E0F2F1',
  shadow: 'rgba(0, 96, 100, 0.2)',
  overlay: 'rgba(0, 54, 58, 0.55)',
};

const FOREST: ThemePalette = {
  background: '#E8F5E9',
  card: '#FFFFFF',
  primary: '#2E7D32',
  primaryLight: '#43A047',
  secondary: '#1B5E20',
  accent: '#8BC34A',
  accentLight: '#AED581',
  tipBackground: '#C8E6C9',
  tipBorder: '#2E7D32',
  border: '#2E7D32',
  borderLight: '#A5D6A7',
  text: '#1B3A1E',
  textSecondary: '#2E5A31',
  textMuted: '#66BB6A',
  white: '#FFFFFF',
  error: '#D32F2F',
  success: '#1B5E20',
  warning: '#F57C00',
  heart: '#8BC34A',
  heartEmpty: '#A5D6A7',
  inputBackground: '#F1F8E9',
  shadow: 'rgba(46, 125, 50, 0.2)',
  overlay: 'rgba(27, 58, 30, 0.55)',
};

const SPACE: ThemePalette = {
  background: '#0D1B2A',
  card: '#1B2838',
  primary: '#7C4DFF',
  primaryLight: '#9C7CFF',
  secondary: '#4A5568',
  accent: '#00E5FF',
  accentLight: '#64FFDA',
  tipBackground: '#1A237E',
  tipBorder: '#7C4DFF',
  border: '#7C4DFF',
  borderLight: '#2D3748',
  text: '#E0E0E0',
  textSecondary: '#B0BEC5',
  textMuted: '#78909C',
  white: '#FFFFFF',
  error: '#FF5252',
  success: '#69F0AE',
  warning: '#FFD740',
  heart: '#00E5FF',
  heartEmpty: '#4A5568',
  inputBackground: '#263238',
  shadow: 'rgba(124, 77, 255, 0.3)',
  overlay: 'rgba(13, 27, 42, 0.7)',
};

const CANDY: ThemePalette = {
  background: '#FCE4EC',
  card: '#FFFFFF',
  primary: '#E91E63',
  primaryLight: '#F06292',
  secondary: '#AD1457',
  accent: '#FF4081',
  accentLight: '#FF80AB',
  tipBackground: '#FFF8E1',
  tipBorder: '#E91E63',
  border: '#E91E63',
  borderLight: '#F8BBD0',
  text: '#4A102A',
  textSecondary: '#880E4F',
  textMuted: '#C2185B',
  white: '#FFFFFF',
  error: '#D32F2F',
  success: '#2E7D32',
  warning: '#F57C00',
  heart: '#FF4081',
  heartEmpty: '#F8BBD0',
  inputBackground: '#FDE7F3',
  shadow: 'rgba(233, 30, 99, 0.2)',
  overlay: 'rgba(74, 16, 42, 0.55)',
};


export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'shinobi',
    label: 'Shinobi',
    description: 'Ninja orange with spiraled red cloud cards',
    colors: SHINOBI,
    design: {
      cardRadius: 8,
      cardBorderWidth: 2,
      cardShadow: 'hard',
      displayFont: 'condensed',
      cardPattern: 'clouds',
    },
  },
  {
    id: 'southpark',
    label: 'South Park',
    description: 'Construction-paper peaks, blue sky, and a yellow sun',
    colors: SOUTHPARK,
    design: {
      cardRadius: 12,
      cardBorderWidth: 2,
      cardShadow: 'hard',
      displayFont: 'comic',
      cardPattern: 'mountains',
    },
  },
  {
    id: 'halloween',
    label: 'Halloween',
    description: 'Friendly ghosts, pumpkins, and candy corn on a warm autumn night',
    colors: HALLOWEEN,
    design: {
      cardRadius: 16,
      cardBorderWidth: 2,
      cardShadow: 'soft',
      displayFont: 'rounded',
      cardPattern: 'halloween',
    },
  },
  {
    id: 'sakura',
    label: 'Sakura',
    description: 'Blush pink with a blossoming branch and drifting petals',
    colors: SAKURA,
    design: {
      cardRadius: 16,
      cardBorderWidth: 1,
      cardShadow: 'soft',
      displayFont: 'serif',
      cardPattern: 'petals',
    },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    description: 'Deep sea blues with bubbles, coral, and drifting waves',
    colors: OCEAN,
    design: {
      cardRadius: 14,
      cardBorderWidth: 1,
      cardShadow: 'soft',
      displayFont: 'rounded',
      cardPattern: 'ocean',
    },
  },
  {
    id: 'forest',
    label: 'Forest',
    description: 'Enchanted woodland with trees, mushrooms, and fireflies',
    colors: FOREST,
    design: {
      cardRadius: 14,
      cardBorderWidth: 1,
      cardShadow: 'soft',
      displayFont: 'serif',
      cardPattern: 'forest',
    },
  },
  {
    id: 'space',
    label: 'Space',
    description: 'Deep cosmos with stars, planets, and nebulas',
    colors: SPACE,
    design: {
      cardRadius: 8,
      cardBorderWidth: 1,
      cardShadow: 'none',
      displayFont: 'mono',
      cardPattern: 'space',
    },
  },
  {
    id: 'candy',
    label: 'Candy',
    description: 'Sweet shop with lollipops, sprinkles, and chocolate',
    colors: CANDY,
    design: {
      cardRadius: 20,
      cardBorderWidth: 2,
      cardShadow: 'soft',
      displayFont: 'rounded',
      cardPattern: 'candy',
    },
  },
];

export function isThemeKey(value: unknown): value is ThemeKey {
  return THEME_OPTIONS.some((option) => option.id === value);
}

export function getThemePalette(key: ThemeKey): ThemePalette {
  return THEME_OPTIONS.find((option) => option.id === key)?.colors ?? TAVERNA;
}

export function getThemeDesign(key: ThemeKey): ThemeDesign {
  return (
    THEME_OPTIONS.find((option) => option.id === key)?.design ?? THEME_OPTIONS[0].design
  );
}

export interface CardStyleTokens {
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

/**
 * Shared card treatment for a theme: rounded paper, thick screen-printed
 * outlines, or a flat diner counter depending on the design.
 */
export function themeCardStyle(design: ThemeDesign, palette: ThemePalette): CardStyleTokens {
  if (design.cardShadow === 'hard') {
    return {
      borderRadius: design.cardRadius,
      borderWidth: design.cardBorderWidth,
      borderColor: palette.border,
      shadowColor: palette.border,
      shadowOffset: { width: 5, height: 5 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    };
  }

  if (design.cardShadow === 'none') {
    return {
      borderRadius: design.cardRadius,
      borderWidth: design.cardBorderWidth,
      borderColor: palette.borderLight,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    };
  }

  return {
    borderRadius: design.cardRadius,
    borderWidth: design.cardBorderWidth,
    borderColor: palette.borderLight,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  };
}
