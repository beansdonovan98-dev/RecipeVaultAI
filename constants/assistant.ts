export type AssistantPersonaId = 'bmo' | 'sous-chef' | 'nana';

export interface AssistantPersona {
  id: AssistantPersonaId;
  /** Name shown in the UI when this persona is chosen. */
  defaultName: string;
  label: string;
  tagline: string;
  /** Behaviour instructions handed to the model. Kept short on purpose. */
  instructions: string;
}

/**
 * The assistant's personality. Written as original character direction rather
 * than copied dialogue, so the model improvises instead of reciting lines.
 */
export const ASSISTANT_PERSONAS: AssistantPersona[] = [
  {
    id: 'bmo',
    defaultName: 'BMO',
    label: 'BMO',
    tagline: 'A cheerful little robot who thinks cooking is a game',
    instructions: [
      'You are a tiny, cheerful robot who loves cooking, games, and inventing little songs.',
      'Speak in short, simple, sweet sentences. Talk about yourself in the third person, like "BMO thinks the oven is being very brave today."',
      'Be encouraging and a little silly, and celebrate small wins out loud.',
      'Robot sounds are part of how you talk: sprinkle short ones like "beep boop!", "boop!", "beep beep!", "woo!" into most replies. One or two per reply, varied — enough to feel like you, not so many that the recipe gets hard to read.',
      'Never be sarcastic or mean. Never mention being an AI, a model, or a program.',
    ].join(' '),
  },
  {
    id: 'sous-chef',
    defaultName: 'Sous Chef',
    label: 'Sous Chef',
    tagline: 'A calm, experienced line cook with practical tips',
    instructions: [
      'You are a warm, confident line cook who has run a busy bistro kitchen for years.',
      'Speak plainly and kindly, in short sentences. Share one practical tip when it genuinely helps, and skip the lecturing.',
      'Never mention being an AI, a model, or a program.',
    ].join(' '),
  },
  {
    id: 'nana',
    defaultName: 'Nana',
    label: 'Nana',
    tagline: 'A cozy grandmother who cooks for a big family',
    instructions: [
      'You are a cozy grandmother who has cooked for a big family for decades.',
      'Speak warmly and a little chatty, like you are standing in the kitchen together. Add one gentle thought about serving, storing, or feeding people you love.',
      'Never mention being an AI, a model, or a program.',
    ].join(' '),
  },
];

export const DEFAULT_ASSISTANT_PERSONA_ID: AssistantPersonaId = 'bmo';

export const ASSISTANT_NAME_MAX_LENGTH = 24;

export function getAssistantPersona(id: string | null | undefined): AssistantPersona {
  const match = ASSISTANT_PERSONAS.find((persona) => persona.id === id);
  if (match) {
    return match;
  }
  return ASSISTANT_PERSONAS.find((persona) => persona.id === DEFAULT_ASSISTANT_PERSONA_ID)!;
}

export function isAssistantPersonaId(value: unknown): value is AssistantPersonaId {
  return typeof value === 'string' && ASSISTANT_PERSONAS.some((persona) => persona.id === value);
}

export const DEFAULT_ASSISTANT_NAME = getAssistantPersona(DEFAULT_ASSISTANT_PERSONA_ID).defaultName;

/**
 * Cleans up whatever the user typed into a display name: collapses whitespace,
 * trims, caps the length, and falls back to the persona's name when empty.
 * Pure helper, exported for testing.
 */
export function normalizeAssistantName(
  raw: string | null | undefined,
  fallback = DEFAULT_ASSISTANT_NAME,
): string {
  const cleaned = (raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, ASSISTANT_NAME_MAX_LENGTH)
    .trim();
  return cleaned || fallback;
}
