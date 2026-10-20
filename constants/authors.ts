export type AuthorId = 'daddy' | 'princess';

export const AUTHORS: Record<AuthorId, { id: AuthorId; name: string; emoji: string; label: string }> = {
  daddy: {
    id: 'daddy',
    name: 'Daddy',
    emoji: '🍆',
    label: 'Daddy 🍆',
  },
  princess: {
    id: 'princess',
    name: 'Princess',
    emoji: '🍑',
    label: 'Princess 🍑',
  },
};

export const AUTHOR_IDS: AuthorId[] = ['daddy', 'princess'];

export function isAuthorId(value: unknown): value is AuthorId {
  return value === 'daddy' || value === 'princess';
}

export function getAuthorLabel(author: string | null | undefined): string | null {
  return isAuthorId(author) ? AUTHORS[author].label : null;
}

export function getPartnerAuthor(author: AuthorId): AuthorId {
  return author === 'daddy' ? 'princess' : 'daddy';
}
